<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Question {
  question: string
  options: string[]
  correct: number
  feedback: string
}

interface GameQuestion {
  question: string
  shuffledOptions: string[]
  shuffledCorrect: number
  feedback: string
}

interface GameRecord {
  score: number
  maxScore: number
  date: string
  questionsAnswered: number
}

const router = useRouter()
const TIMER_DURATION = 12 // segundos por pregunta

/*
  questions - Array con todas las preguntas de trivia sobre cuidado de mascotas
  Cada pregunta tiene:
  - question: el texto de la pregunta
  - options: array de 4 opciones de respuesta
  - correct: índice (0-3) de la opción correcta (índice respecto a `options` original)
  - feedback: mensaje de retroalimentación si se acierta
  Se mantiene la lista original aquí y se generará una copia mezclada
  (preguntas y opciones) al iniciar/reiniciar la partida.
*/
const QUESTIONS_PER_GAME = 10

const questions: Question[] = [
  {
    question: '¿Cuántas veces al día debe comer un perro adulto?',
    options: ['1 vez', '2 veces', '4 veces', 'Cuando quiera'],
    correct: 1,
    feedback: '✓ Los perros adultos comen bien con 2 comidas diarias',
  },
  {
    question: '¿Cuál es la temperatura corporal normal de un gato?',
    options: ['36-37°C', '37-38.5°C', '38.5-39.5°C', '40°C o más'],
    correct: 2,
    feedback: '✓ Los gatos tienen temperatura más alta que los humanos',
  },
  {
    question: '¿Cada cuánto tiempo se debe bañar a un perro?',
    options: ['Cada semana', 'Cada 2 semanas', 'Cada mes o según sea necesario', 'Nunca'],
    correct: 2,
    feedback: '✓ Bañar muy seguido puede dañar la piel del perro',
  },
  {
    question: '¿Cuál es el mejor tipo de juguete para un gato?',
    options: ['Pelotas grandes', 'Juguetes con movimiento', 'Palos de madera', 'Plásticos duros'],
    correct: 1,
    feedback: '✓ A los gatos les encanta perseguir cosas que se mueven',
  },
  {
    question: '¿Con qué frecuencia se deben cepillar los dientes de una mascota?',
    options: ['Mensualmente', 'Semanalmente', 'Diariamente o 3-4 veces por semana', 'Nunca'],
    correct: 2,
    feedback: '✓ La higiene dental es crucial para la salud de la mascota',
  },
  {
    question: '¿Cuántas horas duerme un gato al día aproximadamente?',
    options: ['8 horas', '12 horas', '16 horas', '20 horas'],
    correct: 2,
    feedback: '✓ Los gatos duermen mucho, es completamente normal',
  },
  {
    question: '¿Cuál es la mejor edad para vacunar a un cachorro?',
    options: ['A las 2 semanas', 'A las 6-8 semanas', 'A los 6 meses', 'Al año'],
    correct: 1,
    feedback: '✓ Las vacunas comienzan entre las 6-8 semanas de vida',
  },
  {
    question: '¿Qué alimento es tóxico para los perros?',
    options: ['Pollo', 'Chocolate', 'Arroz', 'Manzana'],
    correct: 1,
    feedback: '✓ El chocolate es tóxico para los perros, evítalo siempre',
  },
  {
    question: '¿Cuántas glándulas sudoríparas tiene un gato en las patas?',
    options: ['5 glándulas', '10 glándulas', '17 glándulas', 'No tiene'],
    correct: 2,
    feedback: '✓ Los gatos tienen glándulas sudoríparas solo en las patas',
  },
  {
    question: '¿Cuál es la esperanza de vida promedio de un perro?',
    options: ['5-7 años', '10-13 años', '15-18 años', '20+ años'],
    correct: 1,
    feedback: '✓ La mayoría de perros viven entre 10-13 años',
  },
  {
    question: '¿Por qué es importante desparasitar a las mascotas?',
    options: ['Mejora el pelaje', 'Previene parásitos internos y externos', 'Hace que coman más', 'No es necesario'],
    correct: 1,
    feedback: '✓ La desparasitación previene problemas digestivos y transmisiones a humanos',
  },
  {
    question: '¿Qué signo puede indicar que un gato está estresado?',
    options: ['Aumento de apetito', 'Aseo excesivo o pérdida de apetito', 'Dormir más', 'Aumento de peso'],
    correct: 1,
    feedback: '✓ El aseo excesivo o pérdida de apetito son señales de estrés',
  },
  {
    question: '¿Qué debe incluir una dieta equilibrada para perros?',
    options: ['Sólo carbohidratos', 'Proteínas, grasas, vitaminas y minerales', 'Sólo verduras', 'Sólo frutas'],
    correct: 1,
    feedback: '✓ Una dieta equilibrada contiene proteínas, grasas y micronutrientes',
  },
  {
    question: '¿Cuál es una señal de problemas dentales en mascotas?',
    options: ['Aliento fuerte, sangrado de encías', 'Aumento de energía', 'Dormir más', 'Apetito normal'],
    correct: 0,
    feedback: '✓ El mal aliento y el sangrado indican problemas dentales',
  },
  {
    question: '¿Cada cuánto revisar las orejas de un perro?',
    options: ['Nunca', 'Cada día', 'Cada semana o según necesidad', 'Sólo en veterinario'],
    correct: 2,
    feedback: '✓ Revisarlas regularmente ayuda a detectar infecciones a tiempo',
  },
  {
    question: '¿Qué tipo de alimento no debe darse a gatos?',
    options: ['Alimento para gatos', 'Leche de vaca en exceso', 'Comida húmeda para gatos', 'Pienso equilibrado'],
    correct: 1,
    feedback: '✓ Muchos gatos son intolerantes a la lactosa',
  },
  {
    question: '¿Qué es la esterilización?',
    options: ['Un juguete', 'Una cirugía para evitar reproducción', 'Una vacuna', 'Un alimento especial'],
    correct: 1,
    feedback: '✓ La esterilización evita camadas no deseadas y puede mejorar la salud',
  },
  {
    question: '¿Cómo saber si un perro necesita agua?',
    options: ['Siempre está activo', 'Encías secas y letargo', 'Ladra más', 'Come más'],
    correct: 1,
    feedback: '✓ Encías secas y letargo sugieren deshidratación',
  },
  {
    question: '¿Qué medida previene pulgas y garrapatas?',
    options: ['Vacunas', 'Antiparasitarios tópicos u orales', 'Dar más comida', 'Cepillado diario'],
    correct: 1,
    feedback: '✓ Los antiparasitarios son efectivos para prevenir ectoparásitos',
  },
  {
    question: '¿Qué hacer si tu mascota come chocolate?',
    options: ['No hacer nada', 'Observar al perro', 'Contactar inmediatamente al veterinario', 'Darle agua'],
    correct: 2,
    feedback: '✓ El chocolate es tóxico; necesita atención veterinaria urgente',
  },
  {
    question: '¿Cuál es el mejor lugar para que un gato haga sus necesidades?',
    options: ['Caja de arena limpia', 'Cocina', 'Cama', 'En la calle'],
    correct: 0,
    feedback: '✓ Una caja de arena limpia y accesible es esencial para gatos',
  },
  {
    question: '¿Cómo reducir el riesgo de obesidad en mascotas?',
    options: ['Ejercicio + dieta controlada', 'Dar más premios', 'Dejar comida siempre disponible', 'No hacer nada'],
    correct: 0,
    feedback: '✓ Control de raciones y ejercicio son clave para evitar obesidad',
  },
  {
    question: '¿Qué edad suelen considerar "adulto" a un perro grande?',
    options: ['6 meses', '1 año', '1.5-2 años dependiendo de la raza', '10 años'],
    correct: 2,
    feedback: '✓ Razas grandes maduran más despacio que razas pequeñas',
  },
  {
    question: '¿Qué signo indica que tu perro tiene molestias en el oído?',
    options: ['Come muy rápido', 'Sacude la cabeza o se rasca constantemente', 'Corre más', 'Duerme mejor'],
    correct: 1,
    feedback: '✓ Sacudidas de cabeza constantes indican posible infección',
  },
  {
    question: '¿Qué hacer si tu gato no come durante 24 horas?',
    options: ['Esperar otro día', 'Es normal, no preocuparse', 'Contactar al veterinario', 'Darle comida diferente'],
    correct: 2,
    feedback: '✓ La pérdida de apetito prolongada requiere revisión veterinaria',
  },
  {
    question: '¿Cuál es la causa común de vómitos en perros?',
    options: ['El perro está asustado', 'Cambio rápido de alimento o comida en mal estado', 'Dormir boca abajo', 'El perro está feliz'],
    correct: 1,
    feedback: '✓ Cambios de dieta y comida en mal estado causan vómitos frecuentes',
  },
  {
    question: '¿Cómo saber si tu gato tiene pulgas?',
    options: ['Por el color del pelaje', 'Rasquiña constante, "caspa negra" en la piel', 'Porque maúlla mucho', 'Porque come menos'],
    correct: 1,
    feedback: '✓ Rascado intenso y pequeñas manchas negras indican pulgas',
  },
  {
    question: '¿Qué hacer si tu perro mastica sus propias patas?',
    options: ['Dejarlo, es normal', 'Revisar si hay heridas, infección o alergias', 'Regañarlo', 'Ignorar completamente'],
    correct: 1,
    feedback: '✓ Masticarse las patas indica problemas de piel, alergias o estrés',
  },
  {
    question: '¿Cuál es un signo de que tu gato está enfermo?',
    options: ['Juega demasiado', 'Cambios en el comportamiento, aislamiento o vómitos', 'Tiene hambre', 'Duerme más de lo normal (únicamente)'],
    correct: 1,
    feedback: '✓ Cambios de comportamiento y vómitos son señales importantes',
  },
  {
    question: '¿Qué debe hacerse si el perro come algo potencialmente peligroso?',
    options: ['Esperar a ver síntomas', 'Hacerle vomitar inmediatamente sin asesoría', 'Llamar al veterinario de inmediato', 'Darle agua caliente'],
    correct: 2,
    feedback: '✓ Contactar al veterinario es la acción segura ante envenenamientos',
  },
  {
    question: '¿Cómo saber si tu perro tiene sobrepeso?',
    options: ['Porque tiene pelaje abundante', 'No se ven las costillas, abdomen caído', 'Porque come mucho', 'Porque late el corazón rápido'],
    correct: 1,
    feedback: '✓ La dificultad para sentir las costillas es signo de sobrepeso',
  },
  {
    question: '¿Qué indica que un gato está en celo?',
    options: ['Duerme todo el día', 'Maúlla excesivamente, es inquieto, solicita atención', 'No come nada', 'Se vuelve agresivo'],
    correct: 1,
    feedback: '✓ Vocalizaciones excesivas e inquietud indican celo en gatos',
  },
  {
    question: '¿Cuándo se debe llevar a un cachorro al veterinario por primera vez?',
    options: ['Al mes de edad', 'A las 2-4 semanas de vida', 'Al año de edad', 'Nunca, sólo si está enfermo'],
    correct: 1,
    feedback: '✓ El primer chequeo debe ser entre las 2-4 semanas de vida',
  },
  {
    question: '¿Qué alimento humano es seguro para perros?',
    options: ['Aguacate', 'Manzana sin semillas', 'Uvas', 'Cebolla'],
    correct: 1,
    feedback: '✓ Manzanas sin semillas son seguras y saludables para perros',
  },
  {
    question: '¿Cómo actuar si tu gato se niega a usar la caja de arena?',
    options: ['Castigarlo', 'Revisar limpieza, ubicación, o problemas de salud', 'Cambiar de casa', 'Regañarlo constantemente'],
    correct: 1,
    feedback: '✓ Los gatos evitan cajas sucias o mal ubicadas; revisar salud también',
  },
  {
    question: '¿Qué hacer si tu perro tiene diarrea?',
    options: ['Darle leche para normalizar', 'Ofrecer pollo cocido y arroz, hidratación', 'Esperar sin hacer nada', 'Alimentarlo más'],
    correct: 1,
    feedback: '✓ Pollo y arroz son blandos; mantener hidratación es clave',
  },
  {
    question: '¿Cuál es la razón de cortarle las uñas a un perro?',
    options: ['Solo por estética', 'Prevenir dolor, infecciones y caminar correctamente', 'Para castigarlo', 'No es necesario'],
    correct: 1,
    feedback: '✓ Uñas largas causan dolor y problemas de movimiento',
  },
  {
    question: '¿Cómo saber si tu gato está deshidratado?',
    options: ['Tiene hambre constante', 'Encías secas, pelaje sin brillo, letargo', 'Duerme en lugares frescos', 'Maúlla más'],
    correct: 1,
    feedback: '✓ Encías secas y letargo indican deshidratación en gatos',
  },
  {
    question: '¿Qué hacer si tu perro tiene una herida sangrante?',
    options: ['Dejar que sangre para "limpiarla"', 'Presionar con gasa limpia, aplicar desinfectante, ir al vet si es profunda', 'Lamer la herida', 'Ignorarla'],
    correct: 1,
    feedback: '✓ Presionar y limpiar es lo correcto; heridas profundas necesitan vet',
  },
  {
    question: '¿Qué indica que tu gato está estresado o asustado?',
    options: ['Come mucho', 'Oreja atrás, pupilas dilatadas, cuerpo tenso', 'Juega constantemente', 'Ronronea sin parar'],
    correct: 1,
    feedback: '✓ Orejas hacia atrás y pupilas dilatadas son señales de miedo',
  },
  {
    question: '¿Cómo presentar un nuevo perro a uno existente?',
    options: ['Enfrentarlos directamente', 'Paseos conjuntos neutrales primero, luego en casa supervisados', 'Separarlos para siempre', 'Mezclarlos en la cama'],
    correct: 1,
    feedback: '✓ Presentaciones neutrales y supervisadas evitan conflictos',
  },
  {
    question: '¿Qué producto es especialmente peligroso para gatos?',
    options: ['Arena para gatos', 'Antiinflamatorios como paracetamol', 'Rascador', 'Juguetes de goma'],
    correct: 1,
    feedback: '✓ Paracetamol y otros medicamentos humanos son tóxicos para gatos',
  },
  {
    question: '¿Cuándo empezar a socializar a un cachorro?',
    options: ['Al año de edad', 'Entre las 3-12 semanas de vida', 'Nunca es necesario', 'Cuando es adulto'],
    correct: 1,
    feedback: '✓ La ventana crítica es entre 3-12 semanas; más tarde es difícil',
  },
]

