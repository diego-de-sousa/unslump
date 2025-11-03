/**
 * WorkoutRepCounter Component
 * Interactive rep counter for guided workout mode
 */
import { useState, useRef, useEffect } from 'preact/hooks';
import { animate } from 'motion';
import { haptics } from '../../utils/haptics';

interface WorkoutRepCounterProps {
  exerciseName: string;
  totalReps: number;
  totalSets?: number;
  phaseColor: string;
  lang: 'en' | 'es';
  onRepComplete?: () => void;
  onSetComplete?: () => void;
  onExerciseComplete?: () => void;
}

export default function WorkoutRepCounter({
  exerciseName,
  totalReps,
  totalSets = 1,
  phaseColor,
  lang,
  onRepComplete,
  onSetComplete,
  onExerciseComplete,
}: WorkoutRepCounterProps) {
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);

  const repButtonRef = useRef<HTMLButtonElement>(null);
  const repCountRef = useRef<HTMLDivElement>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);

  const translations = {
    en: {
      tapForRep: 'Tap for each rep',
      repsCompleted: `${currentRep} of ${totalReps} reps`,
      set: 'Set',
      of: 'of',
      completedSet: 'Set complete! Rest before next set',
      completeButton: 'Exercise complete',
      nextSetIn: `Next set in ${restTimeLeft}s...`,
    },
    es: {
      tapForRep: 'Toca por cada repetición',
      repsCompleted: `${currentRep} de ${totalReps} reps`,
      set: 'Serie',
      of: 'de',
      completedSet: '¡Serie completa! Descansa antes de la siguiente',
      completeButton: 'Ejercicio completo',
      nextSetIn: `Siguiente serie en ${restTimeLeft}s...`,
    },
  };

  const t = translations[lang];

  // Handle rest timer
  useEffect(() => {
    if (!isResting || restTimeLeft <= 0) return;

    const timer = setTimeout(() => {
      setRestTimeLeft(restTimeLeft - 1);

      if (restTimeLeft - 1 <= 0) {
        // Rest complete, start next set
        setIsResting(false);
        setCurrentRep(0);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isResting, restTimeLeft]);

  const handleRepTap = () => {
    if (isResting) return;

    const newRep = currentRep + 1;
    setCurrentRep(newRep);

    // Haptic feedback
    haptics.onRepComplete();

    // Animate rep button
    if (repButtonRef.current) {
      animate(
        repButtonRef.current as any,
        { scale: [1, 0.9, 1.05, 1] },
        { duration: 0.3 }
      );
    }

    // Animate rep count
    if (repCountRef.current) {
      animate(
        repCountRef.current as any,
        { scale: [1, 1.2, 1], rotate: [0, 5, 0] },
        { duration: 0.4 }
      );
    }

    // Update progress circle
    updateProgressCircle(newRep, totalReps);

    // Callback
    if (onRepComplete) {
      onRepComplete();
    }

    // Check if set is complete
    if (newRep >= totalReps) {
      handleSetComplete();
    }
  };

  const handleSetComplete = () => {
    // Haptic feedback
    haptics.onSetComplete();

    // Callback
    if (onSetComplete) {
      onSetComplete();
    }

    // Check if there are more sets
    if (currentSet < totalSets) {
      // Start rest period (10 seconds between sets)
      setIsResting(true);
      setRestTimeLeft(10);
      setCurrentSet(currentSet + 1);
    } else {
      // All sets complete - exercise complete!
      handleExerciseComplete();
    }
  };

  const handleExerciseComplete = () => {
    // Haptic feedback
    haptics.onExerciseComplete();

    // Celebration animation
    if (repCountRef.current) {
      animate(
        repCountRef.current as any,
        { scale: [1, 1.3, 1], y: [0, -10, 0] },
        { duration: 0.6 }
      );
    }

    // Callback
    if (onExerciseComplete) {
      onExerciseComplete();
    }
  };

  const updateProgressCircle = (current: number, total: number) => {
    if (!progressCircleRef.current) return;

    const circumference = 2 * Math.PI * 88; // radius = 88
    const progress = (current / total) * circumference;
    const offset = circumference - progress;

    progressCircleRef.current.style.strokeDasharray = `${circumference}`;
    progressCircleRef.current.style.strokeDashoffset = `${offset}`;
  };

  // Initialize progress circle
  useEffect(() => {
    updateProgressCircle(0, totalReps);
  }, []);

  return (
    <div class="workout-rep-counter flex flex-col items-center">
      {/* Set indicator (if multiple sets) */}
      {totalSets > 1 && (
        <div class="mb-4 rounded-full bg-gray-100 px-4 py-2">
          <p class="text-sm font-semibold text-gray-600">
            {t.set} {currentSet} {t.of} {totalSets}
          </p>
        </div>
      )}

      {/* Rep Counter Circle */}
      <div class="relative mb-6">
        <div
          class="rep-circle relative flex h-48 w-48 items-center justify-center rounded-full border-8"
          style={`border-color: ${phaseColor};`}
        >
          <div ref={repCountRef} class="rep-count flex flex-col items-center">
            <span
              class="font-['Barriecito'] text-6xl font-bold"
              style={`color: ${phaseColor};`}
            >
              {currentRep}
            </span>
            <span class="text-sm font-semibold text-gray-500">
              / {totalReps}
            </span>
          </div>

          {/* Progress ring */}
          <svg class="progress-ring absolute inset-0 -rotate-90" width="100%" height="100%">
            <circle
              ref={progressCircleRef}
              class="progress-ring-circle"
              stroke={phaseColor}
              stroke-width="8"
              fill="transparent"
              r="88"
              cx="50%"
              cy="50%"
              style="transition: stroke-dashoffset 0.3s ease;"
            />
          </svg>
        </div>
      </div>

      {/* Rest message (if resting between sets) */}
      {isResting ? (
        <div class="rest-message mb-6 rounded-lg bg-blue-50 px-6 py-4">
          <p class="mb-2 text-center font-semibold text-blue-600">{t.completedSet}</p>
          <p class="text-center text-sm text-blue-500">{t.nextSetIn.replace(`${restTimeLeft}`, String(restTimeLeft))}</p>
        </div>
      ) : (
        <>
          {/* Tap for rep button */}
          <button
            ref={repButtonRef}
            class="tap-button mb-4 h-24 w-24 rounded-full text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={`background-color: ${phaseColor};`}
            onClick={handleRepTap}
          >
            <div class="flex flex-col items-center justify-center">
              <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </button>

          <p class="text-center text-sm text-gray-600">{t.tapForRep}</p>
        </>
      )}
    </div>
  );
}
