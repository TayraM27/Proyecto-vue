<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { GameStateService } from '../services/GameStateService'
import { StorageType } from '../factories/StorageFactory'

const enrutador = useRouter()

const servicioEstadoJuego = new GameStateService(StorageType.LOCAL)

// Función para volver al juego con vida extra
const volverConVidaExtra = () => {
  servicioEstadoJuego.setMiniGameWon()
  enrutador.push('/game')
}

// Configuración del juego
const ANCHO_CANVAS = 800
const ALTO_CANVAS = 400
const GRAVEDAD = 0.8
const FUERZA_SALTO = -14
const TAMAÑO_GATO = 45
const ANCHO_OBSTACULO = 35
const ESPACIO_OBSTACULOS = 200
const VELOCIDAD_JUEGO = 5
const DISTANCIA_META = 9000 //distancia recorrer para ganar

// Tipos de obstáculos
interface Obstaculo {
  x: number
  altura: number
  pasado: boolean
  esSuperior: boolean
  color: string
}

// Estado del juego
const estadoJuego = reactive({
  estaJugando: false,
  juegoTerminado: false,
  gano: false,
  gatoY: 200,
  velocidadGato: 0,
  obstaculos: [] as Obstaculo[],
  distancia: 0,
  puntuacion: 0,
  mejorPuntuacion: 0,
})

const referenciaCanvas = ref<HTMLCanvasElement | null>(null)
let contexto: CanvasRenderingContext2D | null = null
let cuadroAnimacion: number | null = null
let ultimoObstaculoX = ANCHO_CANVAS
let contadorFondo = 0

// Propiedades computadas
const porcentajeProgreso = computed(() => {
  return Math.min((estadoJuego.distancia / DISTANCIA_META) * 100, 100)
})

const distanciaRestante = computed(() => {
  return Math.max(DISTANCIA_META - estadoJuego.distancia, 0)
})

// Cargar mejor puntuación
const cargarMejorPuntuacion = () => {
  const mejor = localStorage.getItem('mejorPuntuacionMiniJuego')
  if (mejor) {
    estadoJuego.mejorPuntuacion = parseInt(mejor)
  }
}

// Guardar mejor puntuación
const guardarMejorPuntuacion = () => {
  if (estadoJuego.puntuacion > estadoJuego.mejorPuntuacion) {
    estadoJuego.mejorPuntuacion = estadoJuego.puntuacion
    localStorage.setItem('mejorPuntuacionMiniJuego', estadoJuego.puntuacion.toString())
  }
}

// Inicializar canvas
const inicializarCanvas = () => {
  const canvas = referenciaCanvas.value
  if (!canvas) return
  
  contexto = canvas.getContext('2d')
  canvas.width = ANCHO_CANVAS
  canvas.height = ALTO_CANVAS
}

// Iniciar juego
const iniciarJuego = () => {
  estadoJuego.estaJugando = true
  estadoJuego.juegoTerminado = false
  estadoJuego.gano = false
  estadoJuego.gatoY = 200
  estadoJuego.velocidadGato = 0
  estadoJuego.obstaculos = []
  estadoJuego.distancia = 0
  estadoJuego.puntuacion = 0
  ultimoObstaculoX = ANCHO_CANVAS
  contadorFondo = 0
  
  buclePrincipal()
}

// Salto del gato
const saltar = () => {
  if (!estadoJuego.estaJugando || estadoJuego.juegoTerminado) return
  estadoJuego.velocidadGato = FUERZA_SALTO
}

// Generar obstáculos
const generarObstaculo = () => {
  const ultimoObstaculo = estadoJuego.obstaculos[estadoJuego.obstaculos.length - 1]
  const distanciaUltimo = ultimoObstaculo ? ultimoObstaculoX - ultimoObstaculo.x : ESPACIO_OBSTACULOS + 1
  
  if (distanciaUltimo > ESPACIO_OBSTACULOS || estadoJuego.obstaculos.length === 0) {
    // Obstáculo de suelo normal
    const alturaMinima = 60
    const alturaMaxima = 140
    const altura = Math.floor(Math.random() * (alturaMaxima - alturaMinima + 1)) + alturaMinima
    
    const colores = ['#8B4513', '#654321', '#A0522D', '#6B4423']
    const colorAleatorio = colores[Math.floor(Math.random() * colores.length)]
    
    estadoJuego.obstaculos.push({
      x: ANCHO_CANVAS,
      altura: altura,
      pasado: false,
      esSuperior: false,
      color: colorAleatorio,
    })
    ultimoObstaculoX = ANCHO_CANVAS
  }
}

