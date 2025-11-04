/**
 * Animation configuration for the logo celebration system
 * Defines parameters for exercise, phase, and session complete animations
 */

export type PhaseId = 'fase1' | 'fase2' | 'fase3' | 'fase4';

export interface PhaseConfig {
  id: PhaseId;
  name: string;
  letters: string;
  color: string;
  colorName: string;
}

export const PHASES: Record<PhaseId, PhaseConfig> = {
  fase1: {
    id: 'fase1',
    name: 'INHIBIR',
    letters: 'un',
    color: '#4f46e5',
    colorName: 'indigo',
  },
  fase2: {
    id: 'fase2',
    name: 'ALARGAR',
    letters: 'sl',
    color: '#14b8a6',
    colorName: 'teal',
  },
  fase3: {
    id: 'fase3',
    name: 'ACTIVAR',
    letters: 'um',
    color: '#f97316',
    colorName: 'orange',
  },
  fase4: {
    id: 'fase4',
    name: 'INTEGRAR',
    letters: 'p!',
    color: '#ec4899',
    colorName: 'pink',
  },
};

/**
 * Exercise Complete Animations (Subtle)
 * These are quick, subtle animations for individual exercise completion
 */
export const EXERCISE_ANIMATIONS = {
  fase1: {
    name: 'Soft Release',
    description: 'Gentle compression-release pulse',
    duration: 400,
    xrot: {
      keyframes: [
        { value: 25, offset: 0 },
        { value: 28, offset: 0.3 },
        { value: 22, offset: 1 },
      ],
    },
    transform: {
      keyframes: [
        { scale: 0.98, offset: 0 },
        { scale: 1.02, offset: 0.5 },
        { scale: 1, offset: 1 },
      ],
    },
    easing: 'ease-in-out',
  },
  fase2: {
    name: 'Gentle Stretch',
    description: 'Subtle horizontal extension',
    duration: 500,
    yrot: {
      keyframes: [
        { value: -15, offset: 0 },
        { value: -10, offset: 0.4 },
        { value: -15, offset: 1 },
      ],
    },
    transform: {
      keyframes: [
        { scaleX: 0.98, offset: 0 },
        { scaleX: 1.05, offset: 0.5 },
        { scaleX: 1, offset: 1 },
      ],
    },
    easing: 'ease-in-out',
  },
  fase3: {
    name: 'Explosive Contraction',
    description: 'Rapid muscle contraction burst',
    duration: 350,
    xrot: {
      // Quick compression then release
      keyframes: [
        { value: 25, offset: 0 },
        { value: 30, offset: 0.3 },  // Contract
        { value: 20, offset: 1 },     // Explode
      ],
    },
    transform: {
      keyframes: [
        { scale: 1, offset: 0 },
        { scale: 0.88, offset: 0.3 },  // Compress
        { scale: 1.15, offset: 0.65 }, // Explode out
        { scale: 1, offset: 1 },       // Settle
      ],
    },
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy
  },
  fase4: {
    name: 'Subtle Flow',
    description: 'Gentle wave motion',
    duration: 600,
    xrot: {
      keyframes: [
        { value: 25, offset: 0 },
        { value: 22, offset: 0.5 },
        { value: 25, offset: 1 },
      ],
    },
    yrot: {
      keyframes: [
        { value: -15, offset: 0 },
        { value: -12, offset: 0.5 },
        { value: -15, offset: 1 },
      ],
    },
    transform: {
      keyframes: [
        { rotate: '0deg', offset: 0 },
        { rotate: '15deg', offset: 0.5 },
        { rotate: '0deg', offset: 1 },
      ],
    },
    easing: 'ease-in-out',
  },
};

/**
 * Phase Complete Animations (Medium)
 * These are more dramatic animations for completing an entire phase
 */
