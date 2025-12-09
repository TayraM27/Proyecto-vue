import type { GameState } from '../models/GameRecord'
import type { IStorage } from '../storage/IStorage'
import { getStorageFactory, StorageType } from '../factories/StorageFactory'

// Servicio para gestionar el estado temporal del juego (backup para mini-juego)
export class GameStateService {
  private storage: IStorage<GameState>
  private readonly STORAGE_KEY = 'gameStateBackup'
  private readonly MINI_GAME_KEY = 'miniGameWon'

  constructor(storageType: StorageType = StorageType.LOCAL) {
    // Usar el patrón AbstractFactory para obtener el almacenamiento apropiado
    const factory = getStorageFactory(storageType)
    this.storage = factory.createStorage<GameState>()
  }

  // Guardar el estado actual del juego
  saveGameState(state: GameState): void {
    this.storage.save(this.STORAGE_KEY, state)
  }

  // Cargar el estado guardado del juego
  loadGameState(): GameState | null {
    return this.storage.load(this.STORAGE_KEY)
  }

  // Eliminar el estado guardado
  clearGameState(): void {
    this.storage.remove(this.STORAGE_KEY)
    this.storage.remove(this.MINI_GAME_KEY)
  }

  // Marcar que se ganó el mini-juego
  setMiniGameWon(): void {
    this.storage.save(this.MINI_GAME_KEY, { won: true })
  }

  // Verificar si se ganó el mini-juego
  hasMiniGameWon(): boolean {
    const result = this.storage.load(this.MINI_GAME_KEY)
    return result !== null && (result as any).won === true
  }
}
