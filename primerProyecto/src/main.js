import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Crear la aplicación Vue
const app = createApp(App)

// Usar el router para manejar múltiples páginas
app.use(router)

// Montar la aplicación en el elemento con id 'app' del HTML
app.mount('#app')
