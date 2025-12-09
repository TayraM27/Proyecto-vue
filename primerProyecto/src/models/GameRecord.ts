// Modelo de datos para un registro de juego
export interface GameRecord {
  score: number
  maxScore: number
  date: string
  questionsAnswered: number
  won: boolean
}

// Modelo de datos para el estado del juego
export interface GameState {
  currentQuestion: number
  score: number
  lives: number
  answered: boolean
  selectedAnswer: number
  questions: any[]
}
