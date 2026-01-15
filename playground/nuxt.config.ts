import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'

export default defineNuxtConfig({

  modules: [
    /**
     * Claude DevTools BC module
     */
    '../src/module',
    /**
     * Start a sub Nuxt Server for developing the client
     *
     * The terminal output can be found in the Terminals tab of the devtools.
     */
    defineNuxtModule({
      setup(_, nuxt) {
        if (!nuxt.options.dev) {
          return
        }

        const _process = startSubprocess(
          {
            command: 'npx',
            args: ['nuxi', 'dev', '--port', '3300'],
            cwd: resolve(__dirname, '../client'),
          },
          {
            id: 'claude-devtools-bc:client',
            name: 'Claude DevTools BC Client',
          },
        )
      },
    }),
  ],
  devtools: {
    enabled: true,
  },

  compatibilityDate: '2024-08-21',

  // Configure the module (you can also use DEV_TUNNEL_HOST env variable)
  claudeDevtoolsBc: {
    tunnel: {
      // Uncomment to test with a specific host
      // host: 'test.example.com',
      // protocol: 'https',
      // port: 443,
    },
    devtools: true,
  },
})
