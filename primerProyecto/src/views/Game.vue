<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { GameRecord } from '../models/GameRecord'
import { GameRecordService } from '../services/GameRecordService'
import { GameStateService } from '../services/GameStateService'
import { StorageType } from '../factories/StorageFactory'

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

// Instanciar servicios usando el patrón AbstractFactory
const gameRecordService = new GameRecordService(StorageType.LOCAL)
const gameStateService = new GameStateService(StorageType.LOCAL)

const router = useRouter()
const TIMER_DURATION = 12 // segundos por pregunta


const QUESTIONS_PER_GAME = 10

const questions: Question[] = [
  {
    question: '¿Cuántas veces al día debe comer un perro adulto?',
    options: ['1 vez al día', '2 veces al día', '3 veces al día', '4 veces al día'],
    correct: 1,
    feedback: '✓ Los perros adultos comen bien con 2 comidas diarias',
  },
  {
    question: '¿Cuál es la temperatura corporal normal de un gato?',
    options: ['36.5-37.5°C', '37.5-38.5°C', '38-39.5°C', '39.5-40.5°C'],
    correct: 2,
    feedback: '✓ Los gatos tienen temperatura más alta que los humanos (38-39.5°C)',
  },
  {
    question: '¿Cada cuánto tiempo se debe bañar a un perro?',
    options: ['Cada semana sin falta', 'Cada 2-3 semanas', 'Cada 1-2 meses o según necesidad', 'Solo cuando esté muy sucio'],
    correct: 2,
    feedback: '✓ Bañar muy seguido puede dañar la piel del perro',
  },
  {
    question: '¿Cuál es el mejor tipo de juguete para un gato?',
    options: ['Pelotas pequeñas de goma', 'Cuerdas estáticas colgantes', 'Cajas de cartón vacías', 'Juguetes con movimiento'],
    correct: 3,
    feedback: '✓ A los gatos les encanta perseguir cosas que imitan presas',
  },
  {
    question: '¿Con qué frecuencia se deben cepillar los dientes de una mascota?',
    options: ['1-2 veces por semana', '2-3 veces por semana', '3-4 veces por semana o diario', 'Una vez al mes'],
    correct: 2,
    feedback: '✓ La higiene dental es crucial: idealmente diario o 3-4 veces/semana',
  },
  {
    question: '¿Cuántas horas duerme un gato al día aproximadamente?',
    options: ['14-16 horas', '10-12 horas', '12-14 horas', '18-20 horas'],
    correct: 0,
    feedback: '✓ Los gatos duermen 14-16 horas al día, es completamente normal',
  },
  {
    question: '¿Cuál es la mejor edad para vacunar a un cachorro?',
    options: ['A las 4-5 semanas', 'A las 6-8 semanas', 'A las 10-12 semanas', 'A las 16 semanas'],
    correct: 1,
    feedback: '✓ Las vacunas comienzan entre las 6-8 semanas de vida',
  },
  {
    question: '¿Qué alimento es tóxico para los perros?',
    options: ['Chocolate, uvas y cebolla', 'Pollo, arroz y zanahoria', 'Manzana, pera y sandía', 'Carne, pescado y huevos'],
    correct: 0,
    feedback: '✓ Chocolate, uvas, cebolla y ajo son tóxicos para perros',
  },
  {
    question: '¿Dónde sudan principalmente los gatos?',
    options: ['Por todo el cuerpo como humanos', 'A través de la lengua al jadear', 'Por las almohadillas de las patas', 'No sudan, solo jadean'],
    correct: 2,
    feedback: '✓ Los gatos sudan principalmente por las almohadillas de las patas',
  },
  {
    question: '¿Cuál es la esperanza de vida promedio de un perro?',
    options: ['8-10 años', '13-16 años', '16-20 años', '10-13 años'],
    correct: 3,
    feedback: '✓ La mayoría de perros viven entre 10-13 años (varía por raza)',
  },
  {
    question: '¿Por qué es importante desparasitar a las mascotas?',
    options: ['Solo mejora el aspecto del pelaje', 'Previene parásitos que afectan salud y pueden transmitirse', 'Solo es necesario si salen a la calle', 'Aumenta el apetito solamente'],
    correct: 1,
    feedback: '✓ La desparasitación previene problemas digestivos y zoonosis',
  },
  {
    question: '¿Qué signo puede indicar que un gato está estresado?',
    options: ['Jugar más de lo normal con juguetes', 'Dormir 16 horas al día (lo normal)', 'Aseo excesivo, pérdida de apetito o aislamiento', 'Ronronear constantemente'],
    correct: 2,
    feedback: '✓ El aseo excesivo, anorexia y aislamiento son señales de estrés',
  },
  {
    question: '¿Qué debe incluir una dieta equilibrada para perros?',
    options: ['Solo proteínas de alta calidad', 'Proteínas, grasas, carbohidratos, vitaminas y minerales', 'Principalmente cereales y vegetales', 'Proteínas y grasas únicamente'],
    correct: 1,
    feedback: '✓ Una dieta completa necesita macro y micronutrientes balanceados',
  },
  {
    question: '¿Cuál es una señal de problemas dentales en mascotas?',
    options: ['Mal aliento persistente y encías inflamadas', 'Mayor energía y apetito voraz', 'Dormir más horas de lo habitual', 'Beber más agua que antes'],
    correct: 0,
    feedback: '✓ Halitosis y gingivitis indican problemas dentales serios',
  },
  {
    question: '¿Cada cuánto revisar las orejas de un perro?',
    options: ['Cada día sin falta', 'Cada 3-4 días', 'Solo cuando huela mal', 'Cada semana'],
    correct: 3,
    feedback: '✓ Revisar semanalmente ayuda a detectar infecciones temprano',
  },
  {
    question: '¿Qué tipo de alimento no debe darse a gatos adultos?',
    options: ['Alimento seco premium para gatos', 'Comida húmeda especial para gatos', 'Leche deslactosada para gatos', 'Leche de vaca en grandes cantidades'],
    correct: 3,
    feedback: '✓ La mayoría de gatos adultos son intolerantes a la lactosa',
  },
  {
    question: '¿Qué es la esterilización/castración?',
    options: ['Un tipo de vacuna anticonceptiva', 'Cirugía para evitar reproducción y controlar población', 'Un tratamiento hormonal temporal', 'Una dieta especial para control de peso'],
    correct: 1,
    feedback: '✓ Es una cirugía que previene camadas y mejora comportamiento',
  },
  {
    question: '¿Cómo saber si un perro necesita agua urgentemente?',
    options: ['Ladra más de lo normal', 'Juega más activamente', 'Encías secas, letargo y elasticidad de piel reducida', 'Come menos de lo habitual'],
    correct: 2,
    feedback: '✓ Encías secas y letargo son signos claros de deshidratación',
  },
  {
    question: '¿Qué medida previene pulgas y garrapatas?',
    options: ['Antiparasitarios tópicos u orales','Vacunas','Dar más comida', 'Cepillado diario'],
    correct: 0,
    feedback: '✓ Los antiparasitarios son efectivos para prevenir ectoparásitos',
  },
  {
    question: '¿Qué hacer si tu mascota come chocolate?',
    options: ['Observar por 24 horas si hay síntomas', 'Darle leche para neutralizar la toxina', 'Contactar al veterinario inmediatamente', 'Inducir vómito sin consultar primero'],
    correct: 2,
    feedback: '✓ El chocolate es tóxico; requiere atención veterinaria urgente',
  },
  {
    question: '¿Cuál es el mejor lugar para que un gato haga sus necesidades?',
    options: ['Caja de arena limpia en lugar tranquilo', 'Patio con tierra o césped', 'Baño con la puerta cerrada', 'Cualquier rincón oscuro de la casa'],
    correct: 0,
    feedback: '✓ Una caja de arena limpia y accesible en lugar tranquilo es esencial',
  },
  {
    question: '¿Cómo reducir el riesgo de obesidad en mascotas?',
    options: ['Reducir las raciones de comida', 'Cambiar a alimento light sin modificar porciones', 'Dar más juguetes para entretenimiento', 'Ejercicio regular y dieta controlada'],
    correct: 3,
    feedback: '✓ La combinación de ejercicio y control de raciones es clave',
  },
  {
    question: '¿Qué edad suelen considerar "adulto" a un perro grande?',
    options: ['9-12 meses', '12-18 meses dependiendo de la raza', '18-24 meses dependiendo de la raza', '24-36 meses dependiendo de la raza'],
    correct: 2,
    feedback: '✓ Razas grandes maduran más despacio, entre 18-24 meses',
  },
  {
    question: '¿Qué signo indica que tu perro tiene molestias en el oído?',
    options: ['Inclina la cabeza hacia un lado', 'Sacude la cabeza frecuentemente y se rasca la oreja', 'Camina en círculos constantemente', 'Ladra más de lo normal'],
    correct: 1,
    feedback: '✓ Sacudidas frecuentes y rascado indican infección de oído',
  },
  {
    question: '¿Qué hacer si tu gato no come durante 24 horas?',
    options: ['Contactar al veterinario para evaluación','Esperar 48 horas más antes de preocuparse', 'Ofrecerle comida húmeda más apetitosa', 'Cambiar completamente su marca de alimento'],
    correct: 0,
    feedback: '✓ Anorexia por 24h en gatos puede ser seria, requiere valoración',
  },
  {
    question: '¿Cuál es la causa común de vómitos en perros?',
    options: ['Hacer ejercicio después de comer','Comer pasto del jardín', 'Cambio brusco de alimento',  'Tomar agua fría rápidamente'],
    correct: 2,
    feedback: '✓ Cambios dietéticos bruscos y comida descompuesta causan vómitos',
  },
  {
    question: '¿Cómo saber si tu gato tiene pulgas?',
    options: ['Pelaje opaco y seco al tacto', 'Aumento de apetito y sed', 'Mauýlla más de lo normal', 'Rascado intenso y pequeños puntos negros'],
    correct: 3,
    feedback: '✓ Prurito intenso y "caspa negra" (heces de pulgas) son signos de pulgas',
  },
  {
    question: '¿Qué hacer si tu perro mastica sus propias patas?',
    options: ['Revisar alergias, hongos, heridas o ansiedad','Ponerle zapatos o botines protectores',  'Aplicar repelente amargo en las patas', 'Distraerlo con más juguetes'],
    correct: 0,
    feedback: '✓ Masticarse las patas indica alergias, dermatitis o estrés',
  },
  {
    question: '¿Cuál es un signo de que tu gato está enfermo?',
    options: ['Mauýlla al ver su comida favorita','Duerme en lugares diferentes de lo habitual', 'Cambios de comportamiento, aislamiento o vómitos frecuentes',  'Juega menos por las tardes'],
    correct: 2,
    feedback: '✓ Cambios conductuales marcados y vómitos son alertas importantes',
  },
  {
    question: '¿Qué debe hacerse si el perro come algo potencialmente peligroso?',
    options: ['Esperar 2-3 horas para ver si vomita solo', 'Darle pan o aceite para "absorber" la toxina', 'Llamar al veterinario inmediatamente antes de actuar', 'Inducir vómito con agua oxigenada sin consultar'],
    correct: 2,
    feedback: '✓ Contactar al vet es crucial; algunas toxinas empeoran con vómito',
  },
  {
    question: '¿Cómo saber si tu perro tiene sobrepeso?',
    options: ['Pesa más que el promedio de su raza', 'Tiene mucho apetito y pide comida', 'Su pelaje se ve más abundante','No se palpan las costillas, abdomen caído, cintura no definida'],
    correct: 3,
    feedback: '✓ La imposibilidad de palpar costillas y falta de cintura indican sobrepeso',
  },
  {
    question: '¿Qué indica que un gato está en celo?',
    options: ['Pérdida de apetito y letargo constante', 'Agresividad hacia otros gatos', 'Duerme más horas de lo normal','Mauýlla excesivamente, se frota, posición de apareamiento'],
    correct: 3,
    feedback: '✓ Vocalizaciones, frotamiento y lordosis indican celo en gatas',
  },
  {
    question: '¿Cuándo se debe llevar a un cachorro al veterinario por primera vez?',
    options: ['A las 6-8 semanas de vida', 'A las 2-4 semanas de vida o antes si hay problemas', 'A los 3 meses de edad', 'Solo cuando termine de lactar'],
    correct: 1,
    feedback: '✓ El primer chequeo debe ser entre 2-4 semanas para valoración inicial',
  },
  {
    question: '¿Qué alimento humano es seguro para perros en moderación?',
    options: ['Manzana sin semillas ni centro','Aguacate en pequeñas cantidades',  'Uvas pasas como premio', 'Cebolla cocida bien picada'],
    correct: 0,
    feedback: '✓ Manzanas sin semillas son seguras; aguacate, uvas y cebolla son tóxicos',
  },
  {
    question: '¿Cómo actuar si tu gato se niega a usar la caja de arena?',
    options: ['Cambiar el tipo de arena inmediatamente', 'Revisar limpieza, ubicación, estrés o problemas urinarios', 'Poner múltiples cajas en la misma habitación', 'Cerrar al gato en el baño con la caja'],
    correct: 1,
    feedback: '✓ Evitar la caja indica suciedad, ubicación, estrés o infección urinaria',
  },
  {
    question: '¿Qué hacer si tu perro tiene diarrea leve?',
    options: ['Ayuno de 12 horas y luego dieta blanda', 'Darle yogurt natural e hidratación', 'Medicarlo con antidiarreico humano', 'Dieta blanda  e hidratación'],
    correct: 3,
    feedback: '✓ Dieta blanda(pollo hervido + arroz) e hidratación; si persiste >24h consultar a un profesional',
  },
  {
    question: '¿Cuál es la razón de cortarle las uñas a un perro?',
    options: ['Prevenir dolor, deformidades, infecciones y cojera','Solo para evitar arañazos en personas',  'Es puramente estético, opcional', 'Para que no dañe los muebles'],
    correct: 0,
    feedback: '✓ Uñas largas causan dolor al caminar, deformaciones y lesiones',
  },
  {
    question: '¿Cómo saber si tu gato está deshidratado?',
    options: ['Orina más oscura de lo normal', 'Encías secas, piel poco elástica, letargo y ojos hundidos', 'Bebe agua constantemente todo el día', 'Busca lugares frescos para dormir'],
    correct: 1,
    feedback: '✓ Encías secas, elasticidad reducida y letargo indican deshidratación',
  },
  {
    question: '¿Qué hacer si tu perro tiene una herida sangrante?',
    options: ['Aplicar hielo directamente sobre la herida', 'Presión con gasa limpia, lavar con suero, valorar si necesita sutura', 'Dejar que se lama la herida para "limpiarla"', 'Aplicar alcohol o agua oxigenada directamente'],
    correct: 1,
    feedback: '✓ Presión, limpieza con suero; heridas profundas requieren vet',
  },
  {
    question: '¿Qué indica que tu gato está estresado o asustado?',
    options: ['Ronroneo suave y ojos semicerrados','Amasa con las patas y se frota', 'Orejas hacia atrás, pupilas dilatadas, cola hinchada',  'Juega con sus juguetes favoritos'],
    correct: 2,
    feedback: '✓ Orejas aplanadas, midriasis y piloerección indican miedo intenso',
  },
  {
    question: '¿Cómo presentar un nuevo perro a uno existente en casa?',
    options: ['Juntarlos directamente en el patio trasero', 'Dejar que se encuentren por primera vez en la comida','Paseos neutrales juntos, luego introducción gradual supervisada', 'Encerrarlos juntos en una habitación para que se conozcan'],
    correct: 2,
    feedback: '✓ Territorio neutral primero, luego introducción gradual en casa',
  },
  {
    question: '¿Qué medicamento humano es especialmente tóxico para gatos?',
    options: ['Paracetamol  e ibuprofeno','Vitamina C en bajas dosis',  'Probióticos específicos', 'Suero fisiológico'],
    correct: 0,
    feedback: '✓ Paracetamol e ibuprofeno pueden ser letales para gatos',
  },
  {
    question: '¿Cuándo es el periodo crítico de socialización en cachorros?',
    options: ['Entre 3-14 semanas de vida','Entre 1-3 meses de edad',  'Entre 6-12 meses de edad', 'Después del año de edad'],
    correct: 0,
    feedback: '✓ El periodo crítico es 3-14 semanas; exposiciones positivas son clave',
  },
]

