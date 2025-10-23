/**
 * Main Application Script
 * Handles all UI interactions and connects stores to the DOM
 */

import { initializeProgress, toggleExerciseCompletion, resetProgress, completedExercises } from '../stores/progressStore';
import { initializeLevel, setLevel, currentLevel } from '../stores/levelStore';
import { celebratePhase, celebrateComplete } from '../utils/celebration';
import { runInitialAnimations, animateModalOpen, animateModalClose, animateCompletionSection, animateCardComplete, animateCardUncomplete, animatePhaseToggle } from '../utils/animations';
import { hasSeenOnboarding, markOnboardingSeen } from '../utils/storage';
import type { Workout } from '../types/workout';

// Global types for data passed from Astro
declare global {
  interface Window {
    workoutData: Workout;
    exerciseDetailsData: any;
    resetConfirmMsg: string;
    phaseSequenceWarnings: string[];
  }
}

// Track which phases have already been celebrated
let celebratedPhases = new Set<string>();

// Phase colors for UI updates
const phaseColors = {
  fase1: { border: 'border-indigo-400', bg: 'bg-indigo-50', btnBg: 'bg-indigo-600', text: 'text-white' },
  fase2: { border: 'border-teal-400', bg: 'bg-teal-50', btnBg: 'bg-teal-500', text: 'text-white' },
  fase3: { border: 'border-orange-400', bg: 'bg-orange-50', btnBg: 'bg-orange-500', text: 'text-white' },
  fase4: { border: 'border-pink-400', bg: 'bg-pink-50', btnBg: 'bg-pink-500', text: 'text-white' }
};

/**
 * Update logo progress visualization based on completed exercises
 */
function updateProgress(): void {
  const workout = window.workoutData;
  if (!workout) return;

  const completed = completedExercises.get();
  const total = Object.values(workout).reduce((sum, phase) => sum + phase.exercises.length, 0);

  // Update each letter group with clip-path
  ['fase1', 'fase2', 'fase3', 'fase4'].forEach(phaseId => {
    const phase = workout[phaseId as keyof Workout];
    if (!phase) return;

    const phaseTotal = phase.exercises.length;

    // Count completed exercises in this phase
    const phaseCompleted = phase.exercises.filter(ex =>
      completed.has(`${phaseId}-${ex.id}`)
    ).length;

    // Calculate phase progress (0-1)
    const phaseProgress = phaseCompleted / phaseTotal;

    // Calculate the percentage that remains hidden (right to left)
    const hiddenPercent = 100 - (phaseProgress * 100);

    // Update clip-path and rotations for ALL logos
    const letterGroups = document.querySelectorAll(`.letter-group[data-phase="${phaseId}"]`);
    letterGroups.forEach(letterGroup => {
      const colorLayer = letterGroup.querySelector('.color-layer') as HTMLElement;
      const baseLayer = letterGroup.querySelector('.base-layer') as HTMLElement;

      if (colorLayer && baseLayer) {
        // Gradually animate rotations from "hunched" to "straight" based on progress
        // XROT: 25 (hunched backwards) -> 0 (straight)
        // YROT: -15 (tilted sideways) -> 0 (straight)
        const xrotValue = 25 - (phaseProgress * 25);
        const yrotValue = -15 + (phaseProgress * 15);

        // Update custom properties to animate rotations
        colorLayer.style.setProperty('--xrot', xrotValue.toString());
        baseLayer.style.setProperty('--xrot', xrotValue.toString());
        colorLayer.style.setProperty('--yrot', yrotValue.toString());
        baseLayer.style.setProperty('--yrot', yrotValue.toString());

        // For fase4 (the "p" has a descender), use negative values in top/bottom
        if (phaseId === 'fase4') {
          colorLayer.style.clipPath = `inset(-10% ${hiddenPercent}% -10% 0)`;
        } else {
          colorLayer.style.clipPath = `inset(0 ${hiddenPercent}% 0 0)`;
        }
      }
    });

    // Update progress bar
    const progressBar = document.querySelector(`.phase-progress-bar[data-phase="${phaseId}"]`);
    if (progressBar) {
      const progressFill = progressBar.querySelector('.absolute') as HTMLElement;
      if (progressFill) {
        progressFill.style.transform = `scaleX(${phaseProgress})`;
      }
    }

    // Celebrate if phase just completed
    if (phaseProgress === 1 && !celebratedPhases.has(phaseId)) {
      celebratedPhases.add(phaseId);
      setTimeout(() => {
        celebratePhase(phaseId as any);

        // Auto-scroll to next phase after confetti
        setTimeout(() => {
          scrollToNextPhase(phaseId);
        }, 800);
      }, 300);
    } else if (phaseProgress < 1 && celebratedPhases.has(phaseId)) {
      // If phase is no longer complete, allow celebrating it again
      celebratedPhases.delete(phaseId);
    }
  });

  // Celebrate full completion with spectacular confetti!
  if (completed.size === total && total > 0) {
    setTimeout(() => {
      celebrateComplete();
    }, 400);
  }

  // Update completion section visibility
  updateCompletionSection();
}

