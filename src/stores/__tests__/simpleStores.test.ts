import { describe, it, expect, beforeEach, vi } from 'vitest';


// Level Store
import {
  currentLevel,
  initializeLevel,
  setLevel,
  type Level
} from '../levelStore';

// Modal Store
import {
  currentModal,
  exerciseInfoData,
  openModal,
  closeModal,
  isModalOpen,
  isAnyModalOpen
} from '../modalStore';

// Navigation Store
import {
  isNavigatorOpen,
  toggleNavigator,
  openNavigator,
  closeNavigator
} from '../navigationStore';

import * as storage from '../../utils/storage';

// Mock storage
vi.mock('../../utils/storage');

describe('levelStore', () => {
  beforeEach(() => {
    // Reset store
    currentLevel.set('principiante');

    // Clear mocks
    vi.clearAllMocks();
    vi.mocked(storage.loadProgress).mockReturnValue(null);
  });

  describe('initialization', () => {
    it('should start with principiante level', () => {
      expect(currentLevel.get()).toBe('principiante');
    });

    it('should load saved level from storage', () => {
      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: [],
        level: 'avanzado',
        sessionLocked: false,
        lastSessionDate: new Date().toISOString()
      });

      initializeLevel();

      expect(currentLevel.get()).toBe('avanzado');
    });

    it('should handle no saved level', () => {
      vi.mocked(storage.loadProgress).mockReturnValue(null);

      initializeLevel();

      expect(currentLevel.get()).toBe('principiante'); // Should stay default
    });
  });

  describe('setLevel', () => {
    it('should update currentLevel', () => {
      setLevel('intermedio');

      expect(currentLevel.get()).toBe('intermedio');
    });

    it('should save level to storage when progress exists', () => {
      const savedProgress = {
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: new Date().toISOString()
      };

      vi.mocked(storage.loadProgress).mockReturnValue(savedProgress);

      setLevel('avanzado');

      expect(storage.saveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'avanzado',
          completed: ['fase1-ex1']
        })
      );
    });

    it('should create new progress entry if none exists', () => {
      vi.mocked(storage.loadProgress).mockReturnValue(null);

      setLevel('intermedio');

      expect(storage.saveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'intermedio',
          completed: [],
          sessionLocked: false
        })
      );
    });

    it('should handle all three levels', () => {
      setLevel('principiante');
      expect(currentLevel.get()).toBe('principiante');

      setLevel('intermedio');
      expect(currentLevel.get()).toBe('intermedio');

      setLevel('avanzado');
      expect(currentLevel.get()).toBe('avanzado');
    });
  });
});

