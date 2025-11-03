/**
 * Workout Orchestrator
 * Connects WorkoutController state to UI rendering
 */

import { workoutSession, currentPhase, currentExercise, nextExercise, overallProgress } from '../stores/workoutController';
import type { WorkoutState } from '../stores/workoutController';
import { isExerciseCompleted } from '../stores/progressStore';

// TypeScript types for View Transitions API
declare global {
  interface Document {
    startViewTransition?(callback: () => void): {
      finished: Promise<void>;
      ready: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}

let lastRenderedState: WorkoutState | null = null;
let lastRenderedPhaseIndex: number = -1;
let lastRenderedExerciseIndex: number = -1;

// Helper function to convert YouTube URLs to embed format
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  let videoId: string | null = null;

  // Handle YouTube Shorts: youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    videoId = shortsMatch[1];
  }

  // Handle regular YouTube: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
  if (!videoId) {
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
  }

  // If already an embed URL, extract video ID
  if (!videoId && url.includes('youtube.com/embed/')) {
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  if (!videoId) return null;

  // Build embed URL with autoplay, mute, loop parameters
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,  // Required for loop
    controls: '0',       // Hide controls for cleaner look
    modestbranding: '1', // Minimal YouTube branding
    rel: '0'             // Don't show related videos at end
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Update UI with View Transitions API support
 */
async function updateUIWithTransition(state: WorkoutState) {
  // Check if View Transitions API is supported
  if (!document.startViewTransition) {
    updateUI(state);
    return;
  }

  // Use View Transitions API for smooth transitions
  const transition = document.startViewTransition(() => {
    updateUI(state);
  });

  try {
    await transition.finished;
  } catch (error) {
    console.log('View transition interrupted:', error);
  }
}

export function initWorkoutOrchestrator() {
  // Subscribe to workout session changes
  workoutSession.subscribe((session) => {
    // Re-render UI when state OR exercise changes
    const stateChanged = session.workoutState !== lastRenderedState;
    const exerciseChanged =
      session.currentPhaseIndex !== lastRenderedPhaseIndex ||
      session.currentExerciseIndex !== lastRenderedExerciseIndex;

    if (stateChanged || exerciseChanged) {
      console.log('Workout state/exercise changed:', {
        state: session.workoutState,
        phase: session.currentPhaseIndex,
        exercise: session.currentExerciseIndex,
        stateChanged,
        exerciseChanged
      });

      lastRenderedState = session.workoutState;
      lastRenderedPhaseIndex = session.currentPhaseIndex;
      lastRenderedExerciseIndex = session.currentExerciseIndex;

      updateUIWithTransition(session.workoutState);
    }

    // Always update progress and logo
    updateProgress();
    updateLogoProgress();
  });
}

function updateUI(state: WorkoutState) {
  const container = document.getElementById('stateContainer');
  if (!container) return;

  switch (state) {
    case 'IDLE':
      renderIdle(container);
      break;
    case 'PHASE_INTRO':
      renderPhaseIntro(container);
      break;
    case 'EXERCISE_PREP':
      renderExercisePrep(container);
      break;
    case 'EXERCISE_ACTIVE':
      renderExerciseActive(container);
      break;
    case 'REST_PERIOD':
      renderRestPeriod(container);
      break;
    case 'PHASE_COMPLETE':
      renderPhaseComplete(container);
      break;
    case 'WORKOUT_VERIFICATION':
      renderWorkoutVerification(container);
      break;
    case 'WORKOUT_COMPLETE':
      renderWorkoutComplete(container);
      break;
  }
}

function updateProgress() {
  // Progress is now shown only via the logo animation
  // No need to update text counters
}

function renderIdle(container: HTMLElement) {
  container.innerHTML = `
    <div class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
        <p class="text-gray-600">Initializing workout...</p>
      </div>
    </div>
  `;
}

function renderPhaseIntro(container: HTMLElement) {
  const phase = currentPhase.get();
  if (!phase) return;

  const phaseNumber = getCurrentPhaseNumber();
  const bgColor = phase.phase.colorLightHex || '#f5f5f5';
  const primaryColor = phase.phase.colorPrimaryHex || '#4f46e5';

  container.innerHTML = `
    <div class="flex h-full items-center justify-center p-6" style="background: linear-gradient(135deg, ${bgColor} 0%, white 100%);">
      <div class="text-center max-w-2xl">
        <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 font-['Barriecito'] text-4xl font-bold shadow-lg mx-auto"
             style="border-color: ${phase.phase.colorBorderHex}; background: white; color: ${primaryColor};">
          ${phaseNumber}
        </div>
        <h1 class="mb-4 text-center font-['Barriecito'] text-4xl font-bold" style="color: ${primaryColor};">
          ${phase.phase.name}
        </h1>
        <p class="mb-8 text-lg text-gray-700">
          ${phase.phase.description}
        </p>
        <div class="mb-8 rounded-lg bg-white px-6 py-3 shadow-md inline-block" style="border-left: 4px solid ${primaryColor};">
          <p class="text-2xl font-bold" style="color: ${primaryColor};">
            ${phase.phase.exercises.length} exercises
          </p>
        </div>
        <button id="continueFromPhaseBtn" class="rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105"
                style="background-color: ${primaryColor};">
          Continue
        </button>
      </div>
    </div>
  `;

  // Add event listener
  document.getElementById('continueFromPhaseBtn')?.addEventListener('click', () => {
    import('../stores/workoutController').then(({ continueFromPhaseIntro }) => {
      continueFromPhaseIntro();
    });
  });
}

function renderExercisePrep(container: HTMLElement) {
  const exercise = currentExercise.get();
  const phase = currentPhase.get();
  const session = workoutSession.get();

  if (!exercise || !phase) return;

  const phaseColor = phase.phase.colorPrimaryHex || '#4f46e5';

  // Get video URL
  let embedUrl = exercise.videoEmbedUrl ? getYouTubeEmbedUrl(exercise.videoEmbedUrl) : null;
  if (!embedUrl && exercise.videoUrl) {
    embedUrl = getYouTubeEmbedUrl(exercise.videoUrl);
  }

  const isVerticalVideo = (exercise.videoEmbedUrl?.includes('/shorts/') || exercise.videoUrl?.includes('/shorts/')) || false;
  const aspectRatio = isVerticalVideo ? '9 / 16' : '16 / 9';
  const maxWidth = isVerticalVideo ? '180px' : '300px';

  container.innerHTML = `
    <div class="flex h-full flex-col justify-between p-3">
      <!-- Exercise Title with view-transition-name -->
      <div class="mb-1 text-center" style="view-transition-name: exercise-title;">
        <h2 class="text-center text-lg font-bold text-gray-800">
          ${exercise.name}
        </h2>
      </div>

      <!-- Countdown Overlay Badge -->
      <div class="mb-2 flex justify-center">
        <div class="relative inline-block">
          <div class="absolute -top-2 -right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-lg" style="background-color: ${phaseColor};">
            <span id="prepTimer" class="font-mono text-xl font-bold text-white">${session.timeLeft}</span>
          </div>
          <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Get ready</span>
        </div>
      </div>

      <!-- Video/Image with view-transition-name for persistence -->
      ${embedUrl ? `
        <div class="mb-2 flex justify-center w-full" id="exerciseVideoWrapper" style="view-transition-name: exercise-video;">
          <div class="relative overflow-hidden rounded-xl shadow-lg" style="aspect-ratio: ${aspectRatio}; max-width: ${maxWidth}; width: 100%;">
            <iframe
              src="${embedUrl}"
              title="${exercise.name}"
              class="absolute inset-0 w-full h-full border-0 rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              style="background: #000;"
            ></iframe>
          </div>
        </div>
      ` : (exercise.imageUrl || exercise.gifUrl) ? `
        <div class="mb-2 flex justify-center" id="exerciseVideoWrapper" style="view-transition-name: exercise-video;">
          <div class="relative overflow-hidden rounded-xl shadow-lg" style="aspect-ratio: 9 / 16; max-width: 180px; width: 100%;">
            ${exercise.imageUrl ? `<img src="${exercise.imageUrl}" alt="${exercise.name}" class="w-full h-full object-cover" loading="lazy" />` : ''}
            ${exercise.gifUrl ? `<img src="${exercise.gifUrl}" alt="${exercise.name} (animated)" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />` : ''}
          </div>
        </div>
      ` : ''}

      ${exercise.reps ? `<p class="mb-1 text-center text-sm text-gray-600">${exercise.reps}</p>` : ''}
      <div class="mb-2 rounded-lg bg-gray-50 p-2 flex-shrink-0">
        <p class="text-center text-xs text-gray-700 leading-tight">${exercise.instructions}</p>
      </div>
    </div>
  `;
}

function renderExerciseActive(container: HTMLElement) {
  const exercise = currentExercise.get();
  const phase = currentPhase.get();
  const session = workoutSession.get();

  if (!exercise || !phase) return;

  // Check if exercise is already completed
  const alreadyCompleted = isExerciseCompleted(phase.id, exercise.id);
  console.log('[renderExerciseActive] Rendering exercise, already completed?', alreadyCompleted);

  const phaseColor = phase.phase.colorPrimaryHex || '#4f46e5';
  const hasTimer = exercise.duration > 0;

  // Get video URL
  let embedUrl = exercise.videoEmbedUrl ? getYouTubeEmbedUrl(exercise.videoEmbedUrl) : null;
  if (!embedUrl && exercise.videoUrl) {
    embedUrl = getYouTubeEmbedUrl(exercise.videoUrl);
  }

  const isVerticalVideo = (exercise.videoEmbedUrl?.includes('/shorts/') || exercise.videoUrl?.includes('/shorts/')) || false;
  const aspectRatio = isVerticalVideo ? '9 / 16' : '16 / 9';
  const maxWidth = isVerticalVideo ? '180px' : '300px'; // Smaller video

  container.innerHTML = `
    <div class="flex h-full flex-col justify-between p-3">
      <!-- Exercise Title with Timer/Counter and Info Button -->
      <div class="mb-1 flex items-center justify-center gap-2" style="view-transition-name: exercise-title;">
        ${hasTimer ? `
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <span id="exerciseTimer" class="font-mono text-sm font-bold" style="color: ${phaseColor};">${session.timeLeft}</span>
          </div>
        ` : exercise.sets ? `
          <div class="rounded-full bg-gray-100 px-2 py-1">
            <span id="setsCounter" class="font-mono text-xs font-bold text-gray-700">${session.currentSet}/${exercise.sets}</span>
          </div>
        ` : ''}
        <h2 class="text-center text-lg font-bold text-gray-800">
          ${exercise.name}
        </h2>
        <button id="exerciseInfoButton"
                class="flex-shrink-0 rounded-full bg-blue-100 p-1 text-blue-600 hover:bg-blue-200 transition-colors"
                title="More information"
                onclick="window.showExerciseInfo('${exercise.id}')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <!-- Already Completed Banner -->
      ${alreadyCompleted ? `
        <div class="mb-2 rounded-lg bg-green-100 border-2 border-green-500 p-3">
          <div class="flex items-center justify-center gap-2 mb-2">
            <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-bold text-green-700">¡Ya completado!</span>
          </div>
          <button id="repeatExerciseButton" class="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
            Repetir ejercicio
          </button>
        </div>
      ` : ''}

      <!-- Video/Image with view-transition-name for persistence -->
      ${embedUrl ? `
        <div class="mb-2 flex justify-center w-full" id="exerciseVideoWrapper" style="view-transition-name: exercise-video;">
          <div class="relative overflow-hidden rounded-xl shadow-lg" style="aspect-ratio: ${aspectRatio}; max-width: ${maxWidth}; width: 100%;">
            <iframe
              src="${embedUrl}"
              title="${exercise.name}"
              class="absolute inset-0 w-full h-full border-0 rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              style="background: #000;"
            ></iframe>
          </div>
        </div>
      ` : (exercise.imageUrl || exercise.gifUrl) ? `
        <div class="mb-2 flex justify-center" id="exerciseVideoWrapper" style="view-transition-name: exercise-video;">
          <div class="relative overflow-hidden rounded-xl shadow-lg" style="aspect-ratio: 9 / 16; max-width: 180px; width: 100%;">
            ${exercise.imageUrl ? `<img src="${exercise.imageUrl}" alt="${exercise.name}" class="w-full h-full object-cover" loading="lazy" />` : ''}
            ${exercise.gifUrl ? `<img src="${exercise.gifUrl}" alt="${exercise.name} (animated)" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />` : ''}
          </div>
        </div>
      ` : ''}

      ${exercise.reps ? `<p class="mb-1 text-center text-sm text-gray-600">${exercise.reps}</p>` : ''}
      <div class="mb-2 rounded-lg bg-gray-50 p-2 flex-shrink-0">
        <p class="text-center text-xs text-gray-700 leading-tight">${exercise.instructions}</p>
      </div>

      ${!hasTimer ? `
        <div class="manual-complete flex flex-col items-center">
          <button id="manualCompleteBtn" class="rounded-full px-6 py-2.5 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105"
                  style="background-color: ${phaseColor};">
            ✓ Complete
          </button>
        </div>
      ` : ''}
    </div>
  `;

  // Add event listener for manual complete
  document.getElementById('manualCompleteBtn')?.addEventListener('click', () => {
    import('../stores/workoutController').then(({ completeCurrentExercise }) => {
      completeCurrentExercise();
    });
  });

  // Add event listener for repeat exercise button
  document.getElementById('repeatExerciseButton')?.addEventListener('click', () => {
    console.log('[repeatExerciseButton] Repeating exercise');
    const phase = currentPhase.get();
    const exercise = currentExercise.get();
    if (!phase || !exercise) return;

    // Remove from completed exercises
    import('../stores/progressStore').then(({ completedExercises }) => {
      const key = `${phase.id}-${exercise.id}`;
      const completed = completedExercises.get();
      if (completed.has(key)) {
        const newCompleted = new Set(completed);
        newCompleted.delete(key);
        completedExercises.set(newCompleted);

        // Save progress and restart exercise
        import('../utils/storage').then(({ saveProgress }) => {
          saveProgress({
            completed: Array.from(newCompleted),
            skipped: [], // You might want to also handle skipped here
            level: 'principiante',
            sessionLocked: false,
            lastSessionDate: new Date().toISOString()
          });
        });
      }
    });

    // Restart the exercise by calling jumpToExercise to same exercise
    import('../stores/workoutController').then(({ workoutSession, jumpToExercise }) => {
      const session = workoutSession.get();
      // Small delay to let the UI update
      setTimeout(() => {
        jumpToExercise(session.currentPhaseIndex, session.currentExerciseIndex);
      }, 100);
    });
  });
}

function renderRestPeriod(container: HTMLElement) {
  const session = workoutSession.get();
  const next = nextExercise.get();
  const phase = currentPhase.get();

  if (!next || !phase) {
    console.warn('REST_PERIOD - Missing next exercise or phase!', { next, phase });
    return;
  }

  const phaseColor = phase.phase.colorPrimaryHex || '#4f46e5';

  // Get video/image for next exercise
  let embedUrl = next.videoEmbedUrl ? getYouTubeEmbedUrl(next.videoEmbedUrl) : null;
  if (!embedUrl && next.videoUrl) {
    embedUrl = getYouTubeEmbedUrl(next.videoUrl);
  }

  const isVerticalVideo = (next.videoEmbedUrl?.includes('/shorts/') || next.videoUrl?.includes('/shorts/')) || false;
  const aspectRatio = isVerticalVideo ? '9 / 16' : '16 / 9';
  const maxWidth = isVerticalVideo ? '180px' : '300px'; // Smaller video

  container.innerHTML = `
    <div class="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white p-3">
      <!-- Rest Timer with different styling -->
      <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 shadow-lg">
        <span id="restTimer" class="font-mono text-3xl font-bold text-orange-600">${session.timeLeft}</span>
      </div>
      <!-- Get Ready Title -->
      <h1 class="mb-2 text-center font-['Barriecito'] text-2xl font-bold" style="color: ${phaseColor};">
        Get Ready!
      </h1>
      <p class="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
        Next exercise:
      </p>

      <!-- Next Exercise Name -->
      <h2 class="mb-2 max-w-2xl text-center text-lg font-bold text-gray-800">
        ${next.name}
      </h2>

      <!-- Video/Image Preview with view-transition-name for persistence -->
      ${embedUrl ? `
        <div class="mb-2 flex justify-center w-full" id="exerciseVideoWrapper" style="view-transition-name: exercise-video;">
          <div class="relative overflow-hidden rounded-xl shadow-lg" style="aspect-ratio: ${aspectRatio}; max-width: ${maxWidth}; width: 100%;">
            <iframe
              src="${embedUrl}"
              title="${next.name}"
              class="absolute inset-0 w-full h-full border-0 rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              style="background: #000;"
            ></iframe>
          </div>
        </div>
      ` : (next.imageUrl || next.gifUrl) ? `
        <div class="mb-2 flex justify-center" id="exerciseVideoWrapper" style="view-transition-name: exercise-video;">
          <div class="relative overflow-hidden rounded-xl shadow-lg" style="aspect-ratio: 9 / 16; max-width: 180px; width: 100%;">
            ${next.imageUrl ? `<img src="${next.imageUrl}" alt="${next.name}" class="w-full h-full object-cover" loading="lazy" />` : ''}
            ${next.gifUrl ? `<img src="${next.gifUrl}" alt="${next.name} (animated)" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Exercise Info -->
      ${next.reps ? `
        <p class="mb-2 text-center text-sm text-gray-600">
          ${next.reps}
        </p>
      ` : ''}
    </div>
  `;

  // Add event listener
  document.getElementById('skipRestBtn')?.addEventListener('click', () => {
    import('../stores/workoutController').then(({ skipRest }) => {
      skipRest();
    });
  });
}

function renderPhaseComplete(container: HTMLElement) {
  const phase = currentPhase.get();
  if (!phase) return;

  container.innerHTML = `
    <div class="flex h-full items-center justify-center p-6">
      <div class="text-center">
        <h1 class="mb-4 text-4xl font-bold text-green-600">Phase Complete! 🎉</h1>
        <p class="mb-8 text-xl text-gray-700">Great job completing ${phase.phase.name}!</p>
        <button id="nextPhaseBtn" class="rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-indigo-700">
          Continue to Next Phase
        </button>
      </div>
    </div>
  `;

  // Add event listener
  document.getElementById('nextPhaseBtn')?.addEventListener('click', () => {
    import('../stores/workoutController').then(({ advanceToNextPhase }) => {
      advanceToNextPhase();
    });
  });
}

function renderWorkoutVerification(container: HTMLElement) {
  const workout = import('../stores/workoutController').then(({ currentWorkoutData }) => currentWorkoutData.get());
  const progress = import('../stores/progressStore').then(({ completedExercises, skippedExercises }) => {
    return { completed: completedExercises.get(), skipped: skippedExercises.get() };
  });

  Promise.all([workout, progress]).then(([workoutData, { completed, skipped }]) => {
    if (!workoutData) return;

    const phases = Object.entries(workoutData);
    let totalExercises = 0;
    let completedCount = 0;

    // Count exercises
    phases.forEach(([phaseId, phase]) => {
      phase.exercises.forEach((exercise) => {
        totalExercises++;
        const key = `${phaseId}-${exercise.id}`;
        if (completed.has(key)) completedCount++;
      });
    });

    const allCompleted = completedCount === totalExercises;
    const percentage = Math.round((completedCount / totalExercises) * 100);
    const pendingCount = totalExercises - completedCount;

    container.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center p-6">
        <div class="text-center max-w-md">
          ${allCompleted ? `
            <!-- All Complete - Celebration! -->
            <div class="mb-6 animate-bounce">
              <div class="text-8xl mb-4">🎉</div>
            </div>
            <h1 class="mb-3 text-3xl font-bold text-green-600">¡Todo Completado!</h1>
            <p class="mb-6 text-lg text-gray-700">
              Hiciste los <strong>${totalExercises} ejercicios</strong>
            </p>
            <button id="confirmCompleteBtn" class="w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 font-bold text-white shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105">
              ¡Celebrar! 🎊
            </button>
          ` : `
            <!-- Incomplete - Show Progress -->
            <div class="mb-6">
              <!-- Circular Progress -->
              <div class="relative inline-flex items-center justify-center">
                <svg class="transform -rotate-90" width="160" height="160">
                  <!-- Background circle -->
                  <circle cx="80" cy="80" r="70" stroke="#e5e7eb" stroke-width="12" fill="none" />
                  <!-- Progress circle -->
                  <circle
                    cx="80" cy="80" r="70"
                    stroke="#10b981"
                    stroke-width="12"
                    fill="none"
                    stroke-dasharray="${2 * Math.PI * 70}"
                    stroke-dashoffset="${2 * Math.PI * 70 * (1 - completedCount / totalExercises)}"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 1s ease-out;"
                  />
                </svg>
                <div class="absolute text-center">
                  <div class="text-4xl font-bold text-gray-800">${completedCount}</div>
                  <div class="text-sm text-gray-500">de ${totalExercises}</div>
                </div>
              </div>
            </div>

            <h1 class="mb-2 text-2xl font-bold text-gray-800">¡Casi llegas!</h1>
            <p class="mb-4 text-base text-gray-600">
              Te ${pendingCount === 1 ? 'falta' : 'faltan'} <strong class="text-orange-600">${pendingCount} ejercicio${pendingCount === 1 ? '' : 's'}</strong>
            </p>

            <!-- Message pointing to logo -->
            <div class="mb-6 flex flex-col items-center gap-3">
              <div class="rounded-lg bg-blue-100 border-2 border-blue-300 p-4 max-w-xs">
                <p class="text-sm font-semibold text-blue-800">
                  Toca el logo para ver qué ejercicios te faltan
                </p>
              </div>
            </div>
          `}

          <!-- Exit Button -->
          <a href="/" class="inline-block rounded-full ${allCompleted ? 'bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-700'} px-6 py-3 font-semibold hover:bg-gray-300 transition-colors ${allCompleted ? 'mt-4' : ''}">
            Salir
          </a>
        </div>
      </div>

      <!-- Pointing Hand Animation (if incomplete) -->
      ${!allCompleted ? `
        <div class="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div class="animate-bounce text-6xl" style="animation-duration: 1.5s;">
            👆
          </div>
        </div>
        <style>
          @keyframes pulseLogo {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          #progressLogo {
            animation: pulseLogo 2s ease-in-out infinite;
          }
        </style>
      ` : ''}
    `;

    // Add event listener for confirm button
    if (allCompleted) {
      document.getElementById('confirmCompleteBtn')?.addEventListener('click', () => {
        import('../stores/workoutController').then(({ confirmWorkoutComplete }) => {
          confirmWorkoutComplete();
        });
      });
    }
  });
}

function renderWorkoutComplete(container: HTMLElement) {
  container.innerHTML = `
    <div class="flex h-full items-center justify-center p-6">
      <div class="text-center max-w-2xl">
        <h1 class="mb-4 text-5xl font-bold text-green-600">Workout Complete! 🎉</h1>
        <p class="mb-4 text-2xl font-semibold text-gray-800">You crushed all 21 exercises!</p>
        <p class="mb-8 text-lg text-gray-600">
          You just invested 25 minutes in your health. That's what consistency looks like!
        </p>
        <div class="flex gap-4 justify-center">
          <a href="/" class="rounded-full bg-gray-200 px-8 py-4 font-bold text-gray-700 hover:bg-gray-300">
            Back to overview
          </a>
          <button id="repeatWorkoutBtn" class="rounded-full bg-indigo-600 px-8 py-4 font-bold text-white hover:bg-indigo-700">
            Repeat workout
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listener
  document.getElementById('repeatWorkoutBtn')?.addEventListener('click', () => {
    import('../stores/workoutController').then(({ startWorkout }) => {
      startWorkout();
    });
  });
}

function getCurrentPhaseNumber(): number {
  const session = workoutSession.get();
  return session.currentPhaseIndex + 1;
}

// Timer update subscription
let lastTimeLeft = -1;
workoutSession.subscribe((session) => {
  if (session.timeLeft !== lastTimeLeft) {
    lastTimeLeft = session.timeLeft;
    updateTimerDisplay(session.timeLeft, session.workoutState);
  }
});

function updateTimerDisplay(timeLeft: number, state: WorkoutState) {
  // Update inline timer displays based on current state
  switch (state) {
    case 'EXERCISE_PREP':
      const prepTimer = document.getElementById('prepTimer');
      if (prepTimer) prepTimer.textContent = timeLeft.toString();
      break;
    case 'EXERCISE_ACTIVE':
      const exerciseTimer = document.getElementById('exerciseTimer');
      if (exerciseTimer) exerciseTimer.textContent = timeLeft.toString();
      break;
    case 'REST_PERIOD':
      const restTimer = document.getElementById('restTimer');
      if (restTimer) restTimer.textContent = timeLeft.toString();
      break;
  }
}

function updateLogoProgress() {
  // Get REAL progress based on completed exercises, not current position
  import('../stores/progressStore').then(({ completedExercises }) => {
    import('../stores/workoutController').then(({ currentWorkoutData }) => {
      const completed = completedExercises.get();
      const workout = currentWorkoutData.get();
      if (!workout) return;

      const phaseIds = Object.keys(workout);
      const logoPhaseIds = ['fase1', 'fase2', 'fase3', 'fase4'];

      logoPhaseIds.forEach((logoPhaseId, logoIndex) => {
        const phaseElement = document.querySelector(`[data-phase="${logoPhaseId}"]`);
        const colorLayer = phaseElement?.querySelector('.color-layer') as HTMLElement;
        if (!colorLayer) return;

        // Get actual phase data
        const phaseId = phaseIds[logoIndex];
        const phaseData = workout[phaseId];
        if (!phaseData) return;

        const exercises = phaseData.exercises;
        const totalExercises = exercises.length;

        // Count ACTUALLY completed exercises in this phase
        let completedInPhase = 0;
        exercises.forEach((exercise) => {
          const key = `${phaseId}-${exercise.id}`;
          if (completed.has(key)) {
            completedInPhase++;
          }
        });

        const percentage = (completedInPhase / totalExercises) * 100;

        // Update visual based on REAL completion
        if (percentage >= 100) {
          // Phase fully completed - show full color
          colorLayer.style.clipPath = 'inset(0 0 0 0)';

          // Reset rotation to upright
          const baseLayer = phaseElement?.querySelector('.base-layer') as HTMLElement;
          if (baseLayer) {
            baseLayer.style.setProperty('--xrot', '0');
            baseLayer.style.setProperty('--yrot', '0');
          }
          colorLayer.style.setProperty('--xrot', '0');
          colorLayer.style.setProperty('--yrot', '0');
        } else if (percentage > 0) {
          // Partial progress - show based on completed exercises
          colorLayer.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;

          // Gradually straighten as phase progresses
          const xrot = 25 - (percentage / 100) * 25;
          const yrot = -15 + (percentage / 100) * 15;

          const baseLayer = phaseElement?.querySelector('.base-layer') as HTMLElement;
          if (baseLayer) {
            baseLayer.style.setProperty('--xrot', xrot.toString());
            baseLayer.style.setProperty('--yrot', yrot.toString());
          }
          colorLayer.style.setProperty('--xrot', xrot.toString());
          colorLayer.style.setProperty('--yrot', yrot.toString());
        } else {
          // No progress - no color, keep hunched
          colorLayer.style.clipPath = 'inset(0 100% 0 0)';

          const baseLayer = phaseElement?.querySelector('.base-layer') as HTMLElement;
          if (baseLayer) {
            baseLayer.style.setProperty('--xrot', '25');
            baseLayer.style.setProperty('--yrot', '-15');
          }
          colorLayer.style.setProperty('--xrot', '25');
          colorLayer.style.setProperty('--yrot', '-15');
        }
      });
    });
  });
}
