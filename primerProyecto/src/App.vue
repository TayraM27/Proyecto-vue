<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <router-view :key="route.fullPath" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}
</style>