// Detectar colisiones
const detectarColision = () => {
  const gatoX = 100
  const gatoInferior = estadoJuego.gatoY + TAMAÑO_GATO
  const gatoSuperior = estadoJuego.gatoY
  
  // Colisión con obstáculos de suelo
  for (const obstaculo of estadoJuego.obstaculos) {
    if (obstaculo.x < gatoX + TAMAÑO_GATO && obstaculo.x + ANCHO_OBSTACULO > gatoX) {
      const obstaculoSuperior = ALTO_CANVAS - 50 - obstaculo.altura
      if (gatoInferior > obstaculoSuperior) {
        return true
      }
    }
  }
  
  // Colisión con el suelo
  if (gatoInferior > ALTO_CANVAS - 50) {
    return true
  }
  
  // Colisión con el techo
  if (gatoSuperior < 0) {
    return true
  }
  
  return false
}

// Bucle principal del juego
const buclePrincipal = () => {
  if (!contexto || !estadoJuego.estaJugando || estadoJuego.juegoTerminado) return
  
  // Actualizar física del gato
  estadoJuego.velocidadGato += GRAVEDAD
  estadoJuego.gatoY += estadoJuego.velocidadGato
  
  // Limitar al suelo
  if (estadoJuego.gatoY > ALTO_CANVAS - 50 - TAMAÑO_GATO) {
    estadoJuego.gatoY = ALTO_CANVAS - 50 - TAMAÑO_GATO
    estadoJuego.velocidadGato = 0
  }
  
  // Actualizar distancia y contador de fondo
  estadoJuego.distancia += VELOCIDAD_JUEGO
  contadorFondo += VELOCIDAD_JUEGO
  
  // Verificar victoria
  if (estadoJuego.distancia >= DISTANCIA_META) {
    estadoJuego.gano = true
    estadoJuego.juegoTerminado = true
    estadoJuego.estaJugando = false
    guardarMejorPuntuacion()
    return
  }
  
  //  obstáculos
  generarObstaculo()

  // mover obstáculos
  estadoJuego.obstaculos = estadoJuego.obstaculos.filter((obstaculo: Obstaculo) => {
    obstaculo.x -= VELOCIDAD_JUEGO
    
    // contar puntos solo por obstáculos inferiores pasados
    if (!obstaculo.pasado && obstaculo.x + ANCHO_OBSTACULO < 100 && !obstaculo.esSuperior) {
      obstaculo.pasado = true
      estadoJuego.puntuacion++
    }
    
    return obstaculo.x + ANCHO_OBSTACULO > 0
  })
  
  // Verificar colisión
  if (detectarColision()) {
    estadoJuego.juegoTerminado = true
    estadoJuego.estaJugando = false
    guardarMejorPuntuacion()
    return
  }
  
  // Renderizar
  renderizar()
  
  cuadroAnimacion = requestAnimationFrame(buclePrincipal)
}

