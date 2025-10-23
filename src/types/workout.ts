/**
 * Workout Type Definitions
 * Centralized types for workout data structure
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

export interface ExerciseDetail {
  muscles: string;
  why: string;
  evidence: string;
  tips: string;
}

export interface ReferenceSection {
  category: string;
  studies: string[];
}

export type Level = 'principiante' | 'intermedio' | 'avanzado';

export type PhaseId = 'fase1' | 'fase2' | 'fase3' | 'fase4';

export type Workout = Record<PhaseId, Phase>;

export type ExerciseDetailsMap = Record<string, ExerciseDetail>;
