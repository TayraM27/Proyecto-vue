import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from './views/Home.vue'
import Game from './views/Game.vue'
import Stats from './views/Stats.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
