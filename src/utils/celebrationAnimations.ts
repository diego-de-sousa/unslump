/**
 * Celebration animation system for logo
 * Handles exercise, phase, and session complete animations
 */

// @ts-nocheck
import type { PhaseId } from './animationConfig';
import {
  PHASES,
  EXERCISE_ANIMATIONS,
  PHASE_ANIMATIONS,
  SESSION_ANIMATIONS,
  CONFETTI_CONFIG,
} from './animationConfig';
import { celebrationSounds } from './celebrationSounds';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  life: number;
  shape: 'square' | 'rectangle';
}

/**
 * Helper: Get phase group element from logo
 */
function getPhaseGroup(logoId: string, phaseId: PhaseId): HTMLElement | null {
  const logo = document.getElementById(logoId);
  if (!logo) return null;
  return logo.querySelector(`[data-phase="${phaseId}"]`);
}

/**
 * Helper: Set font variable properties
 */
function setFontVariables(
  element: HTMLElement,
  xrot?: number,
  yrot?: number
): void {
  const layers = element.querySelectorAll('.base-layer, .color-layer');
  layers.forEach((layer) => {
    if (xrot !== undefined) {
      (layer as HTMLElement).style.setProperty('--xrot', xrot.toString());
    }
    if (yrot !== undefined) {
      (layer as HTMLElement).style.setProperty('--yrot', yrot.toString());
    }
  });
}

/**
 * Helper: Animate font variables over time
 */
function animateFontVariables(
  element: HTMLElement,
  config: {
    xrot?: { keyframes: Array<{ value: number; offset: number }> };
    yrot?: { keyframes: Array<{ value: number; offset: number }> };
  },
  duration: number,
  easing: string = 'ease-in-out'
): void {
  const startTime = performance.now();

  function updateFrame(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Apply easing
    const easedProgress = applyEasing(progress, easing);

    // Interpolate xrot
    if (config.xrot) {
      const xrotValue = interpolateKeyframes(config.xrot.keyframes, easedProgress);
      setFontVariables(element, xrotValue, undefined);
    }

    // Interpolate yrot
    if (config.yrot) {
      const yrotValue = interpolateKeyframes(config.yrot.keyframes, easedProgress);
      setFontVariables(element, undefined, yrotValue);
    }

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    }
  }

  requestAnimationFrame(updateFrame);
}

/**
 * Helper: Interpolate between keyframes
 */
function interpolateKeyframes(
  keyframes: Array<{ value: number; offset: number }>,
  progress: number
): number {
  // Find the two keyframes to interpolate between
  for (let i = 0; i < keyframes.length - 1; i++) {
    const current = keyframes[i];
    const next = keyframes[i + 1];

    if (progress >= current.offset && progress <= next.offset) {
      const localProgress =
        (progress - current.offset) / (next.offset - current.offset);
      return current.value + (next.value - current.value) * localProgress;
    }
  }

  // Return last keyframe value if past all keyframes
  return keyframes[keyframes.length - 1].value;
}

/**
 * Helper: Apply easing function
 */
function applyEasing(t: number, easing: string): number {
  // Simple easing implementations
  switch (easing) {
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'ease-out':
      return t * (2 - t);
    case 'ease-in':
      return t * t;
    default:
      return t; // linear
  }
}

/**
 * Exercise Complete Animation (Subtle)
 * Animates a single letter group when an exercise is completed
 */
export function animateExerciseComplete(
  logoId: string,
  phaseId: PhaseId
): void {
  const phaseGroup = getPhaseGroup(logoId, phaseId);
  if (!phaseGroup) return;

  const config = EXERCISE_ANIMATIONS[phaseId];

  // Play sound
  celebrationSounds.playExerciseComplete(phaseId);

  // Reset any existing animation
  phaseGroup.style.animation = 'none';

  // Apply font variable animations
  if (config.xrot) {
    animateFontVariables(
      phaseGroup,
      { xrot: config.xrot },
      config.duration,
      config.easing
    );
  }

  if (config.yrot) {
    animateFontVariables(
      phaseGroup,
      { yrot: config.yrot },
      config.duration,
      config.easing
    );
  }

  // Apply CSS transform animations
  if (config.transform) {
    const keyframeAnimation = generateTransformKeyframes(
      phaseId,
      'exercise',
      config.transform.keyframes
    );

    phaseGroup.style.animation = `${keyframeAnimation} ${config.duration}ms ${config.easing}`;

    // Add glow if specified
    if (config.glow) {
      const color = PHASES[phaseId].color;
      phaseGroup.style.filter = `drop-shadow(0 0 10px ${color})`;
      setTimeout(() => {
        phaseGroup.style.filter = '';
      }, config.duration);
    }
  }

  // Clean up after animation
  setTimeout(() => {
    phaseGroup.style.animation = '';
  }, config.duration);
}

