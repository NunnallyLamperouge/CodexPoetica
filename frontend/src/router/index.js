import { createRouter, createWebHistory } from 'vue-router'
import WorkspaceView from '../views/WorkspaceView.vue'
import ShareView from '../views/ShareView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: WorkspaceView },
    { path: '/shares/:shareCode', component: ShareView },
  ],
})
