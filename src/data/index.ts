import type { Language } from '../i18n/utils';

// Import Spanish versions
import { workout as workoutEs } from './workout.es';
import { exerciseDetails as exerciseDetailsEs } from './exerciseDetails.es';
import { references as referencesEs } from './references.es';

// Import English versions
import { workout as workoutEn } from './workout.en';
import { exerciseDetails as exerciseDetailsEn } from './exerciseDetails.en';
import { references as referencesEn } from './references.en';

export function getWorkout(lang: Language) {
  return lang === 'es' ? workoutEs : workoutEn;
}

export function getExerciseDetails(lang: Language) {
  return lang === 'es' ? exerciseDetailsEs : exerciseDetailsEn;
}

export function getReferences(lang: Language) {
  return lang === 'es' ? referencesEs : referencesEn;
}