/**
 * Phase Complete Animation (Medium)
 * Animates when an entire phase is completed, with confetti from letter edge
 */
export function animatePhaseComplete(
  logoId: string,
  phaseId: PhaseId,
  canvasId: string
): void {
  const phaseGroup = getPhaseGroup(logoId, phaseId);
  if (!phaseGroup) return;

  const config = PHASE_ANIMATIONS[phaseId];
  const phase = PHASES[phaseId];

  // First, ensure the phase is at 100% (already complete)
  // In real usage, this would already be filled, but we ensure it here
  const phaseIndex = ['fase1', 'fase2', 'fase3', 'fase4'].indexOf(phaseId);
  const phaseProgress = (phaseIndex + 1) * 25;
  setSessionProgress(logoId, phaseProgress);

  // Wait a brief moment for the fill to complete
  setTimeout(() => {
    // Play sound
    celebrationSounds.playPhaseComplete(phaseId);

    // Reset animation
    phaseGroup.style.animation = 'none';

    const colorLayer = phaseGroup.querySelector('.color-layer') as HTMLElement;
    const baseLayer = phaseGroup.querySelector('.base-layer') as HTMLElement;

    // Apply CSS transform animations (special effects on already-filled phase)
    if (config.transform) {
      const keyframeAnimation = generateTransformKeyframes(
        phaseId,
        'phase',
        config.transform.keyframes
      );

      phaseGroup.style.animation = `${keyframeAnimation} ${config.duration}ms ${config.easing}`;
    }

    // Add glow effect
    if (config.glow) {
      const intensity = config.glowIntensity || 15;
      phaseGroup.style.filter = `drop-shadow(0 0 ${intensity}px ${phase.color})`;
      setTimeout(() => {
        phaseGroup.style.filter = '';
      }, config.duration);
    }

    // Trigger confetti from the right edge of the letters
    setTimeout(() => {
      createConfettiFromPhaseEdge(
        logoId,
        canvasId,
        phaseId,
        config.confettiCount,
        config.confettiShape || 'square',
        config.confettiVelocity || 'normal'
      );
    }, config.confettiDelay);

    // Clean up
    setTimeout(() => {
      phaseGroup.style.animation = '';
      if (colorLayer) {
        colorLayer.style.transition = '';
      }
      if (baseLayer) {
        baseLayer.style.transition = '';
      }
    }, config.duration);
  }, 100); // Wait for fill to complete
}

/**
 * Reset Phase Progress
 * Resets a phase to its initial state (no progress)
 */
export function resetPhaseProgress(logoId: string, phaseId: PhaseId): void {
  const phaseGroup = getPhaseGroup(logoId, phaseId);
  if (!phaseGroup) return;

  // Reset color layer to empty
  const colorLayer = phaseGroup.querySelector('.color-layer') as HTMLElement;
  if (colorLayer) {
    const clipPath = phaseId === 'fase4' ? 'inset(-10% 100% -10% 0)' : 'inset(0 100% 0 0)';
    colorLayer.style.clipPath = clipPath;
    colorLayer.style.transition = 'none';
  }

  // Reset font variables to initial slouched state
  setFontVariables(phaseGroup, 25, -15);

  // Clear any animations
  phaseGroup.style.animation = '';
  phaseGroup.style.filter = '';
}

/**
 * Set Phase Progress
 * Gradually fills the phase with color and straightens posture
 */
