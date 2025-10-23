import { useState, useEffect, useRef } from 'preact/hooks';
import { animate } from 'motion';
import type { JSX } from 'preact';

interface ExerciseTimerProps {
  exerciseId: string;
  phaseId: string;
  duration: number;
  colorHex: string;
  colorLightHex: string;
  colorBorderHex: string;
  startLabel: string;
}

export default function ExerciseTimer({
  exerciseId,
  phaseId,
  duration,
  colorHex,
  colorLightHex,
  colorBorderHex,
  startLabel
}: ExerciseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);

    // Animate timer start
    if (displayRef.current) {
      animate(
        displayRef.current as any,
        { scale: [1, 1.1, 1] },
        { duration: 0.4 }
      );
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        // Pulse animation when time is running low (last 10 seconds)
        if (newTime <= 10 && newTime > 0 && displayRef.current) {
          animate(
            displayRef.current as any,
            { scale: [1, 1.08, 1] },
            { duration: 0.5 }
          );
        }

        // Timer completed
        if (newTime <= 0) {
          if (displayRef.current) {
            animate(
              displayRef.current as any,
              { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] },
              { duration: 0.6 }
            );
          }

          // Dispatch custom event for completion
          setTimeout(() => {
            const event = new CustomEvent('exercise-complete', {
              detail: { phaseId: phaseId, exerciseId: exerciseId },
              bubbles: true
            });
            window.dispatchEvent(event);
          }, 600);

          clearTimer();
          setIsRunning(false);
          setTimeLeft(duration);
          return duration;
        }

        return newTime;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearTimer();
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          clearTimer();
          setIsRunning(false);
          setTimeLeft(duration);
          return duration;
        }

        return newTime;
      });
    }, 1000);
  };

  const resetTimer = () => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div
      class="timer-container mt-3 p-2 sm:p-3 border rounded-lg"
      style={{
        backgroundColor: colorLightHex,
        borderColor: colorBorderHex
      }}
    >
      <div class="flex items-center justify-between gap-2">
        <div
          ref={displayRef}
          class="timer-display text-xl sm:text-2xl font-bold"
          style={{ color: colorHex }}
        >
          {formatTime(timeLeft)}
        </div>

        <div class="timer-controls flex gap-1.5 sm:gap-2">
          {/* Start button */}
          {!isRunning && !isPaused && (
            <button
              class="px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium text-xs sm:text-sm shadow-md"
              style={{ backgroundColor: colorHex }}
              onClick={(e) => { e.stopPropagation(); startTimer(); }}
            >
              {startLabel}
            </button>
          )}

          {/* Pause button */}
          {isRunning && !isPaused && (
            <button
              class="p-1.5 sm:p-2 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
              style={{ backgroundColor: colorHex }}
              onClick={(e) => { e.stopPropagation(); pauseTimer(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            </button>
          )}

          {/* Play button */}
          {isPaused && (
            <button
              class="p-1.5 sm:p-2 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
              style={{ backgroundColor: colorHex }}
              onClick={(e) => { e.stopPropagation(); resumeTimer(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          )}

          {/* Reset button */}
          {(isRunning || isPaused) && (
            <button
              class="p-1.5 sm:p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all"
              onClick={(e) => { e.stopPropagation(); resetTimer(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