/*
  gameState - Estado reactivo del juego
*/
const gameState = reactive({
  currentQuestion: 0,
  score: 0,
  lives: 3,
  answered: false,
  selectedAnswer: -1,
  gameOver: false,
  won: false,
  recordSaved: false,
})

// Temporizador
const timeRemaining = ref(TIMER_DURATION)
let timerInterval: NodeJS.Timeout | null = null

// Iniciar temporizador
const startTimer = () => {
  if (gameState.answered || gameState.gameOver) return
  
  timeRemaining.value = TIMER_DURATION
  
  timerInterval = setInterval(() => {
    timeRemaining.value--
    
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval!)
      timerInterval = null
      // Auto-responder: seleccionar respuesta incorrecta (pierde una vida)
      gameState.answered = true
      gameState.selectedAnswer = -1
      gameState.lives -= 1
      checkGameStatus()
    }
  }, 1000)
}

// Detener temporizador
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Calcular progreso del temporizador (0-100%)
const timerProgress = computed(() => {
  return (timeRemaining.value / TIMER_DURATION) * 100
})

// Color del temporizador según tiempo restante
const timerColor = computed(() => {
  const percentage = timerProgress.value
  if (percentage > 50) return '#4ade80'
  if (percentage > 25) return '#fbbf24'
  return '#ef4444'
})

