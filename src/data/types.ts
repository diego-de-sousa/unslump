/**
 * Shared TypeScript types for workout data
 */

export interface ExerciseLevels {
  principiante: string;
  intermedio: string;
  avanzado: string;
}

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  reps: string;
  instructions: string;
  levels?: ExerciseLevels;
  videoUrl?: string;
  sets?: number;
}

export interface Phase {
  name: string;
  time: string;
  color: string;
  colorPrimary: string;
  colorLight: string;
  colorBorder: string;
  colorPrimaryHex: string;
  colorLightHex: string;
  colorBorderHex: string;
  description: string;
  exercises: Exercise[];
}

export type Workout = Record<string, Phase>;

export type Level = 'principiante' | 'intermedio' | 'avanzado';

export interface ExerciseDetail {
  muscles: string;
  why: string;
  evidence: string;
  tips: string;
}

export type ExerciseDetails = Record<string, ExerciseDetail>;

export interface ReferenceSection {
  category: string;
  studies: string[];
}

export type References = ReferenceSection[];

export type Language = 'en' | 'es';
