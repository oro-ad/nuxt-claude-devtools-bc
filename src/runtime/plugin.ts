import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const tunnelConfig = config.public.claudeDevtoolsBc?.tunnel

  if (import.meta.dev && tunnelConfig) {
    console.log(
      `%c[Claude DevTools BC]%c Tunnel active: ${tunnelConfig.origin}`,
      'background: #10b981; color: white; padding: 2px 6px; border-radius: 3px;',
      'color: #10b981;',
    )
  }

  return {
    provide: {
      claudeDevtoolsBc: {
        tunnel: tunnelConfig,
        isTunnelActive: tunnelConfig !== null,
      },
    },
  }
})
