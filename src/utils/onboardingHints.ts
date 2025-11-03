/**
 * Onboarding Hints System
 * Shows progressive hints based on recent familiarity, not total usage
 *
 * This system is designed to be reusable across all onboarding hints in the app.
 *
 * Philosophy:
 * - Hints should appear prominently for new users or users returning after time away
 * - Hints should disappear quickly for regular/daily users who already know the feature
 * - Hints can "come back" if a user hasn't used a feature in a while (re-onboarding)
 *
 * Time-based visibility:
 * - Never used: Full hint with pulse animation (onboarding)
 * - Used < 1 day ago: Hidden (user knows what to do)
 * - Used 1-3 days ago: Subtle (20% opacity, no reminders)
 * - Used 3-7 days ago: Medium (50% opacity, with reminders)
 * - Used 7-14 days ago: Strong (80% opacity, with pulse, re-onboarding)
 * - Used 14+ days ago: Full (100% opacity, with pulse, full re-onboarding)
 *
 * @example
 * ```typescript
 * import { getHintVisibility, markFeatureAsUsed } from './onboardingHints';
 *
 * // On component mount
 * const visibility = getHintVisibility('feature-key');
 * hintElement.style.opacity = visibility.opacity.toString();
 * if (visibility.shouldPulse) {
 *   hintElement.classList.add('animate-pulse');
 * }
 *
 * // On user interaction
 * button.addEventListener('click', () => {
 *   markFeatureAsUsed('feature-key');
 *   // Update hint visibility
 *   const newVisibility = getHintVisibility('feature-key');
 *   // ... apply new visibility
 * });
 * ```
 */

export interface HintVisibility {
  opacity: number;
  shouldPulse: boolean;
  shouldRemind: boolean;
}

/**
 * Calculate hint visibility based on last interaction time
 * @param featureKey - Unique key for the feature (e.g., 'logo-navigation')
 * @returns Visibility settings for the hint
 */
export function getHintVisibility(featureKey: string): HintVisibility {
  const storageKey = `unslump-last-used-${featureKey}`;
  const lastUsedTimestamp = localStorage.getItem(storageKey);

  // Never used - show full hint with pulse
  if (!lastUsedTimestamp) {
    return {
      opacity: 1,
      shouldPulse: true,
      shouldRemind: true,
    };
  }

  const lastUsed = new Date(parseInt(lastUsedTimestamp));
  const now = new Date();
  const daysSinceLastUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

  // Recent usage (< 1 day) - completely hide hint (user knows what to do)
  if (daysSinceLastUse < 1) {
    return {
      opacity: 0,
      shouldPulse: false,
      shouldRemind: false,
    };
  }

  // Used recently (1-3 days) - very subtle hint
  if (daysSinceLastUse < 3) {
    return {
      opacity: 0.2,
      shouldPulse: false,
      shouldRemind: false,
    };
  }

  // Used this week (3-7 days) - medium hint
  if (daysSinceLastUse < 7) {
    return {
      opacity: 0.5,
      shouldPulse: false,
      shouldRemind: true,
    };
  }

  // Not used in a week (7-14 days) - strong hint (re-onboarding)
  if (daysSinceLastUse < 14) {
    return {
      opacity: 0.8,
      shouldPulse: true,
      shouldRemind: true,
    };
  }

  // Long time no use (14+ days) - full onboarding experience
  return {
    opacity: 1,
    shouldPulse: true,
    shouldRemind: true,
  };
}

/**
 * Mark feature as used (update last interaction timestamp)
 * @param featureKey - Unique key for the feature
 */
export function markFeatureAsUsed(featureKey: string): void {
  const storageKey = `unslump-last-used-${featureKey}`;
  localStorage.setItem(storageKey, Date.now().toString());
}

/**
 * Reset feature usage (for testing or reset purposes)
 * @param featureKey - Unique key for the feature
 */
export function resetFeatureUsage(featureKey: string): void {
  const storageKey = `unslump-last-used-${featureKey}`;
  localStorage.removeItem(storageKey);
}
