import { atom } from 'nanostores';

export type Level = 'principiante' | 'intermedio' | 'avanzado';

export const currentLevel = atom<Level>('principiante');

export function setLevel(level: Level) {
  currentLevel.set(level);
}