describe('modalStore', () => {
  beforeEach(() => {
    // Reset stores
    currentModal.set(null);
    exerciseInfoData.set(null);

    // Reset body overflow (in case previous tests left it modified)
    document.body.style.overflow = '';
  });

  describe('openModal', () => {
    it('should open a modal', () => {
      openModal('help');

      expect(currentModal.get()).toBe('help');
    });

    it('should prevent body scroll when modal opens', () => {
      openModal('help');

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should set exercise info data for exercise-info modal', () => {
      const exerciseData = {
        phaseId: 'fase1',
        exerciseId: 'ex1',
        exerciseName: 'Test Exercise'
      };

      openModal('exercise-info', exerciseData);

      expect(currentModal.get()).toBe('exercise-info');
      expect(exerciseInfoData.get()).toEqual(exerciseData);
    });

    it('should open different modals', () => {
      openModal('help');
      expect(currentModal.get()).toBe('help');

      openModal('references');
      expect(currentModal.get()).toBe('references');

      openModal('exercise-info', {});
      expect(currentModal.get()).toBe('exercise-info');
    });
  });

  describe('closeModal', () => {
    it('should close the modal', () => {
      openModal('help');
      closeModal();

      expect(currentModal.get()).toBeNull();
    });

    it('should restore body scroll when modal closes', () => {
      openModal('help');
      closeModal();

      expect(document.body.style.overflow).toBe('');
    });

    it('should clear exercise info data', () => {
      openModal('exercise-info', { exerciseId: 'ex1' });
      closeModal();

      expect(exerciseInfoData.get()).toBeNull();
    });
  });

  describe('computed values', () => {
    it('should detect if specific modal is open', () => {
      const helpModalOpen = isModalOpen('help');

      openModal('help');

      expect(helpModalOpen.get()).toBe(true);

      closeModal();

      expect(helpModalOpen.get()).toBe(false);
    });

    it('should detect if any modal is open', () => {
      expect(isAnyModalOpen.get()).toBe(false);

      openModal('help');

      expect(isAnyModalOpen.get()).toBe(true);

      closeModal();

      expect(isAnyModalOpen.get()).toBe(false);
    });

    it('should correctly differentiate between modals', () => {
      const helpModalOpen = isModalOpen('help');
      const referencesModalOpen = isModalOpen('references');

      openModal('help');

      expect(helpModalOpen.get()).toBe(true);
      expect(referencesModalOpen.get()).toBe(false);
    });
  });

  describe('modal switching', () => {
    it('should switch from one modal to another', () => {
      openModal('help');
      expect(currentModal.get()).toBe('help');

      openModal('references');
      expect(currentModal.get()).toBe('references');

      // Body should still have scroll hidden
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should clear previous exercise info when switching modals', () => {
      openModal('exercise-info', { exerciseId: 'ex1' });
      openModal('help');

      expect(exerciseInfoData.get()).toBeNull();
    });
  });
});

describe('navigationStore', () => {
  beforeEach(() => {
    // Reset store
    isNavigatorOpen.set(false);
  });

  describe('initial state', () => {
    it('should start closed', () => {
      expect(isNavigatorOpen.get()).toBe(false);
    });
  });

  describe('toggleNavigator', () => {
    it('should toggle from closed to open', () => {
      toggleNavigator();

      expect(isNavigatorOpen.get()).toBe(true);
    });

    it('should toggle from open to closed', () => {
      isNavigatorOpen.set(true);

      toggleNavigator();

      expect(isNavigatorOpen.get()).toBe(false);
    });

    it('should toggle multiple times', () => {
      toggleNavigator(); // true
      expect(isNavigatorOpen.get()).toBe(true);

      toggleNavigator(); // false
      expect(isNavigatorOpen.get()).toBe(false);

      toggleNavigator(); // true
      expect(isNavigatorOpen.get()).toBe(true);
    });
  });

  describe('openNavigator', () => {
    it('should open navigator', () => {
      openNavigator();

      expect(isNavigatorOpen.get()).toBe(true);
    });

    it('should remain open when called multiple times', () => {
      openNavigator();
      openNavigator();

      expect(isNavigatorOpen.get()).toBe(true);
    });
  });

  describe('closeNavigator', () => {
    it('should close navigator', () => {
      isNavigatorOpen.set(true);

      closeNavigator();

      expect(isNavigatorOpen.get()).toBe(false);
    });

    it('should remain closed when called multiple times', () => {
      closeNavigator();
      closeNavigator();

      expect(isNavigatorOpen.get()).toBe(false);
    });
  });

  describe('navigation flow', () => {
    it('should open and close in sequence', () => {
      openNavigator();
      expect(isNavigatorOpen.get()).toBe(true);

      closeNavigator();
      expect(isNavigatorOpen.get()).toBe(false);

      openNavigator();
      expect(isNavigatorOpen.get()).toBe(true);
    });

    it('should work correctly with toggle', () => {
      openNavigator();
      toggleNavigator(); // Should close
      expect(isNavigatorOpen.get()).toBe(false);

      closeNavigator(); // Should stay closed
      expect(isNavigatorOpen.get()).toBe(false);

      toggleNavigator(); // Should open
      expect(isNavigatorOpen.get()).toBe(true);
    });
  });
});
