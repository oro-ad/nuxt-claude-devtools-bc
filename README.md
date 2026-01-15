# @oro.ad/nuxt-claude-devtools-bc

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt module for automatic Vite dev server configuration with tunnels (Cloudflare, ngrok, etc.) and DevTools integration for Business Console.

## Problem

When running Nuxt dev server through a tunnel (e.g., `bc-xxx.domain.com` -> `localhost:3000`):

1. **MIME type errors** - Vite serves CSS as module script
2. **HMR doesn't work** - WebSocket tries to connect to localhost instead of public domain
3. **Modules don't load** - `origin` points to localhost

```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/css"
WebSocket connection to 'wss://localhost:5173/_nuxt/' failed
[vite] failed to connect to websocket
```

## Solution

This module automatically configures Vite dev server for tunnel environments by reading the `DEV_TUNNEL_HOST` environment variable.

## Features

- Automatic Vite dev server configuration for tunnels
- Support for Cloudflare Tunnel, ngrok, and other reverse proxies
- Nuxt DevTools integration with tunnel status display
- **Auto-disable DevTools authorization** for tunnel access
- `useTunnel()` composable for runtime access to tunnel config
- Environment variable and config-based configuration

## Quick Setup

1. Add `@oro.ad/nuxt-claude-devtools-bc` dependency to your project

```bash
npm install @oro.ad/nuxt-claude-devtools-bc
```

2. Add module to `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ['@oro.ad/nuxt-claude-devtools-bc'],
})
```

3. Run with tunnel host

```bash
# Option 1: Inline environment variable
DEV_TUNNEL_HOST=my-app.trycloudflare.com npm run dev

# Option 2: .env.local (gitignored)
echo "DEV_TUNNEL_HOST=my-app.trycloudflare.com" > .env.local
npm run dev
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEV_TUNNEL_HOST` | Public tunnel domain (without protocol) | - |
| `DEV_TUNNEL_PROTOCOL` | Protocol (`http` or `https`) | `https` |
| `DEV_TUNNEL_PORT` | HMR WebSocket port | `443` for https, `80` for http |

### nuxt.config.ts Options

```ts
export default defineNuxtConfig({
  modules: ['@oro.ad/nuxt-claude-devtools-bc'],

  claudeDevtoolsBc: {
    tunnel: {
      // Explicit host (overrides env variable)
      host: 'my-tunnel.domain.com',
      protocol: 'https',
      port: 443,

      // Additional allowed hosts
      additionalHosts: ['staging.domain.com'],

      // Disable tunnel configuration
      enabled: true,
    },

    // Enable/disable DevTools tab
    devtools: true,

    // Auto-disable DevTools authorization when tunnel is active (default: true)
    // Set to false to keep authorization enabled
    disableDevtoolsAuth: true,
  },
})
```

### DevTools Authorization

When a tunnel is configured, the module **automatically disables Nuxt DevTools authorization**. This is required because DevTools auth doesn't work through tunnels/proxies.

To keep authorization enabled (not recommended for tunnel usage):

```ts
claudeDevtoolsBc: {
  disableDevtoolsAuth: false,
}
```

## Usage

### useTunnel() Composable

Access tunnel configuration in your components:

```vue
<script setup>
const tunnel = useTunnel()
</script>

<template>
  <div v-if="tunnel.isActive.value">
    Tunnel active: {{ tunnel.origin.value }}
  </div>
</template>
```

### DevTools Integration

Open Nuxt DevTools and navigate to the "Claude BC" tab to see:
- Current tunnel status
- Connection details (host, protocol, HMR config)
- Environment variables

## Testing with Cloudflare Tunnel

```bash
# Terminal 1: Start tunnel
cloudflared tunnel --url http://localhost:3000
# Get URL like: https://random-words.trycloudflare.com

# Terminal 2: Start Nuxt
DEV_TUNNEL_HOST=random-words.trycloudflare.com npm run dev
```

## Business Console Integration

For Business Console spawner scripts:

```bash
#!/bin/bash
SESSION_CODE=$1
DEV_DOMAIN=$2

export DEV_TUNNEL_HOST="bc-${SESSION_CODE}.${DEV_DOMAIN}"
npm run dev
```

## What This Module Configures

When `DEV_TUNNEL_HOST` is set, the module automatically configures:

### Vite Dev Server

```ts
{
  vite: {
    server: {
      allowedHosts: [tunnelHost, 'localhost'],
      origin: `https://${tunnelHost}`,
      hmr: {
        protocol: 'wss',
        host: tunnelHost,
        clientPort: 443
      }
    }
  }
}
```

### DevTools Authorization

```ts
{
  devtools: {
    disableAuthorization: true  // Allows access through tunnel
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with playground
npm run dev

# Run ESLint
npm run lint

# Build
npm run prepack
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@oro.ad/nuxt-claude-devtools-bc/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@oro.ad/nuxt-claude-devtools-bc

[npm-downloads-src]: https://img.shields.io/npm/dm/@oro.ad/nuxt-claude-devtools-bc.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@oro.ad/nuxt-claude-devtools-bc

[license-src]: https://img.shields.io/npm/l/@oro.ad/nuxt-claude-devtools-bc.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@oro.ad/nuxt-claude-devtools-bc

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt
[nuxt-href]: https://nuxt.com
