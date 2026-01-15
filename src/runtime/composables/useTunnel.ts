import { computed } from 'vue'
import { useRuntimeConfig } from '#app'

export interface TunnelInfo {
  host: string
  protocol: 'http' | 'https'
  port: number
  origin: string
}

export function useTunnel() {
  const config = useRuntimeConfig()
  const tunnelConfig = config.public?.claudeDevtoolsBc?.tunnel as TunnelInfo | null | undefined

  return {
    isActive: computed(() => !!tunnelConfig),
    origin: computed(() => tunnelConfig?.origin ?? null),
    host: computed(() => tunnelConfig?.host ?? null),
    config: tunnelConfig ?? null,
  }
}
