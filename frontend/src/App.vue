<template>
  <nav v-if="!isSharePage" class="global-nav">
    <RouterLink to="/" class="nav-logo">Codex Poetica</RouterLink>
    <div class="nav-links">
      <RouterLink to="/" class="nav-link">创作</RouterLink>
      <RouterLink to="/my-works" class="nav-link">我的作品</RouterLink>
    </div>
  </nav>
  <RouterView />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isSharePage = computed(() => route.path.startsWith('/shares/'))
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #e6edf3; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #161b22; }
::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
</style>

<style scoped>
.global-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 48px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  position: sticky;
  top: 0;
  z-index: 50;
}
.nav-logo {
  font-size: 1rem;
  font-weight: bold;
  color: #4ade80;
  text-decoration: none;
  letter-spacing: 1px;
}
.nav-links { display: flex; gap: 4px; }
.nav-link {
  padding: 5px 14px;
  color: #8b949e;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover { color: #e6edf3; background: #21262d; }
.nav-link.router-link-active { color: #e6edf3; background: #21262d; }
</style>