export const PHASE_ANIMATIONS = {
  fase1: {
    name: 'Compression Release',
    description: 'Compress and release tension',
    duration: 800,
    confettiDelay: 300,
    confettiCount: 50,
    xrot: {
      keyframes: [
        { value: 25, offset: 0 },
        { value: 35, offset: 0.3 }, // Compress
        { value: 0, offset: 1 }, // Release
      ],
    },
    transform: {
      keyframes: [
        { scale: 1, translateX: '0px', offset: 0 },
        { scale: 0.95, translateX: '-3px', offset: 0.15 },
        { scale: 0.95, translateX: '3px', offset: 0.3 },
        { scale: 1.05, translateX: '-2px', offset: 0.45 },
        { scale: 1.05, translateX: '2px', offset: 0.6 },
        { scale: 1, translateX: '0px', offset: 1 },
      ],
    },
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  fase2: {
    name: 'Stretch Complete',
    description: 'Lateral stretch extension',
    duration: 1000,
    confettiDelay: 300,
    confettiCount: 60,
    confettiShape: 'rectangle', // Elongated particles
    yrot: {
      keyframes: [
        { value: -15, offset: 0 },
        { value: 10, offset: 0.5 }, // Stretch to other side
        { value: 0, offset: 1 },
      ],
    },
    transform: {
      keyframes: [
        { scaleX: 0.9, offset: 0 },
        { scaleX: 1.2, offset: 0.5 },
        { scaleX: 1.0, offset: 1 },
      ],
    },
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  fase3: {
    name: 'Activation Burst',
    description: 'Rapid pulsing activation',
    duration: 900,
    confettiDelay: 300,
    confettiCount: 70,
    confettiVelocity: 'fast', // Explosive
    xrot: {
      // Rapid pulses
      keyframes: [
        { value: 25, offset: 0 },
        { value: 15, offset: 0.15 },
        { value: 25, offset: 0.3 },
        { value: 15, offset: 0.45 },
        { value: 0, offset: 1 },
      ],
    },
    transform: {
      keyframes: [
        { scale: 1.0, offset: 0 },
        { scale: 1.15, offset: 0.15 },
        { scale: 1.0, offset: 0.3 },
        { scale: 1.15, offset: 0.45 },
        { scale: 1.05, offset: 0.6 },
        { scale: 1.0, offset: 1 },
      ],
    },
    easing: 'ease-out',
  },
  fase4: {
    name: 'Integration Flow',
    description: 'Flowing lemniscate pattern',
    duration: 1200,
    confettiDelay: 300,
    confettiCount: 80,
    xrot: {
      // Figure-8 motion
      keyframes: [
        { value: 25, offset: 0 },
        { value: 10, offset: 0.25 },
        { value: 0, offset: 0.5 },
        { value: -10, offset: 0.75 },
        { value: 0, offset: 1 },
      ],
    },
    yrot: {
      keyframes: [
        { value: -15, offset: 0 },
        { value: 0, offset: 0.25 },
        { value: 10, offset: 0.5 },
        { value: 0, offset: 0.75 },
        { value: 0, offset: 1 },
      ],
    },
    transform: {
      keyframes: [
        { rotate: '0deg', scale: 1, offset: 0 },
        { rotate: '180deg', scale: 1.1, offset: 0.5 },
        { rotate: '360deg', scale: 1, offset: 1 },
      ],
    },
    trail: true,
    easing: 'ease-in-out',
  },
};

/**
 * Session Complete Animations (Epic)
 * These are the most dramatic animations for completing all phases
 */
export const SESSION_ANIMATIONS = {
  sequential: {
    name: 'Sequential Story',
    description: 'Each phase animates in sequence',
    totalDuration: 2400,
    confettiCount: 200,
    phaseTimings: [
      { phaseId: 'fase1', delay: 0, duration: 600 },
      { phaseId: 'fase2', delay: 600, duration: 600 },
      { phaseId: 'fase3', delay: 1200, duration: 600 },
      { phaseId: 'fase4', delay: 1800, duration: 600 },
    ],
    finalConfettiDelay: 2400,
  },
  transformation: {
    name: 'Transformation',
    description: 'Dramatic posture transformation',
    duration: 2000,
    confettiCount: 250,
    confettiDelay: 1000,
    xrot: {
      keyframes: [
        { value: 25, offset: 0 },
        { value: 35, offset: 0.2 }, // Exaggerate bad posture
        { value: 0, offset: 1 }, // Perfect posture
      ],
    },
    yrot: {
      keyframes: [
        { value: -15, offset: 0 },
        { value: -20, offset: 0.2 },
        { value: 0, offset: 1 },
      ],
    },
    transform: {
      keyframes: [
        { scale: 0.8, offset: 0 },
        { scale: 1.3, offset: 0.5 },
        { scale: 1.0, offset: 1 },
      ],
    },
    glow: true,
    glowIntensity: 30,
    glowGradient: true, // All 4 phase colors
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  wave: {
    name: 'Unity Wave',
    description: 'Wave pattern across all letters',
    totalDuration: 2200,
    confettiCount: 180,
    bounceTimings: [
      { phaseId: 'fase1', delay: 0, duration: 500 },
      { phaseId: 'fase2', delay: 150, duration: 500 },
      { phaseId: 'fase3', delay: 300, duration: 500 },
      { phaseId: 'fase4', delay: 450, duration: 500 },
    ],
    syncRotationStart: 1000,
    syncRotationDuration: 1000,
    rotation: 360,
    trail: true,
    confettiDelay: 2000,
  },
  explosion: {
    name: 'Dopamine Explosion',
    description: 'Multiple pulses with massive confetti',
    duration: 2500,
    confettiCount: 300,
    confettiDelay: 1500,
    transform: {
      keyframes: [
        { scale: 1.0, rotate: '0deg', offset: 0 },
        { scale: 1.5, rotate: '180deg', offset: 0.25 },
        { scale: 1.2, rotate: '360deg', offset: 0.5 },
        { scale: 1.4, rotate: '540deg', offset: 0.75 },
        { scale: 1.0, rotate: '720deg', offset: 1 },
      ],
    },
    glow: true,
    glowIntensity: 40,
    glowPulse: true, // Pulsing through different colors
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

/**
 * Confetti configuration
 */
export const CONFETTI_CONFIG = {
  gravity: 0.4,
  lifeDuration: 0.012, // Rate of fade (lower = lasts longer)
  particleSizeRange: [4, 12], // Min and max size
  rotationSpeedRange: [-10, 10], // Degrees per frame
  velocityMultiplier: {
    normal: 1,
    fast: 1.5,
  },
  shapes: {
    square: (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.fillRect(-size / 2, -size / 2, size, size);
    },
    rectangle: (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    },
  },
};

/**
 * Timing constants
 */
export const TIMING = {
  // Standard easing functions
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',

  // Bouncy easing
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  elasticOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
