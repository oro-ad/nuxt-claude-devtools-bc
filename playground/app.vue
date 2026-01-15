<script setup lang="ts">
import {useTunnel} from "#imports";

const tunnel = useTunnel()
</script>

<template>
  <div class="p-8 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">
      @oro.ad/nuxt-claude-devtools-bc Playground
    </h1>

    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
      <h2 class="font-semibold mb-2">
        Tunnel Status
      </h2>

      <div v-if="tunnel.isActive" class="text-green-600">
        <p>Tunnel is active</p>
        <p class="font-mono text-sm mt-2">
          Origin: {{ tunnel.origin }}
        </p>
        <p class="font-mono text-sm">
          Host: {{ tunnel.host }}
        </p>
      </div>

      <div v-else class="text-yellow-600">
        <p>No tunnel configured</p>
        <p class="text-sm mt-2 opacity-70">
          Set DEV_TUNNEL_HOST env variable to enable tunnel
        </p>
      </div>
    </div>

    <div class="text-sm opacity-50">
      Open Nuxt DevTools to see the "Claude BC" tab with full tunnel configuration details.
    </div>
  </div>
</template>
