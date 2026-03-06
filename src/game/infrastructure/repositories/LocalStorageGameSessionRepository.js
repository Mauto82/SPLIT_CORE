import { GameSession } from '../../domain/entities/GameSession.js';

const STORAGE_KEY = 'p0_game_session';

export class LocalStorageGameSessionRepository {
  constructor(storage) {
    // Se storage non è passato, prova a usare window.localStorage se disponibile,
    // altrimenti usa un mock in-memory (utile per test/SSR).
    if (storage) {
      this.storage = storage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = {
        _data: {},
        getItem(key) { return this._data[key] || null; },
        setItem(key, value) { this._data[key] = String(value); },
        removeItem(key) { delete this._data[key]; }
      };
    }
    this.storageKey = STORAGE_KEY;
  }

  save(session) {
    if (!session) {
      throw new Error('Session is required to save');
    }
    
    const data = {
      level: session.level,
      currentPath: session.fileSystem.getCurrentPath(),
      commandHistory: session.commandHistory
    };
    
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save game session', e);
    }
  }

  load() {
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) return null;
      
      const data = JSON.parse(raw);
      if (!data) return null;

      const session = new GameSession();
      session.level = data.level || 0;
      session.commandHistory = data.commandHistory || [];
      
      if (data.currentPath) {
        try {
           session.fileSystem.changeDirectory(data.currentPath);
        } catch (e) {
           console.warn('Invalid path in saved session, resetting to root', e);
           session.fileSystem.changeDirectory('/');
        }
      }
      
      return session;
    } catch (e) {
      console.error('Failed to load game session', e);
      return null;
    }
  }
}