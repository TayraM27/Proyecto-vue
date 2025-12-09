// Interfaz abstracta para operaciones de almacenamiento
export interface IStorage<T> {
  save(key: string, data: T): void
  load(key: string): T | null
  remove(key: string): void
  clear(): void
}