// Renderizar
const renderizar = () => {
  if (!contexto) return
  
  // Degradado de cielo
  const degradadoCielo = contexto.createLinearGradient(0, 0, 0, ALTO_CANVAS)
  degradadoCielo.addColorStop(0, '#87CEEB')
  degradadoCielo.addColorStop(1, '#B0E0E6')
  contexto.fillStyle = degradadoCielo
  contexto.fillRect(0, 0, ANCHO_CANVAS, ALTO_CANVAS)
  
  // Dibujar nubes de fondo (desplazamiento para efecto de movimiento)
  const posicionNube = (contadorFondo * 0.3) % (ANCHO_CANVAS + 100)
  contexto.fillStyle = 'rgba(255, 255, 255, 0.6)'
  contexto.beginPath()
  contexto.arc(posicionNube - 100, 80, 30, 0, Math.PI * 2)
  contexto.arc(posicionNube - 70, 70, 40, 0, Math.PI * 2)
  contexto.arc(posicionNube - 40, 80, 30, 0, Math.PI * 2)
  contexto.fill()
  
  // Dibujar suelo con textura
  const degradadoSuelo = contexto.createLinearGradient(0, ALTO_CANVAS - 50, 0, ALTO_CANVAS)
  degradadoSuelo.addColorStop(0, '#8B4513')
  degradadoSuelo.addColorStop(1, '#654321')
  contexto.fillStyle = degradadoSuelo
  contexto.fillRect(0, ALTO_CANVAS - 50, ANCHO_CANVAS, 50)
  
  // Línea decorativa del suelo
  contexto.strokeStyle = '#5C3317'
  contexto.lineWidth = 2
  contexto.beginPath()
  contexto.moveTo(0, ALTO_CANVAS - 50)
  contexto.lineTo(ANCHO_CANVAS, ALTO_CANVAS - 50)
  contexto.stroke()
  
  // Dibujar gato con sombra
  contexto.shadowColor = 'rgba(0, 0, 0, 0.3)'
  contexto.shadowBlur = 10
  contexto.shadowOffsetX = 3
  contexto.shadowOffsetY = 3
  contexto.font = `${TAMAÑO_GATO}px Arial`
  contexto.fillText('🐱', 100, estadoJuego.gatoY + TAMAÑO_GATO)
  contexto.shadowColor = 'transparent'
  
  // Dibujar obstáculos con colores y sombras
  estadoJuego.obstaculos.forEach((obstaculo: Obstaculo) => {
    contexto!.shadowColor = 'rgba(0, 0, 0, 0.4)'
    contexto!.shadowBlur = 8
    contexto!.fillStyle = obstaculo.color
    
    if (obstaculo.esSuperior) {
      // Obstáculo superior: desde arriba hacia abajo
      contexto!.fillRect(obstaculo.x, 0, ANCHO_OBSTACULO, obstaculo.altura)
      // Borde inferior
      contexto!.strokeStyle = '#4A2511'
      contexto!.lineWidth = 2
      contexto!.strokeRect(obstaculo.x, 0, ANCHO_OBSTACULO, obstaculo.altura)
    } else {
      // Obstáculo inferior: desde el suelo hacia arriba
      const obstaculoY = ALTO_CANVAS - 50 - obstaculo.altura
      contexto!.fillRect(obstaculo.x, obstaculoY, ANCHO_OBSTACULO, obstaculo.altura)
      // Borde
      contexto!.strokeStyle = '#4A2511'
      contexto!.lineWidth = 2
      contexto!.strokeRect(obstaculo.x, obstaculoY, ANCHO_OBSTACULO, obstaculo.altura)
    }
  })
  contexto!.shadowColor = 'transparent'
}

const volverAlJuego = () => {
  enrutador.push('/game')
}

// Manejadores de eventos
const manejarTeclaPresionada = (evento: KeyboardEvent) => {
  if (evento.code === 'Space' || evento.code === 'ArrowUp') {
    evento.preventDefault()
    if (!estadoJuego.estaJugando && !estadoJuego.juegoTerminado) {
      iniciarJuego()
    } else {
      saltar()
    }
  }
}

const manejarClick = () => {
  if (!estadoJuego.estaJugando && !estadoJuego.juegoTerminado) {
    iniciarJuego()
  } else {
    saltar()
  }
}

onMounted(() => {
  inicializarCanvas()
  cargarMejorPuntuacion()
  window.addEventListener('keydown', manejarTeclaPresionada)
})

onUnmounted(() => {
  if (cuadroAnimacion) {
    cancelAnimationFrame(cuadroAnimacion)
  }
  window.removeEventListener('keydown', manejarTeclaPresionada)
})
</script>

