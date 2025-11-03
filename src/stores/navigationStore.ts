/**
 * Navigation Store
 * Manages workout navigation panel state
 */

import { atom } from 'nanostores';

export const isNavigatorOpen = atom<boolean>(false);

export function toggleNavigator(): void {
  isNavigatorOpen.set(!isNavigatorOpen.get());
}

export function openNavigator(): void {
  isNavigatorOpen.set(true);
}

export function closeNavigator(): void {
  isNavigatorOpen.set(false);
}
