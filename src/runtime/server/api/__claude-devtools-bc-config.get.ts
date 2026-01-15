import { defineEventHandler, useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    tunnel: config.public.claudeDevtoolsBc?.tunnel ?? null,
    env: {
      DEV_TUNNEL_HOST: process.env.DEV_TUNNEL_HOST || null,
      DEV_TUNNEL_PROTOCOL: process.env.DEV_TUNNEL_PROTOCOL || null,
      DEV_TUNNEL_PORT: process.env.DEV_TUNNEL_PORT || null,
    },
  }
})
