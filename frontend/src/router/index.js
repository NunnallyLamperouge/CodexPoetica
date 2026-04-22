import { createRouter, createWebHistory } from 'vue-router'
import WorkspaceView from '../views/WorkspaceView.vue'
import ShareView from '../views/ShareView.vue'
import MyWorksView from '../views/MyWorksView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: WorkspaceView },
    { path: '/my-works', component: MyWorksView },
    { path: '/shares/:shareCode', component: ShareView },
  ],
})
