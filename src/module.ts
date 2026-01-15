import { defineNuxtModule, addPlugin, createResolver, useLogger, addImports, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'
import { setupDevToolsUI } from './devtools'
import { getTunnelConfig, type TunnelConfig, type TunnelOptions } from './tunnel'

// Re-export tunnel utilities for external use
export { getTunnelConfig, isTunnelActive, getTunnelOrigin } from './tunnel'
export type { TunnelConfig, TunnelOptions } from './tunnel'

const logger = useLogger('@oro.ad/nuxt-claude-devtools-bc')

export interface ModuleOptions {
  /**
   * Tunnel configuration for dev server
   */
  tunnel?: TunnelOptions & {
    /**
     * Enable/disable tunnel configuration
     * @default true (but only applies config if host is set)
     */
    enabled?: boolean
  }

  /**
   * Enable Nuxt Devtools integration
   * @default true
   */
  devtools?: boolean

  /**
   * Disable Nuxt DevTools authorization when tunnel is active.
   * Required for accessing DevTools through tunnel.
   * @default true (auto-disables auth when tunnel is configured)
   */
  disableDevtoolsAuth?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@oro.ad/nuxt-claude-devtools-bc',
    configKey: 'claudeDevtoolsBc',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },

  defaults: {
    tunnel: {
      enabled: true,
      protocol: 'https',
      additionalHosts: [],
    },
    devtools: true,
    disableDevtoolsAuth: true,
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Store resolved config for runtime access
    let resolvedTunnel: TunnelConfig | null = null

    // Configure tunnel only in development mode
    if (nuxt.options.dev) {
      // Check if tunnel is enabled
      if (options.tunnel?.enabled !== false) {
        resolvedTunnel = getTunnelConfig(options.tunnel)

        if (resolvedTunnel) {
          logger.info(`Configuring for tunnel: ${resolvedTunnel.origin}`)

          // Merge Vite config using defu (won't override existing values)
          nuxt.options.vite = defu(nuxt.options.vite, {
            server: {
              allowedHosts: resolvedTunnel.allowedHosts,
              origin: resolvedTunnel.origin,
              hmr: {
                protocol: resolvedTunnel.wsProtocol,
                host: resolvedTunnel.host,
                clientPort: resolvedTunnel.port,
              },
            },
          })

          // Disable DevTools authorization for tunnel access
          if (options.disableDevtoolsAuth !== false) {
            // @ts-expect-error - devtools options may not be typed
            nuxt.options.devtools = defu(nuxt.options.devtools, {
              disableAuthorization: true,
            })
            logger.info('DevTools authorization disabled for tunnel access')
          }

          logger.info('Vite server configured:')
          logger.info(`  Origin: ${resolvedTunnel.origin}`)
          logger.info(`  HMR: ${resolvedTunnel.wsProtocol}://${resolvedTunnel.host}:${resolvedTunnel.port}`)
          logger.info(`  Allowed hosts: ${resolvedTunnel.allowedHosts.join(', ')}`)
        }
        else {
          logger.info('No tunnel host configured (set DEV_TUNNEL_HOST env or tunnel.host option)')
        }
      }
      else {
        logger.info('Tunnel configuration disabled')
      }
    }

    // Provide tunnel config to runtime
    nuxt.options.runtimeConfig.public.claudeDevtoolsBc = {
      tunnel: resolvedTunnel
        ? {
            host: resolvedTunnel.host,
            protocol: resolvedTunnel.protocol,
            port: resolvedTunnel.port,
            origin: resolvedTunnel.origin,
          }
        : null,
    }

    // Add runtime plugin
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Add composables auto-import
    addImports({
      name: 'useTunnel',
      as: 'useTunnel',
      from: resolver.resolve('./runtime/composables/useTunnel'),
    })

    // Add server API for DevTools
    addServerHandler({
      route: '/api/__claude-devtools-bc-config',
      handler: resolver.resolve('./runtime/server/api/__claude-devtools-bc-config.get'),
    })

    // Setup DevTools UI
    if (options.devtools && nuxt.options.dev) {
      setupDevToolsUI(nuxt, resolver, resolvedTunnel)
    }
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    claudeDevtoolsBc?: ModuleOptions
  }

  interface NuxtOptions {
    claudeDevtoolsBc?: ModuleOptions
  }

  interface PublicRuntimeConfig {
    claudeDevtoolsBc?: {
      tunnel: {
        host: string
        protocol: 'http' | 'https'
        port: number
        origin: string
      } | null
    }
  }
}