export function setPhaseProgress(
  logoId: string,
  phaseId: PhaseId,
  progress: number
): void {
  progress = Math.max(0, Math.min(100, progress));
  const phaseGroup = getPhaseGroup(logoId, phaseId);
  if (!phaseGroup) return;

  // Update posture (font variables) - this must be done FIRST
  const progressFactor = progress / 100;
  const xrot = 25 + (0 - 25) * progressFactor; // 25 → 0
  const yrot = -15 + (0 - (-15)) * progressFactor; // -15 → 0

  // Apply to both layers with smooth transitions
  const layers = phaseGroup.querySelectorAll('.base-layer, .color-layer');
  layers.forEach((layer) => {
    const el = layer as HTMLElement;
    el.style.setProperty('--xrot', xrot.toString());
    el.style.setProperty('--yrot', yrot.toString());
    el.style.transition = '--xrot 0.3s ease-out, --yrot 0.3s ease-out';
  });

  // Update color fill
  const colorLayer = phaseGroup.querySelector('.color-layer') as HTMLElement;
  if (colorLayer) {
    const rightInset = 100 - progress;
    const clipPath = phaseId === 'fase4'
      ? `inset(-10% ${rightInset}% -10% 0)`
      : `inset(0 ${rightInset}% 0 0)`;
    colorLayer.style.clipPath = clipPath;
    colorLayer.style.transition = 'clip-path 0.3s ease-out, --xrot 0.3s ease-out, --yrot 0.3s ease-out';
  }
}

/**
 * Session Complete Animations (Epic)
 */

/**
 * Reset Session Progress
 * Resets all 4 phases to initial state
 */
export function resetSessionProgress(logoId: string): void {
  const phases: PhaseId[] = ['fase1', 'fase2', 'fase3', 'fase4'];
  phases.forEach(phaseId => {
    resetPhaseProgress(logoId, phaseId);
  });

  const logo = document.getElementById(logoId);
  if (logo) {
    logo.style.animation = '';
    logo.style.filter = '';
    logo.style.transform = '';
  }
}

/**
 * Set Session Progress
 * Gradually fills all phases based on overall progress (0-100)
 */
export function setSessionProgress(logoId: string, progress: number): void {
  progress = Math.max(0, Math.min(100, progress));

  // Each phase gets 25% of the total progress
  const phases: PhaseId[] = ['fase1', 'fase2', 'fase3', 'fase4'];

  phases.forEach((phaseId, index) => {
    const phaseStart = index * 25;
    const phaseEnd = (index + 1) * 25;

    let phaseProgress = 0;
    if (progress > phaseStart) {
      phaseProgress = Math.min(((progress - phaseStart) / 25) * 100, 100);
    }

    setPhaseProgress(logoId, phaseId, phaseProgress);
  });
}

// Sequential Story: Each phase animates in sequence
export function animateSessionSequential(
  logoId: string,
  canvasId: string
): void {
  const config = SESSION_ANIMATIONS.sequential;
  const logo = document.getElementById(logoId);
  if (!logo) return;

  // Ensure logo is at 100% (all phases complete)
  setSessionProgress(logoId, 100);

  // Wait briefly, then play animation
  setTimeout(() => {
    // Play sound
    celebrationSounds.playSessionComplete('sequential');

    // Animate each phase with characteristic movements
    config.phaseTimings.forEach((timing) => {
      setTimeout(() => {
        const phaseGroup = getPhaseGroup(logoId, timing.phaseId);
        if (!phaseGroup) return;

        // Apply characteristic animation for this phase
        const phaseConfig = PHASE_ANIMATIONS[timing.phaseId];
        if (phaseConfig.transform) {
          const keyframeAnimation = generateTransformKeyframes(
            timing.phaseId,
            `session-seq-${timing.phaseId}`,
            phaseConfig.transform.keyframes
          );
          phaseGroup.style.animation = `${keyframeAnimation} ${timing.duration}ms ${phaseConfig.easing}`;

          setTimeout(() => {
            phaseGroup.style.animation = '';
          }, timing.duration);
        }

        // Play phase sound
        celebrationSounds.playPhaseComplete(timing.phaseId);
      }, timing.delay);
    });

    // Final confetti burst
    setTimeout(() => {
      createConfettiFromCenter(canvasId, config.confettiCount, true);
    }, config.finalConfettiDelay);
  }, 100);
}