/*
  gameQuestions - Copia mezclada de `questions` que se usa durante la partida
  Cada item tendrá:
  - question: texto
  - shuffledOptions: array de opciones mezcladas
  - shuffledCorrect: índice (0-3) de la opción correcta dentro de shuffledOptions
  - feedback: texto de retroalimentación
*/
const gameQuestions = ref<GameQuestion[]>([])

// Algoritmo de mezcla Fisher-Yates
const shuffleArray = (arr: any[]): any[] => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

// Prepara y mezcla preguntas y opciones, balanceando posiciones correctas
const prepareQuestions = () => {
  // Mezclar el orden de las preguntas y seleccionar un subconjunto
  const shuffledPool = shuffleArray(questions)
  const selected = shuffledPool.slice(0, Math.min(QUESTIONS_PER_GAME, shuffledPool.length))
  
  // Generar preguntas con opciones mezcladas
  let qCopy: Array<GameQuestion & { originalQ?: Question }> = selected.map((q: Question) => {
    const optionsWithIndex = q.options.map((opt, idx) => ({ text: opt, idx }))
    const shuffled = shuffleArray(optionsWithIndex)
    const shuffledOptions = shuffled.map(s => s.text)
    const shuffledCorrect = shuffled.findIndex(s => s.idx === q.correct)
    return {
      question: q.question,
      shuffledOptions,
      shuffledCorrect,
      feedback: q.feedback,
      originalQ: q,
    }
  })
  
  // Intentar balancear distribución de shuffledCorrect entre 0..3
  const getDistribution = (arr: any[]) => {
    const dist = [0, 0, 0, 0]
    arr.forEach(q => { 
      if (typeof q.shuffledCorrect === 'number') dist[q.shuffledCorrect]++ 
    })
    return dist
  }
  
  let attempts = 0
  let dist = getDistribution(qCopy)
  const maxAttempts = 1000
  
  while (attempts < maxAttempts && attempts < 100) {
    const max = Math.max(...dist)
    const min = Math.min(...dist)
    
    if (max - min <= 1) break
    
    const mostFrequent = dist.indexOf(max)
    let changed = false
    
    for (let i = 0; i < qCopy.length; i++) {
      if (qCopy[i].shuffledCorrect === mostFrequent) {
        const origQ = qCopy[i].originalQ!
        const optionsWithIndex = origQ.options.map((opt, idx) => ({ text: opt, idx }))
        const shuffled = shuffleArray(optionsWithIndex)
        const shuffledOptions = shuffled.map(s => s.text)
        const shuffledCorrect = shuffled.findIndex(s => s.idx === origQ.correct)
        
        qCopy[i] = {
          ...qCopy[i],
          shuffledOptions,
          shuffledCorrect,
        }
        changed = true
        break
      }
    }
    
    if (!changed) break
    dist = getDistribution(qCopy)
    attempts++
  }
  
  // Eliminar referencia a originalQ antes de guardar
  const finalQuestions: GameQuestion[] = qCopy.map(({ originalQ, ...rest }) => rest as GameQuestion)
  gameQuestions.value = finalQuestions
}

