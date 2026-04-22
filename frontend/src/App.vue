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
:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --border-primary: #30363d;
  --border-hover: #484f58;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #484f58;
  --accent-green: #4ade80;
  --accent-green-dim: #238636;
  --accent-green-hover: #2ea043;
  --accent-blue: #60a5fa;
  --accent-purple: #a78bfa;
  --accent-amber: #f59e0b;
  --accent-pink: #f472b6;
  --accent-red: #f85149;
  --glow-green: rgba(74, 222, 128, 0.15);
  --glow-blue: rgba(96, 165, 250, 0.1);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
}
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-secondary); }
::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }
</style>

<style scoped>
.global-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  background: linear-gradient(180deg, #1a2030 0%, var(--bg-secondary) 100%);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.3);
}
.global-nav::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--accent-green) 50%, transparent 100%);
  opacity: 0.4;
}
.nav-logo {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--accent-green);
  text-decoration: none;
  letter-spacing: 1.5px;
  text-shadow: 0 0 20px var(--glow-green);
  animation: logo-breathe 3s ease-in-out infinite;
}
@keyframes logo-breathe {
  0%, 100% { text-shadow: 0 0 20px var(--glow-green); }
  50% { text-shadow: 0 0 30px rgba(74, 222, 128, 0.3); }
}
.nav-links { display: flex; gap: 4px; }
.nav-link {
  position: relative;
  padding: 6px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  transition: color var(--transition-fast), background var(--transition-fast);
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--accent-green);
  border-radius: 1px;
  transition: width var(--transition-normal), left var(--transition-normal);
}
.nav-link:hover { color: var(--text-primary); background: rgba(255,255,255,0.04); }
.nav-link:hover::after { width: 60%; left: 20%; }
.nav-link.router-link-active { color: var(--text-primary); background: var(--bg-tertiary); }
.nav-link.router-link-active::after { width: 60%; left: 20%; }
</style>