// Transformation: Dramatic posture transformation
export function animateSessionTransformation(
  logoId: string,
  canvasId: string
): void {
  const config = SESSION_ANIMATIONS.transformation;
  const logo = document.getElementById(logoId);
  if (!logo) return;

  // Ensure logo is at 100% (all phases complete)
  setSessionProgress(logoId, 100);

  // Wait briefly, then play animation
  setTimeout(() => {
    // Play sound
    celebrationSounds.playSessionComplete('transformation');

    // Apply transform to entire logo (dramatic effects on complete logo)
    const keyframeAnimation = generateTransformKeyframes(
      'all',
      'session-transformation',
      config.transform.keyframes
    );

    logo.style.animation = `${keyframeAnimation} ${config.duration}ms ${config.easing}`;

    // Multi-color glow effect
    if (config.glow && config.glowGradient) {
      const colors = Object.values(PHASES).map((p) => p.color);
      let colorIndex = 0;

      const glowInterval = setInterval(() => {
        logo.style.filter = `drop-shadow(0 0 ${config.glowIntensity}px ${colors[colorIndex]})`;
        colorIndex = (colorIndex + 1) % colors.length;
      }, config.duration / colors.length);

      setTimeout(() => {
        clearInterval(glowInterval);
        logo.style.filter = '';
      }, config.duration);
    }

    // Confetti
    setTimeout(() => {
      createConfettiFromCenter(canvasId, config.confettiCount, true);
    }, config.confettiDelay);

    // Clean up
    setTimeout(() => {
      logo.style.animation = '';
    }, config.duration);
  }, 100);
}

// Wave: Bounce wave across all letters
export function animateSessionWave(logoId: string, canvasId: string): void {
  const config = SESSION_ANIMATIONS.wave;
  const logo = document.getElementById(logoId);
  if (!logo) return;

  // Ensure logo is at 100% (all phases complete)
  setSessionProgress(logoId, 100);

  // Wait briefly, then play animation
  setTimeout(() => {
    // Play sound
    celebrationSounds.playSessionComplete('wave');

    // Bounce each phase in wave pattern
    config.bounceTimings.forEach((timing) => {
      setTimeout(() => {
        const phaseGroup = getPhaseGroup(logoId, timing.phaseId);
        if (!phaseGroup) return;

        // Bounce animation on already-filled phase
        phaseGroup.style.animation = `bounceHigh ${timing.duration}ms ease-in-out`;
        setTimeout(() => {
          phaseGroup.style.animation = '';
        }, timing.duration);
      }, timing.delay);
    });

    // Synchronized rotation after bounces
    setTimeout(() => {
      const keyframeAnimation = `spin360 ${config.syncRotationDuration}ms ease-in-out`;
      logo.style.animation = keyframeAnimation;

      setTimeout(() => {
        logo.style.animation = '';
      }, config.syncRotationDuration);
    }, config.syncRotationStart);

    // Confetti
    setTimeout(() => {
      createConfettiFromCenter(canvasId, config.confettiCount, true);
    }, config.confettiDelay);
  }, 100);
}

// Explosion: Massive pulses with tons of confetti
export function animateSessionExplosion(
  logoId: string,
  canvasId: string
): void {
  const config = SESSION_ANIMATIONS.explosion;
  const logo = document.getElementById(logoId);
  if (!logo) return;

  // Ensure logo is at 100% (all phases complete)
  setSessionProgress(logoId, 100);

  // Wait briefly, then play animation
  setTimeout(() => {
    // Play sound
    celebrationSounds.playSessionComplete('explosion');

    // Apply explosive transform (720° rotation!)
    const keyframeAnimation = generateTransformKeyframes(
      'all',
      'session-explosion',
      config.transform.keyframes
    );

    logo.style.animation = `${keyframeAnimation} ${config.duration}ms ${config.easing}`;

    // Pulsing glow through colors
    if (config.glow && config.glowPulse) {
      const colors = Object.values(PHASES).map((p) => p.color);
      let colorIndex = 0;

      const glowInterval = setInterval(() => {
        logo.style.filter = `drop-shadow(0 0 ${config.glowIntensity}px ${colors[colorIndex]})`;
        colorIndex = (colorIndex + 1) % colors.length;
      }, 200); // Fast color pulse

      setTimeout(() => {
        clearInterval(glowInterval);
        logo.style.filter = '';
      }, config.duration);
    }

    // Multiple confetti bursts
    setTimeout(() => {
      createConfettiFromCenter(canvasId, config.confettiCount / 3, true);
    }, config.confettiDelay);

    setTimeout(() => {
      createConfettiFromCenter(canvasId, config.confettiCount / 3, true);
    }, config.confettiDelay + 500);

    setTimeout(() => {
      createConfettiFromCenter(canvasId, config.confettiCount / 3, true);
    }, config.confettiDelay + 1000);

    // Clean up
    setTimeout(() => {
      logo.style.animation = '';
    }, config.duration);
  }, 100);
}

/**
 * Confetti System
 */

