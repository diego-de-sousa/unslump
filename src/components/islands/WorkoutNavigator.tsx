/**
 * Workout Navigator Island
 * Navigation panel for jumping between exercises
 */

import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';
import { workoutSession, currentWorkoutData, overallProgress } from '../../stores/workoutController';
import { isNavigatorOpen, closeNavigator } from '../../stores/navigationStore';
import { completedExercises, skippedExercises } from '../../stores/progressStore';

interface WorkoutNavigatorProps {
  lang: string;
}

export default function WorkoutNavigator({ lang }: WorkoutNavigatorProps) {
  const session = useStore(workoutSession);
  const workout = useStore(currentWorkoutData);
  const isOpen = useStore(isNavigatorOpen);
  const progress = useStore(overallProgress);
  const completed = useStore(completedExercises);
  const skipped = useStore(skippedExercises);

  if (!workout) return null;

  const phases = Object.entries(workout);

  // Helper to check exercise status
  const getExerciseStatus = (phaseId: string, exerciseId: string) => {
    const key = `${phaseId}-${exerciseId}`;
    if (completed.has(key)) return 'completed';
    if (skipped.has(key)) return 'skipped';
    return 'pending';
  };

  const handleExerciseClick = (phaseIndex: number, exerciseIndex: number) => {
    console.log('[WorkoutNavigator] Exercise clicked:', phaseIndex, exerciseIndex);
    // Import and call jumpToExercise function (it handles everything including unpausing)
    import('../../stores/workoutController').then(({ jumpToExercise }) => {
      jumpToExercise(phaseIndex, exerciseIndex);
      closeNavigator(); // Collapse after selection
    });
  };

  // Close navigator when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('#workoutNavigator') && !target.closest('#logoNavigationButton')) {
        closeNavigator();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div id="workoutNavigator" class="relative">
      {/* Expanded Navigation Panel */}
      <div
        class="fixed left-0 right-0 top-12 z-50 max-h-[80vh] overflow-y-auto bg-white shadow-2xl"
        style={{ animation: 'slideDown 0.2s ease-out' }}
      >
          <div class="p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="font-['Barriecito'] text-xl font-bold text-gray-800">
                  {lang === 'es' ? 'Progreso' : 'Progress'}
                </h2>
                <span class="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-3 py-1 text-sm font-bold text-white shadow-sm">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <button
                onClick={closeNavigator}
                class="rounded-full p-1 hover:bg-gray-100"
                aria-label="Close navigation"
              >
                <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Phase List */}
            <div class="space-y-3">
              {phases.map(([phaseId, phase], phaseIndex) => {
                const isCurrentPhase = phaseIndex === session.currentPhaseIndex;
                const isCompletedPhase = phaseIndex < session.currentPhaseIndex;

                return (
                  <div key={phaseId} class="rounded-lg border border-gray-200 overflow-hidden">
                    {/* Phase Header */}
                    <div
                      class="px-3 py-2 font-semibold text-sm"
                      style={{
                        backgroundColor: phase.colorLightHex || '#f5f5f5',
                        color: phase.colorPrimaryHex || '#4f46e5'
                      }}
                    >
                      <div class="flex items-center justify-between">
                        <span>{phase.name}</span>
                        <span class="text-xs opacity-75">
                          {isCompletedPhase ? '✓' : `${phase.exercises.length} ${lang === 'es' ? 'ejercicios' : 'exercises'}`}
                        </span>
                      </div>
                    </div>

                    {/* Exercise List */}
                    <div class="divide-y divide-gray-100">
                      {phase.exercises.map((exercise, exerciseIndex) => {
                        const isCurrent = isCurrentPhase && exerciseIndex === session.currentExerciseIndex;
                        const status = getExerciseStatus(phaseId, exercise.id);

                        return (
                          <button
                            key={exercise.id}
                            onClick={() => handleExerciseClick(phaseIndex, exerciseIndex)}
                            class={`
                              w-full px-3 py-2 text-left text-sm transition-colors
                              ${isCurrent ? 'bg-blue-50 font-semibold' : ''}
                              ${status === 'completed' ? 'text-gray-600' : 'text-gray-700'}
                              ${status === 'skipped' ? 'text-gray-400' : ''}
                              hover:bg-gray-50
                            `}
                          >
                            <div class="flex items-center justify-between">
                              <span class="flex-1">{exercise.name}</span>
                              <span class="ml-2 flex items-center gap-1">
                                {status === 'completed' && (
                                  <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                  </svg>
                                )}
                                {status === 'skipped' && (
                                  <svg class="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                  </svg>
                                )}
                                {isCurrent && (
                                  <svg class="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                                  </svg>
                                )}
                                {exercise.duration > 0 && (
                                  <span class="text-xs text-gray-400">{exercise.duration}s</span>
                                )}
                                {exercise.reps && !exercise.duration && (
                                  <span class="text-xs text-gray-400">{exercise.reps}</span>
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
