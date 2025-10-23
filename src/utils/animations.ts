/**
 * Animation Utilities
 * Centralized animation logic using Motion One
 */

// Using any types for Motion functions to avoid strict type checking issues
type AnimateFunction = any;
type StaggerFunction = any;

// Get Motion functions from window (set by the non-inline script)
function getMotion(): { animate: AnimateFunction; stagger: StaggerFunction } | null {
  const win = window as any;
  if (win.motionAnimate && win.motionStagger) {
    return {
      animate: win.motionAnimate,
      stagger: win.motionStagger
    };
  }
  return null;
}

/**
 * Run initial page animations (logo, phases, FAB)
 */
export function runInitialAnimations(): void {
  const motion = getMotion();
  if (!motion) {
    console.warn('Motion not loaded yet');
    return;
  }

  const { animate, stagger } = motion;

  // Animate logo entrance
  const logo = document.getElementById('progress-logo');
  if (logo) {
    animate(
      logo,
      { opacity: [0, 1], y: [-20, 0] },
      { duration: 0.8, easing: "ease-out" }
    );
  }

  // Animate letter groups with stagger
  const letterGroups = document.querySelectorAll('.letter-group');
  if (letterGroups.length > 0) {
    animate(
      letterGroups,
      { opacity: [0, 1], scale: [0.8, 1] },
      { duration: 0.6, delay: stagger(0.1, { start: 0.3 }), easing: "ease-out" }
    );
  }

  // Animate phase containers with stagger
  const phaseContainers = document.querySelectorAll('.phase-container');
  if (phaseContainers.length > 0) {
    animate(
      phaseContainers,
      { opacity: [0, 1], y: [30, 0] },
      { duration: 0.5, delay: stagger(0.15, { start: 0.5 }), easing: [0.22, 1, 0.36, 1] }
    );
  }

  // Animate FAB help button
  const helpBtn = document.getElementById('show-onboarding-btn');
  if (helpBtn) {
    animate(
      helpBtn,
      { opacity: [0, 1], scale: [0, 1.1, 1] },
      { duration: 0.6, delay: 1.2, easing: [0.34, 1.56, 0.64, 1] }
    );
  }
}

/**
 * Animate modal opening
 */
export function animateModalOpen(modalId: string): void {
  const motion = getMotion();
  if (!motion) return;

  const { animate, stagger } = motion;
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('hidden');
  const content = modal.querySelector('.bg-white');

  // Ocultar el FAB cuando se abre el modal de onboarding
  if (modalId === 'onboarding-modal') {
    const fab = document.getElementById('show-onboarding-btn');
    if (fab) {
      animate(fab, { opacity: [1, 0], scale: [1, 0.8] }, { duration: 0.2 }).finished.then(() => {
        fab.style.display = 'none';
      });
    }
  }

  // Animate backdrop
  animate(modal, { opacity: [0, 1] }, { duration: 0.2 });

  // Animate modal content
  if (content) {
    animate(
      content,
      { opacity: [0, 1], scale: [0.95, 1], y: [20, 0] },
      { duration: 0.3, delay: 0.1, easing: "ease-out" }
    );
  }

  // Stagger animation for onboarding sections
  if (modalId === 'onboarding-modal') {
    const sections = modal.querySelectorAll('.onboarding-section');
    if (sections.length > 0) {
      animate(
        sections,
        { opacity: [0, 1], y: [20, 0] },
        {
          duration: 0.4,
          delay: stagger(0.08, { start: 0.3 }),
          easing: "ease-out"
        }
      );
    }
  }
}

/**
 * Animate modal closing
 */
export function animateModalClose(modalId: string, callback?: () => void): void {
  const motion = getMotion();
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const content = modal.querySelector('.bg-white');

  if (motion) {
    const { animate } = motion;

    // Animate content out
    if (content) {
      animate(content, { opacity: [1, 0], scale: [1, 0.95], y: [0, 10] }, { duration: 0.2 });
    }

    // Animate backdrop out
    animate(modal, { opacity: [1, 0] }, { duration: 0.2, delay: 0.1 }).finished.then(() => {
      modal.classList.add('hidden');
      if (callback) callback();

      // Mostrar el FAB cuando se cierra el modal de onboarding
      if (modalId === 'onboarding-modal') {
        const fab = document.getElementById('show-onboarding-btn');
        if (fab) {
          fab.style.display = 'flex';
          animate(fab, { opacity: [0, 1], scale: [0.8, 1] }, { duration: 0.3 });
        }
      }
    });
  } else {
    // Fallback without animation
    modal.classList.add('hidden');
    if (callback) callback();

    // Mostrar el FAB cuando se cierra el modal de onboarding
    if (modalId === 'onboarding-modal') {
      const fab = document.getElementById('show-onboarding-btn');
      if (fab) {
        fab.style.display = 'flex';
      }
    }
  }
}

/**
 * Animate completion section entrance
 */
export function animateCompletionSection(element: HTMLElement): void {
  const motion = getMotion();
  if (!motion) return;

  const { animate } = motion;
  animate(
    element,
    { opacity: [0, 1], y: [30, 0], scale: [0.95, 1] },
    { duration: 0.6, easing: "ease-out" }
  );
}

/**
 * Animate exercise card completion
 */
export function animateCardComplete(card: HTMLElement, btn?: HTMLElement): void {
  const motion = getMotion();
  if (!motion) return;

  const { animate } = motion;

  // Card success animation
  animate(
    card,
    { scale: [1, 1.02, 1], y: [0, -4, 0] },
    { duration: 0.6, easing: "ease-out" }
  );

  // Celebratory pulse for button
  if (btn) {
    animate(btn, { scale: [1, 1.3, 1] }, { duration: 0.5, easing: "ease-out" });
  }
}

/**
 * Animate exercise card un-completion
 */
export function animateCardUncomplete(card: HTMLElement, btn?: HTMLElement): void {
  const motion = getMotion();
  if (!motion) return;

  const { animate } = motion;

  // Card bounce back
  animate(card, { scale: [0.98, 1] }, { duration: 0.4, easing: "ease-out" });

  // Subtle scale animation for button
  if (btn) {
    animate(btn, { scale: [1.2, 1] }, { duration: 0.3, easing: "ease-out" });
  }
}

/**
 * Animate phase toggle
 */
export function animatePhaseToggle(
  cards: NodeListOf<Element>,
  isExpanding: boolean
): void {
  const motion = getMotion();
  if (!motion) return;

  const { animate, stagger } = motion;

  if (isExpanding) {
    // Animate cards in
    animate(
      cards,
      { opacity: [0, 1], y: [10, 0] },
      { duration: 0.3, delay: stagger(0.05, { from: 'first', start: 0.1 }), easing: "ease-out" }
    );
  } else {
    // Animate cards out
    animate(
      cards,
      { opacity: [1, 0], y: [0, -10] },
      { duration: 0.2, delay: stagger(0.03, { from: 'first' }) }
    );
  }
}