// Create confetti from the right edge of a phase's letters
function createConfettiFromPhaseEdge(
  logoId: string,
  canvasId: string,
  phaseId: PhaseId,
  count: number,
  shape: 'square' | 'rectangle',
  velocity: 'normal' | 'fast'
): void {
  const phaseGroup = getPhaseGroup(logoId, phaseId);
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

  if (!phaseGroup || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size to parent
  const rect = canvas.parentElement!.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Get position of the RIGHT EDGE of the phase letters
  const phaseRect = phaseGroup.getBoundingClientRect();
  const containerRect = canvas.parentElement!.getBoundingClientRect();

  const originX = phaseRect.right - containerRect.left; // Right edge
  const originY = phaseRect.top - containerRect.top + phaseRect.height / 2; // Vertical center

  const color = PHASES[phaseId].color;
  const velocityMult =
    CONFETTI_CONFIG.velocityMultiplier[velocity] ||
    CONFETTI_CONFIG.velocityMultiplier.normal;

  // Create particles
  const particles: ConfettiParticle[] = [];
  const [minSize, maxSize] = CONFETTI_CONFIG.particleSizeRange;
  const [minRotSpeed, maxRotSpeed] = CONFETTI_CONFIG.rotationSpeedRange;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: originX,
      y: originY,
      vx: (Math.random() - 0.5) * 12 * velocityMult,
      vy: (Math.random() - 1) * 12 * velocityMult,
      rotation: Math.random() * 360,
      rotationSpeed: minRotSpeed + Math.random() * (maxRotSpeed - minRotSpeed),
      size: minSize + Math.random() * (maxSize - minSize),
      color: color,
      life: 1,
      shape: shape,
    });
  }

  animateParticles(ctx, canvas, particles);
}

// Create confetti from center
function createConfettiFromCenter(
  canvasId: string,
  count: number,
  multicolor: boolean = false
): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.parentElement!.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const colors = multicolor
    ? Object.values(PHASES).map((p) => p.color)
    : [PHASES.fase1.color];

  const particles: ConfettiParticle[] = [];
  const [minSize, maxSize] = CONFETTI_CONFIG.particleSizeRange;
  const [minRotSpeed, maxRotSpeed] = CONFETTI_CONFIG.rotationSpeedRange;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 1) * 15,
      rotation: Math.random() * 360,
      rotationSpeed: minRotSpeed + Math.random() * (maxRotSpeed - minRotSpeed),
      size: minSize + Math.random() * (maxSize - minSize),
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      shape: 'square',
    });
  }

  animateParticles(ctx, canvas, particles);
}

// Animate particles
function animateParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  particles: ConfettiParticle[]
): void {
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let aliveCount = 0;

    particles.forEach((p) => {
      if (p.life <= 0) return;

      aliveCount++;

      // Update physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += CONFETTI_CONFIG.gravity;
      p.rotation += p.rotationSpeed;
      p.life -= CONFETTI_CONFIG.lifeDuration;

      // Render
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;

      // Draw shape
      if (p.shape === 'rectangle') {
        CONFETTI_CONFIG.shapes.rectangle(ctx, p.size);
      } else {
        CONFETTI_CONFIG.shapes.square(ctx, p.size);
      }

      ctx.restore();
    });

    if (aliveCount > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

/**
 * Helper: Generate CSS keyframes dynamically
 */
function generateTransformKeyframes(
  id: string,
  type: string,
  keyframes: any[]
): string {
  const name = `anim-${id}-${type}-${Date.now()}`;
  let keyframeStr = `@keyframes ${name} {`;

  keyframes.forEach((kf) => {
    const percent = (kf.offset * 100).toFixed(0);
    keyframeStr += `${percent}% {`;

    if (kf.scale !== undefined) keyframeStr += `transform: scale(${kf.scale});`;
    if (kf.scaleX !== undefined)
      keyframeStr += `transform: scaleX(${kf.scaleX});`;
    if (kf.rotate !== undefined)
      keyframeStr += `transform: rotate(${kf.rotate});`;
    if (kf.translateX !== undefined && kf.scale !== undefined)
      keyframeStr += `transform: scale(${kf.scale}) translateX(${kf.translateX});`;

    keyframeStr += `}`;
  });

  keyframeStr += `}`;

  // Inject into page
  const style = document.createElement('style');
  style.textContent = keyframeStr;
  document.head.appendChild(style);

  return name;
}
