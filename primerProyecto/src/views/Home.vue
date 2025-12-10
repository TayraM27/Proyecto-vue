<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/*
 verifica si hay una partida guardada

*/
const hasGame = computed(() => {
  try {
    const saved = localStorage.getItem('trivia-score')
    return saved !== null
  } catch {
    return false
  }
})

/*
 inicia una nueva trivia
*/
const startNewGame = () => {
  localStorage.removeItem('trivia-score')
  router.push('/game')
}

/*
Continúa con la trivia
*/
const continueGame = () => {
  router.push('/game')
}

/*
  borra el progreso guardado

*/
const clearGame = () => {
  if (confirm('¿Borrar la puntuación guardada?')) {
    localStorage.removeItem('trivia-score')
    location.reload()
  }
}
</script>

<template>
  <div class="home">
    <div class="container">
      <div class="header">
        <h1>🐾 Trivia de Mascotas</h1>
        <p class="subtitle">¿Sabes cuidar bien a perros y gatos?</p>
      </div>

      <div class="welcome-section">
        <div class="emoji-large">🎯</div>
        <p class="welcome-text">
          ¡Bienvenido a la trivia de cuidado de mascotas! 
          Responde 10 preguntas sobre cómo cuidar a tus mascotas favoritas.
          Tienes 3 vidas. ¿Cuántas acertarás?
        </p>
      </div>

      <div class="buttons-section">
        <button class="btn btn-primary" @click="startNewGame">
          🚀 Comenzar Trivia
        </button>
        <button 
          v-if="hasGame" 
          class="btn btn-secondary" 
          @click="continueGame"
        >
          🎮 Continuar Partida
        </button>
        <button 
          class="btn btn-stats" 
          @click="() => router.push('/stats')"
        >
          📊 Ver Estadísticas
        </button>
        <button 
          v-if="hasGame" 
          class="btn btn-danger" 
          @click="clearGame"
        >
          🗑️ Borrar Puntuación
        </button>
      </div>

      <div class="info-section">
        <h2>📋 Reglas</h2>
        <ul class="info-list">
          <li><strong>10 preguntas</strong> sobre cuidado de mascotas</li>
          <li><strong>4 opciones</strong> por cada pregunta</li>
          <li><strong>3 vidas:</strong> pierdes 1 por respuesta incorrecta</li>
          <li><strong>10 puntos</strong> por cada respuesta correcta</li>
          <li><strong>Ganas:</strong> al obtener 70 puntos o más.</li>
        </ul>
        <p class="warning">⚠️ Si pierdes todas las vidas, el juego termina, salvo que se gane en el mini-juego</p>
      </div>

      <div class="tips-section">
        <h2>💡 Temas de la Trivia</h2>
        <ul class="tips-list">
          <li>🐕 Alimentación y nutrición de perros</li>
          <li>🐈 Cuidado e higiene de gatos</li>
          <li>💉 Vacunación y salud de mascotas</li>
          <li>🎾 Juego y comportamiento</li>
          <li>🧹 Limpieza y higiene dental</li>
        </ul>
      </div>

      <footer class="footer">
        <p>Hecho con Vue 3 + Vue Router para DAW 2º</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.header h1 {
  margin: 0 0 8px;
  font-size: 32px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.welcome-section {
  padding: 40px 20px;
  text-align: center;
}

.emoji-large {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-text {
  margin: 0;
  color: #333;
  line-height: 1.6;
}

.buttons-section {
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #4a90e2;
  color: white;
  box-shadow: 0 10px 20px rgba(74, 144, 226, 0.2);
}

.btn-secondary:hover {
  background: #357abd;
  transform: translateY(-2px);
}

.btn-stats {
  background: #10b981;
  color: white;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
}

.btn-stats:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-danger {
  background: #f5a623;
  color: white;
  font-size: 14px;
}

.btn-danger:hover {
  background: #e09415;
}

.info-section {
  padding: 30px 20px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.info-section h2 {
  margin: 0 0 16px;
  color: #333;
  font-size: 18px;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.info-list li {
  margin-bottom: 10px;
  color: #555;
  position: relative;
  padding-left: 20px;
}

.info-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.warning {
  margin-top: 16px;
  padding: 12px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  color: #856404;
  font-size: 14px;
  border-radius: 4px;
}

.tips-section {
  padding: 30px 20px;
}

.tips-section h2 {
  margin: 0 0 16px;
  color: #333;
  font-size: 18px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.tips-list li {
  margin-bottom: 10px;
  color: #555;
  position: relative;
  padding-left: 20px;
}

.tips-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.footer {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 12px;
  border-top: 1px solid #eee;
}

@media (max-width: 640px) {
  .header h1 { font-size: 24px; }
  .emoji-large { font-size: 60px; }
  .container { border-radius: 12px; }
}
</style>
