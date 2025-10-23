import { atom } from 'nanostores';
import { loadProgress, saveProgress } from '../utils/storage';

export type Level = 'principiante' | 'intermedio' | 'avanzado';

export const currentLevel = atom<Level>('principiante');

/**
 * Initialize level from localStorage
 */
export function initializeLevel(): void {
  const saved = loadProgress();
  if (saved && saved.level) {
    currentLevel.set(saved.level as Level);
  }
}

/**
 * Set the current level and persist to storage
 */
export function setLevel(level: Level): void {
  currentLevel.set(level);

  // Persist level to localStorage
  const saved = loadProgress();
  if (saved) {
    saveProgress({ ...saved, level });
  } else {
    saveProgress({
      completed: [],
      level,
      sessionLocked: false,
      lastSessionDate: new Date().toISOString()
    });
  }
}