/*
  gameState - Estado reactivo del juego 
  cualquier cambio se reflejará automáticamente en la interfaz
*/
const gameState = reactive({
  currentQuestion: 0,   // Índice de  pregunta actual
  score: 0,             // Puntuación 
  lives: 3,             // Vidas 
  answered: false,      // Si ya respondió la pregunta actual
  selectedAnswer: -1,   // Opción seleccionada(-1 = ninguna)
  gameOver: false,      // Si el juego terminó
  won: false,           // Si el jugador ganó
  recordSaved: false,   // Si se guardó el récord/puntuación
})

// Temporizador
const timeRemaining = ref(TIMER_DURATION)
let timerInterval: any = null

// Iniciar temporizador
const startTimer = () => {
  if (gameState.answered || gameState.gameOver) return
  
  timeRemaining.value = TIMER_DURATION
  
  timerInterval = setInterval(() => {
    timeRemaining.value--
    
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval!)
      timerInterval = null
      // seleccionar respuesta incorrecta (pierde una vida)
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
  copia mezclada de `questions`(se usa durante la partida)
  shuffledOptions: array de opciones mezcladas
  shuffledCorrect: índice de la opción correcta dentro de shuffledOptions
*/
const gameQuestions = ref<GameQuestion[]>([])

// Algoritmo de mezcla
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

// Prepara y mezcla preguntas y opciones
const prepareQuestions = () => {
  //mezclar el orden de las preguntas y seleccionar un subconjunto
  const shuffledPool = shuffleArray(questions)
  const selected = shuffledPool.slice(0, Math.min(QUESTIONS_PER_GAME, shuffledPool.length))
  
  //generar preguntas 
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
  
  //  balancear distribución de shuffledCorrect entre 0..3
  const getDistribution = (arr: any[]) => {
    const dist = [0, 0, 0, 0]
    arr.forEach((q: any) => { 
      if (q && typeof q.shuffledCorrect === 'number' && q.shuffledCorrect >= 0 && q.shuffledCorrect < 4) {
        dist[q.shuffledCorrect]++
      }
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
      const item = qCopy[i]
      if (item && item.shuffledCorrect === mostFrequent && item.originalQ) {
        const origQ = item.originalQ
        const optionsWithIndex = origQ.options.map((opt: any, idx: any) => ({ text: opt, idx }))
        const shuffled = shuffleArray(optionsWithIndex)
        const shuffledOptions = shuffled.map((s: any) => s.text)
        const shuffledCorrect = shuffled.findIndex((s: any) => s.idx === origQ.correct)
        
        qCopy[i] = {
          question: item.question,
          shuffledOptions,
          shuffledCorrect,
          feedback: item.feedback,
          originalQ: item.originalQ,
        }
        changed = true
        break
      }
    }
    
    if (!changed) break
    dist = getDistribution(qCopy)
    attempts++
  }
  
  // eliminar referencia a originalQ antes de guardar
  const finalQuestions: GameQuestion[] = qCopy.map(({ originalQ, ...rest }) => rest as GameQuestion)
  gameQuestions.value = finalQuestions
}

// Inicializar preguntas inmediatamente al cargar
prepareQuestions()

//Verificar si hay un estado de juego guardado(después de mini-juego)
const checkForRestoredGame = () => {
  const savedState = gameStateService.loadGameState()
  const miniGameWon = gameStateService.hasMiniGameWon()
  
  if (savedState && miniGameWon) {
    //Restaurar el estado del juego con una vida extra
    gameQuestions.value = savedState.questions
    gameState.currentQuestion = savedState.currentQuestion
    gameState.score = savedState.score
    gameState.lives = 1 //vida extra 
    gameState.answered = false //permitir continuar con la siguiente pregunta
    gameState.selectedAnswer = -1
    gameState.gameOver = false
    gameState.won = false
    gameState.recordSaved = false
    
   
    if (savedState.answered && gameState.currentQuestion < gameQuestions.value.length - 1) {
      gameState.currentQuestion += 1
    }
    
    // Limpiar el estado guardado
    gameStateService.clearGameState()
    return true
  }
  return false
}

// Ejecutar al montar
onMounted(() => {
  const savedState = gameStateService.loadGameState()
  const miniGameWon = gameStateService.hasMiniGameWon()
  
  // Solo restaurar si viene del mini-juego
  if (savedState && miniGameWon) {
    checkForRestoredGame()
  }
})

/*
  devuelve la pregunta actual
*/
const question = computed(() => {
  if (gameQuestions.value.length === 0) return null
  return gameQuestions.value[gameState.currentQuestion]
})

/*
 devuelve el porcentaje de progreso
*/
const progress = computed(() => {
  const total = gameQuestions.value.length || questions.length
  return Math.round(((gameState.currentQuestion + 1) / total) * 100)
})


const selectAnswer = (index: number) => {
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
    
    gameState.won = gameState.score >= 70
    gameState.gameOver = true
  }
}

const checkGameStatus = () => {
  if (gameState.lives <= 0) {
    // Si tienes 70+ puntos, ganas aunque se acaben las vidas
    gameState.won = gameState.score >= 70
    gameState.gameOver = true
  }
}

// Guardar récord del juego usando el servicio
const saveGameRecord = () => {
  if (gameState.recordSaved) return
  const record: GameRecord = {
    score: gameState.score,
    maxScore: QUESTIONS_PER_GAME * 10,
    date: new Date().toISOString(),
    questionsAnswered: gameState.currentQuestion + (gameState.answered ? 1 : 0),
    won: gameState.won,
  }
  gameRecordService.saveRecord(record)
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

const goToMiniGame = () => {
  // Guardar el estado actual del juego para poder continuar después
  const gameStateBackup = {
    currentQuestion: gameState.currentQuestion,
    score: gameState.score,
    lives: 0, // Se restaurará a 1 si gana el mini-juego
    answered: gameState.answered,
    selectedAnswer: gameState.selectedAnswer,
    questions: gameQuestions.value,
  }
  gameStateService.saveGameState(gameStateBackup)
  router.push('/minigame')
}

const getOptionClass = (index: number) => {
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

// Guardar automáticamente 
watch(
  () => gameState.gameOver,
  (newVal: boolean) => {
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
        <div class="minigame-offer">
          <p class="minigame-text">🎮 ¿Quieres una oportunidad de ganar una vida extra?</p>
          <p class="minigame-desc">¡Juega nuestro mini-juego y gana una vida para continuar!</p>
        </div>
        <div class="button-group">
          <button class="btn btn-minigame" @click="goToMiniGame">🐱 Jugar Mini-Juego</button>
          <button class="btn btn-primary" @click="restart">🔄 Reintentar desde el Inicio</button>
          <button class="btn btn-secondary" @click="goHome">← Volver al Inicio</button>
        </div>
      </div>

      <!-- Pantalla de juego -->
      <div v-else-if="question" class="game-content">
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

      <!-- Pantalla de carga -->
      <div v-else class="loading-screen">
        <p>Cargando preguntas...</p>
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

.minigame-offer {
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  color: white;
}

.minigame-text {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: bold;
}

.minigame-desc {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.btn-minigame {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 10px 20px rgba(245, 87, 108, 0.3);
}

.btn-minigame:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(245, 87, 108, 0.4);
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