/**
 * Scroll to the next phase after completing current one
 */
function scrollToNextPhase(currentPhaseId: string): void {
  const phaseOrder = ['fase1', 'fase2', 'fase3', 'fase4'];
  const currentIndex = phaseOrder.indexOf(currentPhaseId);
  const nextPhaseId = phaseOrder[currentIndex + 1];

  if (nextPhaseId) {
    const nextContainer = document.querySelector(`.phase-container[data-phase-id="${nextPhaseId}"]`);
    if (nextContainer) {
      const nextToggle = nextContainer.querySelector('.phase-toggle') as HTMLElement;
      const nextContent = nextContainer.querySelector('.phase-content');

      // Expand next phase if collapsed
      if (nextContent && nextContent.classList.contains('hidden')) {
        nextToggle?.click();
      }

      // Smooth scroll to next phase with offset for sticky header
      setTimeout(() => {
        if (nextToggle) {
          const yOffset = -120;
          const elementPosition = nextToggle.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset + yOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }
}

/**
 * Show/hide completion section
 */
function updateCompletionSection(): void {
  const workout = window.workoutData;
  if (!workout) return;

  const total = Object.values(workout).reduce((sum, phase) => sum + phase.exercises.length, 0);
  const completed = completedExercises.get().size;
  const completionSection = document.getElementById('completion-section');
  if (!completionSection) return;

  if (completed === total && completed > 0) {
    // All exercises completed - show completion section
    if (completionSection.classList.contains('hidden')) {
      completionSection.classList.remove('hidden');

      // Smooth scroll to completion section with offset for sticky header
      setTimeout(() => {
        const yOffset = -120;
        const elementPosition = completionSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + yOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 1000); // Wait for confetti to finish

      // Animate section entrance
      animateCompletionSection(completionSection);
    }
  } else {
    // Not all exercises completed - hide completion section
    completionSection.classList.add('hidden');
  }
}

/**
 * Update exercise card UI based on completion status
 */
function updateCardUI(phaseId: string, exerciseId: string, isCompleted: boolean): void {
  const card = document.querySelector(`.exercise-card[data-phase-id="${phaseId}"][data-exercise-id="${exerciseId}"]`) as HTMLElement;
  if (!card) return;

  const btn = card.querySelector('.complete-btn') as HTMLElement;
  const colors = phaseColors[phaseId as keyof typeof phaseColors] || phaseColors.fase1;

  if (isCompleted) {
    // Complete animation
    card.classList.add(colors.border, colors.bg);
    card.classList.remove('border-slate-200', 'bg-white');
    if (btn) {
      btn.classList.add(colors.btnBg, colors.text);
      btn.classList.remove('bg-slate-200', 'text-slate-500');
    }
    animateCardComplete(card, btn);
  } else {
    // Uncomplete animation
    card.classList.remove(colors.border, colors.bg);
    card.classList.add('border-slate-200', 'bg-white');
    if (btn) {
      btn.classList.remove(colors.btnBg, colors.text);
      btn.classList.add('bg-slate-200', 'text-slate-500');
    }
    animateCardUncomplete(card, btn);
  }
}

/**
 * Initialize the app
 */
export function initApp(): void {
  const workout = window.workoutData;
  if (!workout) {
    console.error('Workout data not found');
    return;
  }

  // Initialize stores
  initializeProgress(workout);
  initializeLevel();

  // Subscribe to store changes to update UI
  completedExercises.subscribe(() => {
    updateProgress();
  });

  // Load initial state and update UI
  const completed = completedExercises.get();
  completed.forEach(key => {
    const firstDashIndex = key.indexOf('-');
    const phaseId = key.substring(0, firstDashIndex);
    const exerciseId = key.substring(firstDashIndex + 1);

    const card = document.querySelector(`.exercise-card[data-phase-id="${phaseId}"][data-exercise-id="${exerciseId}"]`) as HTMLElement;
    if (card) {
      const colors = phaseColors[phaseId as keyof typeof phaseColors] || phaseColors.fase1;
      card.classList.add(colors.border, colors.bg);
      card.classList.remove('border-slate-200', 'bg-white');
      const btn = card.querySelector('.complete-btn') as HTMLElement;
      if (btn) {
        btn.classList.add(colors.btnBg, colors.text);
        btn.classList.remove('bg-slate-200', 'text-slate-500');
      }
    }
  });

  updateProgress();
  updateLevelButtons();
  updateLevelInfo();

  // Check onboarding
  if (!hasSeenOnboarding()) {
    setTimeout(() => {
      openModal('onboarding-modal');
    }, 500);
  }

  // Run initial animations
  setTimeout(runInitialAnimations, 100);
}

/**
 * Update level buttons UI
 */
function updateLevelButtons(): void {
  const level = currentLevel.get();

  document.querySelectorAll('.level-btn').forEach(btn => {
    const btnLevel = (btn as HTMLElement).dataset.level;
    const iconEl = btn.querySelector('.level-icon');
    const titleEl = btn.querySelector('.level-title');
    const descEl = btn.querySelector('.level-desc');

    if (btnLevel === level) {
      // Selected state
      const gradient = (btn as HTMLElement).dataset.gradient;
      const border = (btn as HTMLElement).dataset.border;
      const ring = (btn as HTMLElement).dataset.ring;
      const text = (btn as HTMLElement).dataset.text;
      const textLight = (btn as HTMLElement).dataset.textLight;

      // Remove all possible gradient classes first
      btn.classList.remove('bg-white', 'dark:bg-gray-800', 'border-slate-200', 'dark:border-gray-700');
      btn.classList.remove('from-green-50', 'to-emerald-50', 'from-orange-50', 'to-amber-50', 'from-purple-50', 'to-violet-50');
      btn.classList.remove('border-green-400', 'border-orange-400', 'border-purple-400');
      btn.classList.remove('ring-green-400', 'ring-orange-400', 'ring-purple-400');
      btn.classList.remove('shadow-md', 'shadow-lg', 'scale-105', 'ring-2', 'ring-offset-2');

      // Apply selected state
      btn.classList.add('bg-gradient-to-br', 'dark:bg-opacity-30', 'shadow-lg', 'scale-105', 'ring-2', 'ring-offset-2');
      if (gradient) gradient.split(' ').forEach(cls => btn.classList.add(cls));
      if (border) btn.classList.add(border);
      if (ring) btn.classList.add(ring);

      // Icon scale
      if (iconEl) iconEl.classList.add('scale-110');

      // Title colors
      if (titleEl) {
        titleEl.classList.remove('text-slate-800', 'dark:text-gray-200', 'group-hover:text-blue-600', 'dark:group-hover:text-blue-400');
        titleEl.classList.remove('text-green-700', 'text-orange-700', 'text-purple-700');
        if (text) titleEl.classList.add(text, 'dark:text-blue-300');
      }

      // Description colors
      if (descEl) {
        descEl.classList.remove('text-slate-600', 'dark:text-gray-400', 'group-hover:text-slate-700', 'dark:group-hover:text-gray-300');
        descEl.classList.remove('text-green-600', 'text-orange-600', 'text-purple-600');
        if (textLight) descEl.classList.add(textLight, 'dark:text-blue-400');
      }
    } else {
      // Unselected state - reset to default
      btn.classList.remove('bg-gradient-to-br', 'dark:bg-opacity-30', 'shadow-lg', 'scale-105', 'ring-2', 'ring-offset-2');
      btn.classList.remove('from-green-50', 'to-emerald-50', 'from-orange-50', 'to-amber-50', 'from-purple-50', 'to-violet-50');
      btn.classList.remove('border-green-400', 'border-orange-400', 'border-purple-400');
      btn.classList.remove('ring-green-400', 'ring-orange-400', 'ring-purple-400');
      btn.classList.add('bg-white', 'dark:bg-gray-800', 'border-slate-200', 'dark:border-gray-700');

      // Icon reset
      if (iconEl) iconEl.classList.remove('scale-110');

      // Title reset
      if (titleEl) {
        titleEl.classList.remove('text-green-700', 'text-orange-700', 'text-purple-700', 'dark:text-blue-300');
        titleEl.classList.add('text-slate-800', 'dark:text-gray-200', 'group-hover:text-blue-600', 'dark:group-hover:text-blue-400');
      }

      // Description reset
      if (descEl) {
        descEl.classList.remove('text-green-600', 'text-orange-600', 'text-purple-600', 'dark:text-blue-400');
        descEl.classList.add('text-slate-600', 'dark:text-gray-400', 'group-hover:text-slate-700', 'dark:group-hover:text-gray-300');
      }
    }
  });
}

/**
 * Update level info in exercise cards
 */
function updateLevelInfo(): void {
  const level = currentLevel.get();

  document.querySelectorAll('.level-info').forEach(info => {
    const levels = JSON.parse((info as HTMLElement).dataset.levels || '{}');
    const levelText = info.querySelector('.level-text');
    const levelLabel = info.querySelector('.font-semibold');

    if (levels[level] && levelText && levelLabel) {
      levelText.textContent = levels[level];
      levelLabel.textContent = level.charAt(0).toUpperCase() + level.slice(1) + ':';
    }
  });
}

/**
 * Modal helpers
 */
function openModal(modalId: string): void {
  animateModalOpen(modalId);
}

function closeModal(modalId: string, callback?: () => void): void {
  animateModalClose(modalId, callback);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * Handle phase toggle with animations
 */
function handlePhaseToggle(phaseId: string): void {
  const animate = (window as any).motionAnimate;
  const stagger = (window as any).motionStagger;
  const workout = window.workoutData;

  const container = document.querySelector(`.phase-container[data-phase-id="${phaseId}"]`);
  if (!container) return;

  const content = container.querySelector('.phase-content') as HTMLElement;
  const chevronDown = container.querySelector('.chevron-down');
  const chevronUp = container.querySelector('.chevron-up');
  const btn = container.querySelector('.phase-toggle') as HTMLElement;
  const isExpanded = !content.classList.contains('hidden');

  const phase = (workout as any)[phaseId];

  if (isExpanded) {
    // Collapsing
    const exerciseCards = content.querySelectorAll('.exercise-card');

    if (animate && stagger) {
      animate(
        exerciseCards,
        { opacity: [1, 0], y: [0, -10] },
        { duration: 0.2, delay: stagger(0.03, { from: 'first' }) }
      ).finished.then(() => {
        content.classList.add('hidden');
      });

      chevronUp?.classList.remove('opacity-100');
      chevronUp?.classList.add('opacity-0');
      chevronDown?.classList.remove('opacity-0');
      chevronDown?.classList.add('opacity-100');
    } else {
      content.classList.add('hidden');
      chevronUp?.classList.remove('opacity-100');
      chevronUp?.classList.add('opacity-0');
      chevronDown?.classList.remove('opacity-0');
      chevronDown?.classList.add('opacity-100');
    }

    // Update button style
    if (phase) {
      btn.style.background = `linear-gradient(135deg, white 0%, ${phase.colorLightHex} 100%)`;
      btn.classList.remove('shadow-xl', 'ring-2');
      btn.classList.add('shadow-lg');
    }
  } else {
    // Expanding
    content.classList.remove('hidden');
    const exerciseCards = content.querySelectorAll('.exercise-card');

    if (animate && stagger) {
      animate(
        exerciseCards,
        { opacity: [0, 1], y: [10, 0] },
        { duration: 0.3, delay: stagger(0.05, { from: 'first', start: 0.1 }), easing: "ease-out" }
      );

      chevronDown?.classList.remove('opacity-100');
      chevronDown?.classList.add('opacity-0');
      chevronUp?.classList.remove('opacity-0');
      chevronUp?.classList.add('opacity-100');
    } else {
      chevronDown?.classList.remove('opacity-100');
      chevronDown?.classList.add('opacity-0');
      chevronUp?.classList.remove('opacity-0');
      chevronUp?.classList.add('opacity-100');
    }

    // Update button style
    if (phase) {
      btn.style.background = `linear-gradient(135deg, white 0%, ${phase.colorLightHex} 50%, ${phase.colorPrimaryHex}15 100%)`;
      btn.classList.remove('shadow-lg');
      btn.classList.add('shadow-xl', 'ring-2');
      btn.style.setProperty('--tw-ring-color', phase.colorBorderHex);
    }
  }
}

/**
 * Handle exercise info modal
 */
function handleExerciseInfo(exerciseId: string): void {
  const animate = (window as any).motionAnimate;
  const workout = window.workoutData;
  const exerciseDetails = window.exerciseDetailsData;

  // Bounce animation on click
  const btn = document.querySelector(`[data-exercise-id="${exerciseId}"].info-btn`) as HTMLElement;
  if (animate && btn) {
    animate(
      btn,
      { scale: [1, 0.9, 1.1, 1], rotate: [0, -10, 10, 0] },
      { duration: 0.5, easing: "ease-out" }
    );
  }

  const details = exerciseDetails[exerciseId];
  if (details) {
    // Find exercise name and video URL
    let exerciseName = '';
    let videoUrl = '';
    for (const phase of Object.values(workout)) {
      const exercise = phase.exercises.find((ex: any) => ex.id === exerciseId);
      if (exercise) {
        exerciseName = exercise.name;
        videoUrl = exercise.videoUrl || '';
        break;
      }
    }

    const titleEl = document.getElementById('modal-title');
    const musclesEl = document.getElementById('modal-muscles');
    const whyEl = document.getElementById('modal-why');
    const evidenceEl = document.getElementById('modal-evidence');
    const tipsEl = document.getElementById('modal-tips');

    if (titleEl) titleEl.textContent = exerciseName;
    if (musclesEl) musclesEl.textContent = details.muscles;
    if (whyEl) whyEl.textContent = details.why;
    if (evidenceEl) evidenceEl.textContent = details.evidence;
    if (tipsEl) tipsEl.textContent = details.tips;

    // Handle video display
    const videoContainer = document.getElementById('modal-video-container');
    const videoIframe = document.getElementById('modal-video-iframe') as HTMLIFrameElement;

    if (videoUrl && videoContainer && videoIframe) {
      // Convert YouTube watch URL to embed URL
      const videoId = videoUrl.includes('watch?v=')
        ? videoUrl.split('watch?v=')[1].split('&')[0]
        : videoUrl.split('/').pop();
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      videoIframe.src = embedUrl;
      videoContainer.classList.remove('hidden');
    } else if (videoContainer && videoIframe) {
      videoContainer.classList.add('hidden');
      videoIframe.src = '';
    }

    openModal('exercise-info-modal');
  }
}

/**
 * Close exercise info modal and stop video
 */
function closeExerciseInfoModal(): void {
  closeModal('exercise-info-modal', () => {
    const videoIframe = document.getElementById('modal-video-iframe') as HTMLIFrameElement;
    if (videoIframe) videoIframe.src = '';
  });
}

/**
 * Handle level selection with animations
 */
function handleLevelSelect(level: 'principiante' | 'intermedio' | 'avanzado'): void {
  const animate = (window as any).motionAnimate;

  setLevel(level);
  updateLevelButtons();
  updateLevelInfo();

  // Animate level info updates
  if (animate) {
    document.querySelectorAll('.level-info').forEach(info => {
      animate(info, { opacity: [0.6, 1], x: [-5, 0] }, { duration: 0.3 });
    });
  }
}

// Export functions for use in inline script
(window as any).toggleExerciseCompletionFn = (phaseId: string, exerciseId: string) => {
  const isCompleted = toggleExerciseCompletion(phaseId, exerciseId);
  updateCardUI(phaseId, exerciseId, isCompleted);
};

(window as any).resetProgressFn = () => {
  if (confirm(window.resetConfirmMsg)) {
    resetProgress();
    celebratedPhases.clear();

    // Reset UI
    document.querySelectorAll('.exercise-card').forEach(card => {
      const phaseId = (card as HTMLElement).dataset.phaseId;
      const colors = phaseColors[phaseId as keyof typeof phaseColors] || phaseColors.fase1;

      card.classList.remove(colors.border, colors.bg);
      card.classList.add('border-slate-200', 'bg-white');
      const btn = card.querySelector('.complete-btn');
      if (btn) {
        btn.classList.remove(colors.btnBg, colors.text);
        btn.classList.add('bg-slate-200', 'text-slate-500');
      }
    });

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    updateProgress();
  }
};

(window as any).handleLevelSelectFn = handleLevelSelect;
(window as any).handlePhaseToggleFn = handlePhaseToggle;
(window as any).handleExerciseInfoFn = handleExerciseInfo;
(window as any).openModalFn = openModal;
(window as any).closeModalFn = closeModal;
(window as any).closeExerciseInfoModalFn = closeExerciseInfoModal;
(window as any).markOnboardingSeenFn = markOnboardingSeen;