// Inicializar preguntas al montar
prepareQuestions()

/*
  question - Computed que devuelve la pregunta actual (mezclada)
*/
const question = computed(() => gameQuestions.value[gameState.currentQuestion])

/*
  progress - Computed que devuelve el porcentaje de progreso
*/
const progress = computed(() => {
  const total = gameQuestions.value.length || questions.length
  return Math.round(((gameState.currentQuestion + 1) / total) * 100)
})

/*
  selectAnswer(index)
  - Usar shuffledCorrect para comparar
*/
const selectAnswer = (index) => {
  if (gameState.answered) return
  // Detener temporizador en cuanto responde el jugador
  stopTimer()
  gameState.selectedAnswer = index
  gameState.answered = true

  if (index === question.value.shuffledCorrect) {
    gameState.score += 10
  } else {
    gameState.lives -= 1
  }
  checkGameStatus()
}

const nextQuestion = () => {
  const total = gameQuestions.value.length
  if (gameState.currentQuestion < total - 1) {
    gameState.currentQuestion += 1
    gameState.answered = false
    gameState.selectedAnswer = -1
  } else {
    gameState.won = true
    gameState.gameOver = true
  }
}

const checkGameStatus = () => {
  if (gameState.lives <= 0) {
    gameState.gameOver = true
  }
}

