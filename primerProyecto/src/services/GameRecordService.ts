import type { GameRecord } from '../models/GameRecord'
import type { IStorage } from '../storage/IStorage'
import { getStorageFactory, StorageType } from '../factories/StorageFactory'

// Servicio para gestionar los registros del juego usando el patrón AbstractFactory
export class GameRecordService {
  private storage: IStorage<GameRecord[]>
  private readonly STORAGE_KEY = 'gameRecords'

  constructor(storageType: StorageType = StorageType.LOCAL) {
    // Usar el patrón AbstractFactory para obtener el almacenamiento apropiado
    const factory = getStorageFactory(storageType)
    this.storage = factory.createStorage<GameRecord[]>()
  }

  // Guardar un nuevo registro de juego
  saveRecord(record: GameRecord): void {
    const records = this.getAllRecords()
    records.push(record)
    this.storage.save(this.STORAGE_KEY, records)
  }

  // Obtener todos los registros
  getAllRecords(): GameRecord[] {
    return this.storage.load(this.STORAGE_KEY) || []
  }

  // Obtener el mejor puntaje
  getBestScore(): number {
    const records = this.getAllRecords()
    if (records.length === 0) return 0
    return Math.max(...records.map(r => r.score))
  }

  // Obtener el promedio de puntajes
  getAverageScore(): number {
    const records = this.getAllRecords()
    if (records.length === 0) return 0
    const total = records.reduce((sum, r) => sum + r.score, 0)
    return Math.round(total / records.length)
  }

  // Obtener el total de partidas jugadas
  getTotalGames(): number {
    return this.getAllRecords().length
  }

  // Calcular racha de victorias
  getWinStreak(): number {
    const records = this.getAllRecords()
    let streak = 0
    for (let i = records.length - 1; i >= 0; i--) {
      const record = records[i]
      if (record && record.won) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  // Limpiar todos los registros
  clearAllRecords(): void {
    this.storage.remove(this.STORAGE_KEY)
  }
}
