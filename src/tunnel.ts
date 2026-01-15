/**
 * Tunnel configuration utilities
 * Can be used by other modules to detect and configure tunnel settings
 *
 * @example
 * ```ts
 * // In another Nuxt module
 * import { getTunnelConfig } from '@oro.ad/nuxt-claude-devtools-bc/tunnel'
 *
 * export default defineNuxtModule({
 *   setup(options, nuxt) {
 *     const tunnel = getTunnelConfig()
 *     if (tunnel) {
 *       console.log('Tunnel active:', tunnel.origin)
 *     }
 *   }
 * })
 * ```
 */

export interface TunnelConfig {
  /**
   * Tunnel host (without protocol)
   * @example 'my-app.trycloudflare.com'
   */
  host: string

  /**
   * Protocol for tunnel connection
   */
  protocol: 'http' | 'https'

  /**
   * Port for WebSocket connections (HMR, Socket.io, etc.)
   */
  port: number

  /**
   * WebSocket protocol
   */
  wsProtocol: 'ws' | 'wss'

  /**
   * Full origin URL
   * @example 'https://my-app.trycloudflare.com'
   */
  origin: string

  /**
   * List of allowed hosts for Vite server
   */
  allowedHosts: string[]
}

export interface TunnelOptions {
  /**
   * Tunnel host (without protocol)
   * @default process.env.DEV_TUNNEL_HOST
   */
  host?: string

  /**
   * Protocol for tunnel connection
   * @default process.env.DEV_TUNNEL_PROTOCOL || 'https'
   */
  protocol?: 'http' | 'https'

  /**
   * Port for WebSocket connections
   * @default process.env.DEV_TUNNEL_PORT || 443 (https) / 80 (http)
   */
  port?: number

  /**
   * Additional allowed hosts for Vite server
   * @default []
   */
  additionalHosts?: string[]
}

/**
 * Resolve tunnel configuration from options and environment variables
 *
 * Priority:
 * 1. Explicit options
 * 2. Environment variables (DEV_TUNNEL_HOST, DEV_TUNNEL_PROTOCOL, DEV_TUNNEL_PORT)
 * 3. Defaults
 *
 * @param options - Optional tunnel configuration overrides
 * @returns Resolved tunnel config or null if no tunnel host is configured
 *
 * @example
 * ```ts
 * // Auto-detect from environment
 * const tunnel = getTunnelConfig()
 *
 * // With explicit options
 * const tunnel = getTunnelConfig({ host: 'my-tunnel.com' })
 *
 * // Use in Socket.io configuration
 * if (tunnel) {
 *   const io = new Server(server, {
 *     cors: { origin: [tunnel.origin, 'http://localhost:3000'] }
 *   })
 * }
 * ```
 */
export function getTunnelConfig(options: TunnelOptions = {}): TunnelConfig | null {
  // Get host from options or environment
  const host = options.host || process.env.DEV_TUNNEL_HOST

  if (!host) {
    return null
  }

  const protocol = options.protocol
    || (process.env.DEV_TUNNEL_PROTOCOL as 'http' | 'https')
    || 'https'

  const port = options.port
    || Number(process.env.DEV_TUNNEL_PORT)
    || (protocol === 'https' ? 443 : 80)

  const wsProtocol = protocol === 'https' ? 'wss' : 'ws'

  const allowedHosts = [
    host,
    'localhost',
    ...(options.additionalHosts || []),
  ]

  return {
    host,
    protocol,
    port,
    wsProtocol,
    origin: `${protocol}://${host}`,
    allowedHosts,
  }
}

/**
 * Check if tunnel is currently active (DEV_TUNNEL_HOST is set)
 */
export function isTunnelActive(): boolean {
  return !!process.env.DEV_TUNNEL_HOST
}

/**
 * Get tunnel origin URL or null
 * Shorthand for getTunnelConfig()?.origin
 */
export function getTunnelOrigin(): string | null {
  return getTunnelConfig()?.origin ?? null
}
