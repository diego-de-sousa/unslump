import { useState, useRef } from 'preact/hooks';
import { animate } from 'motion';
import type { JSX } from 'preact';

interface SetCounterProps {
  exerciseId: string;
  phaseId: string;
  totalSets: number;
  colorHex: string;
  colorLightHex: string;
  colorBorderHex: string;
  completedLabel: string;
  addSetLabel: string;
  onComplete?: (phaseId: string, exerciseId: string) => void;
  sessionLocked?: boolean;
}

export default function SetCounter({
  exerciseId,
  phaseId,
  totalSets,
  colorHex,
  colorLightHex,
  colorBorderHex,
  completedLabel,
  addSetLabel,
  onComplete,
  sessionLocked = false
}: SetCounterProps) {
  const [currentSet, setCurrentSet] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const counterRef = useRef<HTMLDivElement>(null);
  const currentSetRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const incrementSet = () => {
    if (currentSet >= totalSets || isCompleted) return;

    const newSet = currentSet + 1;
    setCurrentSet(newSet);

    // Animate counter increment
    if (currentSetRef.current) {
        animate(
        currentSetRef.current as any,
        { scale: [1, 1.4, 1], rotate: [0, 5, 0] },
        { duration: 0.5 }
      );
    }

    // Pulse button feedback
    if (buttonRef.current) {
      animate(
        buttonRef.current as any,
        { scale: [1, 0.95, 1] },
        { duration: 0.3 }
      );
    }

    // Visual feedback when all sets are completed
    if (newSet === totalSets) {
      setIsCompleted(true);

      // Celebration animation for completing all sets
      if (counterRef.current) {
        animate(
          counterRef.current as any,
          { scale: [1, 1.05, 1], y: [0, -5, 0] },
          { duration: 0.6 }
        );
      }

      // Auto-complete the exercise after animation
      setTimeout(() => {
        // Dispatch custom event for completion
        const event = new CustomEvent('exercise-complete', {
          detail: { phaseId, exerciseId },
          bubbles: true
        });
        window.dispatchEvent(event);

        if (onComplete) {
          onComplete(phaseId, exerciseId);
        }
      }, 300);
    }
  };

  const resetSet = () => {
    if (sessionLocked) {
      // Shake animation when locked
      if (counterRef.current) {
        animate(
          counterRef.current as any,
          { x: [-5, 5, -5, 5, 0] },
          { duration: 0.4 }
        );
      }
      return;
    }

    // Reset animation
    if (currentSetRef.current) {
      animate(
        currentSetRef.current as any,
        { scale: [1, 0.8, 1], rotate: [0, -10, 0] },
        { duration: 0.4 }
      );
    }

    setCurrentSet(0);
    setIsCompleted(false);

    // Dispatch event to uncomplete the exercise
    const event = new CustomEvent('exercise-uncomplete', {
      detail: { phaseId, exerciseId },
      bubbles: true
    });
    window.dispatchEvent(event);
  };

  return (
    <div
      ref={counterRef}
      class={`sets-counter mt-3 p-2 sm:p-3 rounded-lg border-2 ${
        isCompleted ? 'ring-2 ring-green-400 shadow-lg' : ''
      }`}
      style={{
        backgroundColor: colorLightHex,
        borderColor: colorBorderHex
      }}
    >
      <div class="flex items-center justify-between gap-2">
        <div
          class="text-sm sm:text-base font-semibold"
          style={{ color: colorHex }}
        >
          {completedLabel}
        </div>
        <div class="flex items-center gap-2">
          <span
            ref={currentSetRef}
            class="current-set text-2xl sm:text-3xl font-bold"
            style={{ color: colorHex }}
          >
            {currentSet}
          </span>
          <span
            class="text-lg sm:text-xl opacity-70"
            style={{ color: colorHex }}
          >
            /
          </span>
          <span
            class="total-sets text-2xl sm:text-3xl font-bold"
            style={{ color: colorHex }}
          >
            {totalSets}
          </span>
        </div>
      </div>

      <div class="flex gap-2 mt-2">
        <button
          ref={buttonRef}
          class={`flex-1 px-3 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm shadow-md ${
            isCompleted ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ backgroundColor: colorHex }}
          onClick={(e) => { e.stopPropagation(); incrementSet(); }}
          disabled={isCompleted}
        >
          {addSetLabel}
        </button>
        <button
          class="px-3 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-all text-sm"
          onClick={(e) => { e.stopPropagation(); resetSet(); }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
