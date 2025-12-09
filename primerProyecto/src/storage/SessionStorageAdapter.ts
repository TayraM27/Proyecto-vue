import { IStorage } from './IStorage'

// Implementación concreta de IStorage usando sessionStorage
export class SessionStorageAdapter<T> implements IStorage<T> {
  save(key: string, data: T): void {
    try {
      const jsonData = JSON.stringify(data)
      sessionStorage.setItem(key, jsonData)
    } catch (error) {
      console.error(`Error saving to sessionStorage with key "${key}":`, error)
    }
  }

  load(key: string): T | null {
    try {
      const jsonData = sessionStorage.getItem(key)
      if (jsonData === null) {
        return null
      }
      return JSON.parse(jsonData) as T
    } catch (error) {
      console.error(`Error loading from sessionStorage with key "${key}":`, error)
      return null
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from sessionStorage with key "${key}":`, error)
    }
  }

  clear(): void {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
    }
  }
}
