import type { IStorage } from '../storage/IStorage'
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter'
import { SessionStorageAdapter } from '../storage/SessionStorageAdapter'

// Enumeración de tipos de almacenamiento disponibles
export enum StorageType {
  LOCAL = 'local',
  SESSION = 'session'
}

//fábrica abstracta para crear instancias de almacenamiento
export abstract class StorageFactory {
  abstract createStorage<T>(): IStorage<T>
}

//   para LocalStorage
export class LocalStorageFactory extends StorageFactory {
  createStorage<T>(): IStorage<T> {
    return new LocalStorageAdapter<T>()
  }
}

// fábrica concreta para SessionStorage
export class SessionStorageFactory extends StorageFactory {
  createStorage<T>(): IStorage<T> {
    return new SessionStorageAdapter<T>()
  }
}

// Función para obtener la fábrica apropiada según el tipo
export function getStorageFactory(type: StorageType): StorageFactory {
  switch (type) {
    case StorageType.LOCAL:
      return new LocalStorageFactory()
    case StorageType.SESSION:
      return new SessionStorageFactory()
    default:
      return new LocalStorageFactory()
  }
}
