/**
 * Celebration Utilities
 * Confetti animations and celebration effects
 */

import type { PhaseId } from '../types/workout';

// Phase color mapping for confetti
const PHASE_COLORS: Record<PhaseId, string[]> = {
  fase1: ['#4f46e5', '#6366f1', '#818cf8'], // indigo
  fase2: ['#14b8a6', '#2dd4bf', '#5eead4'], // teal
  fase3: ['#f97316', '#fb923c', '#fdba74'], // orange
  fase4: ['#ec4899', '#f472b6', '#f9a8d4']  // pink
};

/**
 * Celebrate phase completion with confetti from logo letter
 */
export function celebratePhase(phaseId: PhaseId): void {
  // Find the letter group for this phase
  const letterGroup = document.querySelector(`.letter-group[data-phase="${phaseId}"]`);
  if (!letterGroup) return;

  // Get confetti library if available
  const confetti = (window as any).confetti;
  if (typeof confetti === 'undefined') return;

  const rect = letterGroup.getBoundingClientRect();
  const originX = (rect.left + rect.width / 2) / window.innerWidth;
  const originY = (rect.top + rect.height / 2) / window.innerHeight;

  const colors = PHASE_COLORS[phaseId] || PHASE_COLORS.fase1;

  // Single burst of confetti
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { x: originX, y: originY },
    colors: colors,
    scalar: 1.2,
    gravity: 1.2,
    drift: 0,
    ticks: 200
  });
}

/**
 * Celebrate full workout completion
 */
export function celebrateCompletion(): void {
  const confetti = (window as any).confetti;
  if (typeof confetti === 'undefined') return;

  // Multi-color celebration
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#4f46e5', '#14b8a6', '#f97316', '#ec4899']
    });

    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#4f46e5', '#14b8a6', '#f97316', '#ec4899']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Animate logo letter for phase celebration
 */
export function animatePhaseLetters(phaseId: PhaseId): void {
  const animate = (window as any).motionAnimate;
  if (!animate) return;

  const letterGroup = document.querySelector(`.letter-group[data-phase="${phaseId}"]`);
  if (!letterGroup) return;

  animate(
    letterGroup,
    {
      scale: [1, 1.15, 1],
      rotate: [0, -3, 3, 0],
      y: [0, -10, 0]
    },
    { duration: 0.8, easing: "ease-out" }
  );
}
