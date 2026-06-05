/**
 * Modal Store
 * Centralized state management for modal visibility
 */

import { atom, computed } from 'nanostores';
import type { ModalId, ExerciseInfoModalData } from '../types/modal';

// Current open modal
export const currentModal = atom<ModalId | null>(null);

// Exercise info modal data
export const exerciseInfoData = atom<ExerciseInfoModalData | null>(null);

/**
 * Open a modal by ID
 */
export function openModal(modalId: ModalId, data?: ExerciseInfoModalData): void {
  if (modalId === 'exercise-info') {
    exerciseInfoData.set(data ?? null);
  } else {
    exerciseInfoData.set(null);
  }
  currentModal.set(modalId);

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

/**
 * Close the current modal
 */
export function closeModal(): void {
  currentModal.set(null);
  exerciseInfoData.set(null);

  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Computed: Is a specific modal open
 */
export function isModalOpen(modalId: ModalId) {
  return computed(currentModal, (current) => current === modalId);
}

/**
 * Computed: Is any modal open
 */
export const isAnyModalOpen = computed(currentModal, (current) => current !== null);
