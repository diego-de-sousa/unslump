import { describe, expect, it } from 'vitest';
import en from '../locales/en.json';
import es from '../locales/es.json';

const modeChoiceKeys = [
  'title',
  'explore.name',
  'explore.description',
  'explore.action',
  'guided.name',
  'guided.description',
  'guided.action',
  'switchToExplore',
  'switchToGuided',
] as const;

function getTranslationValue(locale: typeof en, key: string): string | undefined {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in value) {
      return (value as Record<string, unknown>)[segment];
    }
    return undefined;
  }, locale.workoutModes) as string | undefined;
}

describe('workout mode translations', () => {
  it('provides every English mode-choice label and action', () => {
    expect(modeChoiceKeys.map(key => getTranslationValue(en, key))).toEqual([
      'Choose your workout',
      'Explore exercises',
      'Move at your own pace and choose individual exercises.',
      'Explore exercises',
      'Guided workout',
      'Follow the complete routine with built-in timers.',
      'Start guided workout',
      'Explore exercises',
      'Guided workout',
    ]);
  });

  it('keeps Spanish mode-choice labels and actions structurally aligned', () => {
    expect(modeChoiceKeys.map(key => getTranslationValue(es, key))).toEqual([
      'Elige tu entrenamiento',
      'Explorar ejercicios',
      'Muévete a tu ritmo y elige ejercicios individuales.',
      'Explorar ejercicios',
      'Entrenamiento guiado',
      'Sigue la rutina completa con temporizadores integrados.',
      'Iniciar entrenamiento guiado',
      'Explorar ejercicios',
      'Entrenamiento guiado',
    ]);
  });
});