<template>
  <div class="minigame-page">
    <div class="header-bar">
      <h1 class="title">🎮 Mini-Juego: ¡Gana una Vida Extra!</h1>
      <div v-if="estadoJuego.mejorPuntuacion > 0" class="best-score">
        🏆 Mejor: {{ estadoJuego.mejorPuntuacion }}
      </div>
    </div>

    <div class="game-container">
      <div class="instructions" v-if="!estadoJuego.estaJugando && !estadoJuego.juegoTerminado">
        <h2>🐱 ¡Ayuda al gatito a superar los obstáculos!</h2>
        <p class="instruction-text">
          Esquiva obstáculos y recorre <strong>9000m</strong> para ganar una vida extra.
        </p>
        <p class="instruction-text">
          <strong>Controles:</strong> Presiona <kbd>ESPACIO</kbd> / <kbd>↑</kbd> o haz <strong>CLIC</strong> para saltar
        </p>
        <p class="warning-text">⚠️ Este juego es DIFÍCIL. ¡Buena suerte!</p>
        <button class="btn-start" @click="iniciarJuego">🚀 Comenzar</button>
      </div>

      <div class="game-canvas-container">
        <canvas 
          ref="referenciaCanvas" 
          @click="manejarClick"
          :style="{ cursor: estadoJuego.estaJugando ? 'pointer' : 'default' }"
        ></canvas>
        
        <!--barra de progreso -->
        <div class="progress-bar-container" v-if="estadoJuego.estaJugando">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: porcentajeProgreso + '%' }"></div>
          </div>
          <p class="progress-text">
            📍 {{ Math.round(estadoJuego.distancia) }}m / {{ DISTANCIA_META }}m
          </p>
        </div>

        <!--puntuación y distancia-->
        <div class="score-display" v-if="estadoJuego.estaJugando">
          <div>Obstáculos: {{ estadoJuego.puntuacion }}</div>
          <div class="distance-indicator">🏁 {{ distanciaRestante }}m restantes</div>
        </div>
      </div>

      <!-- Pantalla de victoria -->
      <div v-if="estadoJuego.gano" class="result-screen victory">
        <div class="emoji-big">🎉</div>
        <h2>¡VICTORIA!</h2>
        <p class="result-text">
          ¡El gatito recorrió {{ DISTANCIA_META }}m! 🐱✨
        </p>
        <p class="result-text">
          <strong>Has ganado 1 vida extra ❤️</strong>
        </p>
        <p class="stats-text">Obstáculos superados: {{ estadoJuego.puntuacion }}</p>
        <button class="btn btn-primary" @click="volverConVidaExtra">
          ✓ Continuar con las Preguntas
        </button>
      </div>

      <!--pantalla de derrota -->
      <div v-if="estadoJuego.juegoTerminado && !estadoJuego.gano" class="result-screen defeat">
        <div class="emoji-big">💔</div>
        <h2>¡Fallaste!</h2>
        <p class="result-text">
          El gatito chocó con un obstáculo
        </p>
        <p class="stats-text">
          Distancia recorrida: {{ Math.round(estadoJuego.distancia) }}m / {{ DISTANCIA_META }}m
        </p>
        <p class="stats-text">Obstáculos superados: {{ estadoJuego.puntuacion }}</p>
        <div class="button-group">
          <button class="btn btn-primary" @click="iniciarJuego">
            🔄 Reintentar
          </button>
          <button class="btn btn-secondary" @click="volverAlJuego">
            ← Volver al Juego
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.minigame-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-bar {
  max-width: 900px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  color: white;
}

.title {
  margin: 0;
  font-size: 28px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.best-score {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 16px;
  backdrop-filter: blur(10px);
}

.game-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
}

.instructions {
  text-align: center;
  padding: 20px;
}

.instructions h2 {
  margin: 0 0 20px;
  color: #333;
  font-size: 24px;
}

.instruction-text {
  margin: 10px 0;
  color: #555;
  font-size: 16px;
  line-height: 1.6;
}

kbd {
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: monospace;
  font-weight: bold;
}

.warning-text {
  margin: 20px 0;
  color: #d97706;
  font-weight: bold;
  font-size: 18px;
}

.btn-start {
  margin-top: 20px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(245, 87, 108, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(245, 87, 108, 0.4);
}

.game-canvas-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

canvas {
  border: 3px solid #333;
  border-radius: 8px;
  display: block;
  max-width: 100%;
  height: auto;
}

.progress-bar-container {
  width: 100%;
  max-width: 800px;
}

.progress-bar {
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid #333;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
}

.progress-text {
  margin: 8px 0 0;
  text-align: center;
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.score-display {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.distance-indicator {
  font-size: 14px;
  color: #4ade80;
}

.result-screen {
  text-align: center;
  padding: 40px;
}

.emoji-big {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce-big 0.6s ease;
}

@keyframes bounce-big {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.result-screen h2 {
  margin: 0 0 20px;
  font-size: 32px;
}

.result-text {
  margin: 10px 0;
  font-size: 18px;
  color: #333;
  line-height: 1.6;
}

.stats-text {
  margin: 8px 0;
  font-size: 16px;
  color: #666;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 10px 20px rgba(245, 87, 108, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(245, 87, 108, 0.3);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.victory {
  color: #22c55e;
}

.defeat {
  color: #ef4444;
}

@media (max-width: 900px) {
  canvas {
    width: 100%;
    height: auto;
  }
  
  .title {
    font-size: 20px;
  }
  
  .instructions h2 {
    font-size: 20px;
  }
}
</style>
