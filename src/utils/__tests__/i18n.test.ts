import { describe, expect, it } from 'vitest';
import { formatTranslation } from '../../i18n/utils';

describe('Guided workout translations', () => {
  it('formats exact English runtime copy', () => {
    expect(formatTranslation('en', 'guidedWorkout.runtime.initializing')).toBe(
      'Initializing workout...',
    );
    expect(
      formatTranslation('en', 'guidedWorkout.phaseTransition.exerciseCount', { count: 3 }),
    ).toBe('3 exercises');
    expect(formatTranslation('en', 'guidedWorkout.exercisePrep.getReady')).toBe('Get ready!');
    expect(formatTranslation('en', 'guidedWorkout.exerciseActive.tapWhenSetComplete')).toBe(
      'Tap the button when you complete the set',
    );
    expect(formatTranslation('en', 'guidedWorkout.phaseComplete.title')).toBe(
      'Phase Complete! 🎉',
    );
    expect(formatTranslation('en', 'guidedWorkout.verification.almostThere')).toBe(
      'Almost there!',
    );
    expect(formatTranslation('en', 'guidedWorkout.workoutComplete.title')).toBe(
      'Workout Complete! 🎉',
    );
  });

  it('formats exact Spanish runtime copy', () => {
    expect(formatTranslation('es', 'guidedWorkout.runtime.initializing')).toBe(
      'Iniciando entrenamiento...',
    );
    expect(
      formatTranslation('es', 'guidedWorkout.phaseTransition.exerciseCount', { count: 3 }),
    ).toBe('3 ejercicios');
    expect(formatTranslation('es', 'guidedWorkout.exercisePrep.getReady')).toBe('¡Prepárate!');
    expect(formatTranslation('es', 'guidedWorkout.exerciseActive.tapWhenSetComplete')).toBe(
      'Toca el botón cuando completes la serie',
    );
    expect(formatTranslation('es', 'guidedWorkout.phaseComplete.title')).toBe(
      '¡Fase completada! 🎉',
    );
    expect(formatTranslation('es', 'guidedWorkout.verification.almostThere')).toBe(
      '¡Casi llegas!',
    );
    expect(formatTranslation('es', 'guidedWorkout.workoutComplete.title')).toBe(
      '¡Entrenamiento Completo! 🎉',
    );
  });
});
