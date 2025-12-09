import { IStorage } from './IStorage'

// Implementación concreta de IStorage usando localStorage
export class LocalStorageAdapter<T> implements IStorage<T> {
  save(key: string, data: T): void {
    try {
      const jsonData = JSON.stringify(data)
      localStorage.setItem(key, jsonData)
    } catch (error) {
      console.error(`Error saving to localStorage with key "${key}":`, error)
    }
  }

  load(key: string): T | null {
    try {
      const jsonData = localStorage.getItem(key)
      if (jsonData === null) {
        return null
      }
      return JSON.parse(jsonData) as T
    } catch (error) {
      console.error(`Error loading from localStorage with key "${key}":`, error)
      return null
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage with key "${key}":`, error)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}
