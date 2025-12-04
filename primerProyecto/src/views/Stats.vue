<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Interfaz para registros de puntuaciones
interface GameRecord {
  score: number
  maxScore: number
  date: string
  questionsAnswered: number
}

const records = ref<GameRecord[]>([])
const totalGames = ref(0)
const bestScore = ref(0)
const averageScore = ref(0)

// Cargar estadísticas desde localStorage
const loadStats = () => {
  try {
    const saved = localStorage.getItem('gameRecords')
    if (saved) {
      records.value = JSON.parse(saved)
      totalGames.value = records.value.length
      
      if (records.value.length > 0) {
        bestScore.value = Math.max(...records.value.map(r => r.score))
        const total = records.value.reduce((sum, r) => sum + r.score, 0)
        averageScore.value = Math.round(total / records.value.length)
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Limpiar historial
const clearStats = () => {
  if (confirm('¿Borrar todo el historial de partidas?')) {
    localStorage.removeItem('gameRecords')
    records.value = []
    totalGames.value = 0
    bestScore.value = 0
    averageScore.value = 0
  }
}

// Calcular racha de victorias
const winStreak = computed(() => {
  let streak = 0
  for (let i = records.value.length - 1; i >= 0; i--) {
    if (records.value[i].score === records.value[i].maxScore) {
      streak++
    } else {
      break
    }
  }
  return streak
})

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  loadStats()
})
</script>

<template>
  <div class="stats-page">
    <div class="header-bar">
      <h1 class="title">📊 Estadísticas</h1>
      <button class="btn-home" @click="goHome">← Inicio</button>
    </div>

    <div class="stats-container">
      <!-- Resumen General -->
      <div class="summary-section">
        <div class="stat-card">
          <div class="stat-value">{{ totalGames }}</div>
          <div class="stat-label">Partidas Jugadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ bestScore }}/100</div>
          <div class="stat-label">Mejor Puntuación</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageScore }}/100</div>
          <div class="stat-label">Promedio</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🔥 {{ winStreak }}</div>
          <div class="stat-label">Racha de Victorias</div>
        </div>
      </div>

      <!-- Historial de Partidas -->
      <div class="history-section">
        <h2>📋 Historial de Partidas</h2>
        <div v-if="records.length === 0" class="empty-state">
          <p>Aún no hay partidas registradas. ¡Juega tu primer trivia!</p>
        </div>
        <div v-else class="records-list">
          <div v-for="(record, idx) in records.slice().reverse()" :key="idx" class="record-item">
            <div class="record-score">
              <span class="score-value">{{ record.score }}/{{ record.maxScore }}</span>
              <span v-if="record.score === record.maxScore" class="badge-victory">✓ Victoria</span>
              <span v-else class="badge-loss">✗ Derrota</span>
            </div>
            <div class="record-info">
              <p class="record-date">{{ new Date(record.date).toLocaleDateString('es-ES') }}</p>
              <p class="record-details">{{ record.questionsAnswered }} preguntas respondidas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón Limpiar -->
      <div class="action-section">
        <button v-if="records.length > 0" class="btn-clear" @click="clearStats">
          🗑️ Limpiar Historial
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.stats-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.header-bar {
  max-width: 1000px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
}

.btn-home {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-home:hover {
  background: rgba(255, 255, 255, 0.3);
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.history-section {
  margin-bottom: 30px;
}

.history-section h2 {
  margin: 0 0 20px;
  color: #333;
  font-size: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.record-score {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.badge-victory {
  background: #dcfce7;
  color: #166534;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-loss {
  background: #fee2e2;
  color: #991b1b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.record-date {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.record-details {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.btn-clear {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .stats-container {
    padding: 20px;
  }

  .summary-section {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-value {
    font-size: 24px;
  }

  .records-list {
    max-height: 300px;
  }

  .record-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .record-info {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