// Guardar récord del juego en localStorage
const saveGameRecord = () => {
  if (gameState.recordSaved) return
  const record: GameRecord = {
    score: gameState.score,
    maxScore: QUESTIONS_PER_GAME * 10,
    date: new Date().toISOString(),
    questionsAnswered: gameState.currentQuestion + (gameState.answered ? 1 : 0),
  }
  const records: GameRecord[] = JSON.parse(localStorage.getItem('gameRecords') || '[]')
  records.push(record)
  localStorage.setItem('gameRecords', JSON.stringify(records))
  gameState.recordSaved = true
}

const restart = () => {
  // Reiniciar flag de guardado y estado del juego
  gameState.recordSaved = false
  // Mezclar de nuevo al reiniciar
  prepareQuestions()
  gameState.currentQuestion = 0
  gameState.score = 0
  gameState.lives = 3
  gameState.answered = false
  gameState.selectedAnswer = -1
  gameState.gameOver = false
  gameState.won = false
}

const goHome = () => {
  router.push('/')
}

const getOptionClass = (index) => {
  if (!gameState.answered) return ''
  if (index === question.value.shuffledCorrect) return 'correct'
  if (index === gameState.selectedAnswer && index !== question.value.shuffledCorrect) return 'incorrect'
  return ''
}

