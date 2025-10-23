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
 * Animate logo letter for phase celebration
 */
function animatePhaseLetters(phaseId: PhaseId): void {
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

/**
 * Celebrate phase completion with confetti from logo letter
 */
export function celebratePhase(phaseId: PhaseId): void {
  const letterGroup = document.querySelector(`.letter-group[data-phase="${phaseId}"]`);
  if (!letterGroup) return;

  // Motion animation for the letter group
  animatePhaseLetters(phaseId);

  // Confetti celebration - single burst
  const confetti = (window as any).confetti;
  if (typeof confetti === 'undefined') return;

  const rect = letterGroup.getBoundingClientRect();
  const originX = (rect.left + rect.width / 2) / window.innerWidth;
  const originY = (rect.top + rect.height / 2) / window.innerHeight;

  const colors = PHASE_COLORS[phaseId] || PHASE_COLORS.fase1;

  // Un solo disparo de confetti
  confetti({
    origin: { x: originX, y: originY },
    colors,
    angle: 270, // Disparar hacia abajo
    particleCount: 80,
    spread: 80,
    startVelocity: 50,
    decay: 0.91,
    scalar: 1
  });
}

/**
 * Celebrate full workout completion - spectacular confetti from all logo parts
 */
export function celebrateComplete(): void {
  const phaseIds: PhaseId[] = ['fase1', 'fase2', 'fase3', 'fase4'];
  const animate = (window as any).motionAnimate;
  const stagger = (window as any).motionStagger;

  // Animate each letter group with the same animation as phase completion
  if (animate && stagger) {
    const letterGroups = document.querySelectorAll('.letter-group');
    if (letterGroups.length > 0) {
      animate(
        letterGroups,
        { scale: [1, 1.15, 1], rotate: [0, -3, 3, 0], y: [0, -10, 0] },
        {
          duration: 0.8,
          delay: stagger(0.15),
          easing: "ease-out"
        }
      );
    }
  }

  // Confetti celebration - single burst per phase
  const confetti = (window as any).confetti;
  if (typeof confetti === 'undefined') return;

  phaseIds.forEach((phaseId, index) => {
    setTimeout(() => {
      const letterGroup = document.querySelector(`.letter-group[data-phase="${phaseId}"]`);
      if (!letterGroup) return;

      const rect = letterGroup.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;
      const colors = PHASE_COLORS[phaseId];

      // Un solo disparo de confetti por fase
      confetti({
        origin: { x: originX, y: originY },
        colors,
        angle: 270, // Disparar hacia abajo
        particleCount: 100,
        spread: 90,
        startVelocity: 55,
        decay: 0.91,
        scalar: 1.1
      });
    }, index * 150); // Escalonar las explosiones
  });
}
