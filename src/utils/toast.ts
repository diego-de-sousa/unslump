/**
 * Toast Notification Utility
 * Shows temporary notifications with smooth CSS animations
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number; // milliseconds
}

const typeStyles: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: {
    bg: 'rgba(16, 185, 129, 0.95)', // green-500
    border: '#10b981',
    text: '#ffffff'
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.95)', // red-500
    border: '#ef4444',
    text: '#ffffff'
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.95)', // blue-500
    border: '#3b82f6',
    text: '#ffffff'
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.95)', // amber-500
    border: '#f59e0b',
    text: '#ffffff'
  }
};

let currentToastTimeout: number | null = null;

export function showToast({ message, type = 'info', duration = 3000 }: ToastOptions) {
  const container = document.getElementById('toast-container');
  const toast = document.getElementById('toast');
  const textElement = toast?.querySelector('.toast-text');

  if (!container || !toast || !textElement) {
    console.warn('Toast elements not found in DOM');
    return;
  }

  // Clear existing timeout if any
  if (currentToastTimeout) {
    clearTimeout(currentToastTimeout);
  }

  // Set message and styles
  textElement.textContent = message;
  const styles = typeStyles[type];
  toast.style.background = styles.bg;
  toast.style.borderColor = styles.border;
  (textElement as HTMLElement).style.color = styles.text;

  // Animate in using CSS
  container.style.opacity = '1';
  container.style.transform = 'translate(-50%, 0)';
  container.style.transition = 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)';

  // Auto-hide after duration
  currentToastTimeout = window.setTimeout(() => {
    hideToast();
  }, duration);
}

export function hideToast() {
  const container = document.getElementById('toast-container');

  if (!container) return;

  // Animate out using CSS
  container.style.opacity = '0';
  container.style.transform = 'translate(-50%, 100px)';
  container.style.transition = 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)';

  // Clear timeout
  if (currentToastTimeout) {
    clearTimeout(currentToastTimeout);
    currentToastTimeout = null;
  }
}

// Convenience methods
export const toast = {
  success: (message: string, duration?: number) => showToast({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration }),
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration }),
  warning: (message: string, duration?: number) => showToast({ message, type: 'warning', duration })
};
