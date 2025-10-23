/**
 * Modal Type Definitions
 * Types for modal state management
 */

export type ModalId = 'exercise-info' | 'references' | 'onboarding';

export interface ModalState {
  isOpen: boolean;
  id: ModalId | null;
}

export interface ExerciseInfoModalData {
  exerciseId: string;
  exerciseName: string;
  videoUrl?: string;
  muscles: string;
  why: string;
  evidence: string;
  tips: string;
}