// Watcher para iniciar el temporizador cuando cambia la pregunta
watch(
  () => gameState.currentQuestion,
  () => {
    if (!gameState.answered && !gameState.gameOver && gameQuestions.value.length > 0) {
      stopTimer()
      startTimer()
    }
  }
  , { immediate: true }
)

// Guardar automáticamente el récord la primera vez que termina la partida
watch(
  () => gameState.gameOver,
  (newVal) => {
    if (newVal === true) {
      stopTimer()
      saveGameRecord()
    }
  }
)

// Detener temporizador cuando se responde o cuando se desmonta
onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="trivia-page">
    <!-- Barra superior con puntuación y vidas -->
    <div class="header-bar">
      <div class="score-info">
        <span class="score">⭐ {{ gameState.score }}</span>
        <span class="lives">❤️ {{ gameState.lives }}/3</span>
      </div>
      <h1 class="title">🐾 Trivia de Mascotas</h1>
      <button class="btn-home" @click="goHome">← Inicio</button>
    </div>

    <!-- Barra de progreso -->
      <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">Pregunta {{ gameState.currentQuestion + 1 }} / {{ gameQuestions.length }}</p>
    </div>

    <!-- Barra de temporizador -->
    <div v-if="!gameState.gameOver && gameQuestions.length > 0" class="timer-container">
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: timerProgress + '%', backgroundColor: timerColor }"></div>
      </div>
      <p class="timer-text">⏱️ {{ timeRemaining }}s</p>
    </div>

    <div class="trivia-container">
      <!-- Pantalla de victoria -->
      <div v-if="gameState.won && gameState.gameOver" class="end-screen victory">
        <div class="emoji-big">🎉</div>
        <h2>¡Ganaste!</h2>
        <p class="score-final">Puntuación final: <strong>{{ gameState.score }}/{{ gameQuestions.length * 10 }}</strong></p>
        <p class="congratulations">¡Eres un experto en cuidado de mascotas!</p>
        <div class="button-group">
          <button class="btn btn-primary" @click="restart">🔄 Jugar de Nuevo</button>
          <button class="btn btn-secondary" @click="goHome">← Volver al Inicio</button>
        </div>
      </div>

      <!-- Pantalla de derrota -->
      <div v-else-if="gameState.gameOver && !gameState.won" class="end-screen defeat">
        <div class="emoji-big">😢</div>
        <h2>Game Over</h2>
        <p class="score-final">Puntuación: <strong>{{ gameState.score }}/{{ gameQuestions.length * 10 }}</strong></p>
        <p class="defeat-msg">Perdiste todas tus vidas. ¡Inténtalo de nuevo!</p>
        <div class="button-group">
          <button class="btn btn-primary" @click="restart">🔄 Reintentar</button>
          <button class="btn btn-secondary" @click="goHome">← Volver al Inicio</button>
        </div>
      </div>

      <!-- Pantalla de juego -->
      <div v-else class="game-content">
        <!-- Pregunta -->
        <div class="question-box">
          <p class="question-text">{{ question.question }}</p>
        </div>

        <!-- Opciones de respuesta -->
        <div class="options-grid">
          <button
            v-for="(option, index) in question.shuffledOptions"
            :key="index"
            class="option-btn"
            :class="getOptionClass(index)"
            @click="selectAnswer(index)"
            :disabled="gameState.answered"
          >
            {{ option }}
          </button>
        </div>

        <!-- Feedback después de responder -->
        <div v-if="gameState.answered" class="feedback-box">
          <p v-if="gameState.selectedAnswer === question.shuffledCorrect" class="feedback-correct">
            {{ question.feedback }}
          </p>
          <p v-else class="feedback-incorrect">
            ❌ Respuesta incorrecta. {{ question.feedback }}
          </p>
        </div>

        <!-- Botón siguiente -->
        <button
          v-if="gameState.answered"
          class="btn-next"
          @click="nextQuestion"
        >
          {{ gameState.currentQuestion === questions.length - 1 ? 'Ver resultado' : 'Siguiente →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.trivia-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.header-bar {
  max-width: 900px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.title {
  margin: 0;
  font-size: 24px;
}

.score-info {
  display: flex;
  gap: 20px;
  font-size: 18px;
  font-weight: bold;
}

.score, .lives {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
}

.btn-home {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-home:hover {
  background: rgba(255, 255, 255, 0.3);
}

.progress-container {
  max-width: 900px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.5s ease;
}

.progress-text {
  margin: 0;
  text-align: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.timer-container {
  max-width: 900px;
  margin: 0 auto 20px;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.timer-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.timer-fill {
  height: 100%;
  transition: width 0.1s linear, background-color 0.3s ease;
}

.timer-text {
  margin: 0;
  text-align: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
}

.trivia-container {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.question-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.question-text {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.option-btn {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.option-btn:not(:disabled):hover {
  border-color: #667eea;
  background: #f5f5ff;
  transform: translateY(-2px);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-btn.correct {
  border-color: #22c55e;
  background: #dcfce7;
  color: #166534;
}

.option-btn.incorrect {
  border-color: #ef4444;
  background: #fee2e2;
  color: #991b1b;
}

.feedback-box {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.feedback-correct {
  background: #dcfce7;
  color: #166534;
  margin: 0;
  font-weight: 600;
}

.feedback-incorrect {
  background: #fee2e2;
  color: #991b1b;
  margin: 0;
  font-weight: 600;
}

.btn-next {
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  min-width: 200px;
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.end-screen {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.emoji-big {
  font-size: 80px;
  animation: bounce-big 0.6s ease;
}

@keyframes bounce-big {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.end-screen h2 {
  margin: 0;
  font-size: 32px;
}

.score-final {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.congratulations, .defeat-msg {
  margin: 0;
  color: #666;
  font-style: italic;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.victory {
  color: #22c55e;
}

.defeat {
  color: #ef4444;
}

@media (max-width: 640px) {
  .header-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .score-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .trivia-container {
    padding: 20px;
  }
  
  .question-text {
    font-size: 18px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .emoji-big {
    font-size: 60px;
  }
  
  .end-screen h2 {
    font-size: 24px;
  }
}
</style>
