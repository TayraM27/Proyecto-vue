import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Game from './views/Game.vue'

/*
  Definición de rutas para la aplicación
  - path: la URL que aparecerá en el navegador
  - name: identificador único de la ruta
  - component: componente Vue que se renderiza
*/
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home, // Página de inicio con menú
  },
  {
    path: '/game',
    name: 'Game',
    component: Game, // Página del juego
  },
]

/*
  Creación del router con historial web (URLs limpias, sin #)
*/
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
