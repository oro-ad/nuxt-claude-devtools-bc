<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import { ref, onMounted } from 'vue'

const client = useDevtoolsClient()

interface TunnelConfig {
  host: string
  protocol: 'http' | 'https'
  port: number
  wsProtocol: 'ws' | 'wss'
  origin: string
  allowedHosts: string[]
}

interface ModuleConfig {
  tunnel: TunnelConfig | null
  env: {
    DEV_TUNNEL_HOST: string | null
    DEV_TUNNEL_PROTOCOL: string | null
    DEV_TUNNEL_PORT: string | null
  }
}

const config = ref<ModuleConfig | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchConfig() {
  try {
    loading.value = true

    const response = await fetch('/api/__claude-devtools-bc-config')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    config.value = await response.json()
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load config'
  }
  finally {
    loading.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <div class="relative p-6 n-bg-base flex flex-col h-screen">
    <div class="flex items-center gap-3 mb-4">
      <div class="i-carbon-connection-signal text-2xl" :class="config?.tunnel ? 'text-green' : 'text-gray'" />
      <h1 class="text-2xl font-bold">
        Claude DevTools BC
      </h1>
    </div>

    <div class="opacity-50 mb-6">
      Tunnel Configuration for Business Console
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center gap-2 text-gray">
      <div class="i-carbon-circle-dash animate-spin" />
      Loading configuration...
    </div>

    <!-- Error state -->
    <div v-else-if="error">
      <NTip n="red" icon="carbon-warning">
        Failed to load configuration: {{ error }}
      </NTip>
    </div>

    <!-- Tunnel Active -->
    <div v-else-if="config?.tunnel" class="flex flex-col gap-4">
      <NTip n="green" icon="carbon-checkmark">
        Tunnel is active and configured
      </NTip>

      <NCard class="p-4">
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <div class="i-carbon-link" />
          Connection Details
        </h3>

        <div class="grid gap-3">
          <div class="flex items-center justify-between p-2 rounded bg-gray/10">
            <span class="text-sm opacity-70">Public URL</span>
            <div class="flex items-center gap-2">
              <code class="text-green font-mono text-sm">{{ config.tunnel.origin }}</code>
              <NButton
                n="xs"
                icon="carbon-copy"
                title="Copy URL"
                @click="copyToClipboard(config.tunnel.origin)"
              />
            </div>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-gray/10">
            <span class="text-sm opacity-70">Host</span>
            <code class="font-mono text-sm">{{ config.tunnel.host }}</code>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-gray/10">
            <span class="text-sm opacity-70">Protocol</span>
            <code class="font-mono text-sm">{{ config.tunnel.protocol }}</code>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-gray/10">
            <span class="text-sm opacity-70">HMR WebSocket</span>
            <code class="font-mono text-sm">{{ config.tunnel.wsProtocol }}://{{ config.tunnel.host }}:{{ config.tunnel.port }}</code>
          </div>

          <div class="flex items-start justify-between p-2 rounded bg-gray/10">
            <span class="text-sm opacity-70">Allowed Hosts</span>
            <div class="flex flex-col items-end gap-1">
              <code
                v-for="host in config.tunnel.allowedHosts"
                :key="host"
                class="font-mono text-xs"
              >
                {{ host }}
              </code>
            </div>
          </div>
        </div>
      </NCard>

      <NCard class="p-4">
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <div class="i-carbon-terminal" />
          Environment Variables
        </h3>

        <div class="grid gap-2">
          <div class="flex items-center justify-between p-2 rounded bg-gray/10">
            <span class="font-mono text-xs">DEV_TUNNEL_HOST</span>
            <code class="text-sm">{{ config.env.DEV_TUNNEL_HOST || '-' }}</code>
          </div>
          <div class="flex items-center justify-between p-2 rounded bg-gray/10">
            <span class="font-mono text-xs">DEV_TUNNEL_PROTOCOL</span>
            <code class="text-sm">{{ config.env.DEV_TUNNEL_PROTOCOL || '-' }}</code>
          </div>
          <div class="flex items-center justify-between p-2 rounded bg-gray/10">
            <span class="font-mono text-xs">DEV_TUNNEL_PORT</span>
            <code class="text-sm">{{ config.env.DEV_TUNNEL_PORT || '-' }}</code>
          </div>
        </div>
      </NCard>
    </div>

    <!-- No Tunnel Configured -->
    <div v-else class="flex flex-col gap-4">
      <NTip n="yellow" icon="carbon-information">
        No tunnel configured
      </NTip>

      <NCard class="p-4">
        <h3 class="font-semibold mb-3">
          How to configure
        </h3>
        <p class="text-sm opacity-70 mb-3">
          Set the <code class="bg-gray/20 px-1 rounded">DEV_TUNNEL_HOST</code> environment variable:
        </p>

        <div class="bg-gray/10 p-3 rounded font-mono text-sm">
          <div class="opacity-50"># Option 1: Inline</div>
          <div class="text-green">DEV_TUNNEL_HOST=my-app.trycloudflare.com npm run dev</div>
          <div class="mt-2 opacity-50"># Option 2: .env.local</div>
          <div class="text-green">echo "DEV_TUNNEL_HOST=my-app.trycloudflare.com" > .env.local</div>
        </div>
      </NCard>

      <NCard class="p-4">
        <h3 class="font-semibold mb-3">
          Or configure in nuxt.config.ts
        </h3>
        <div class="bg-gray/10 p-3 rounded font-mono text-sm">
          <pre class="text-green">export default defineNuxtConfig({
  claudeDevtoolsBc: {
    tunnel: {
      host: 'my-app.trycloudflare.com',
      protocol: 'https',
      port: 443,
    }
  }
})</pre>
        </div>
      </NCard>
    </div>

    <div class="flex-auto" />

    <!-- DevTools Client Info -->
    <div v-if="client" class="mt-4 pt-4 border-t border-gray/20">
      <div class="flex items-center gap-2 text-sm opacity-50">
        <div class="i-carbon-checkmark text-green" />
        DevTools connected
        <span class="opacity-50">|</span>
        Vue {{ client.host.nuxt.vueApp.version }}
      </div>
    </div>
  </div>
</template>
