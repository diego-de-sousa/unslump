import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { showToast, hideToast, toast } from '../toast';

describe('toast', () => {
  let mockContainer: HTMLElement;
  let mockToast: HTMLElement;
  let mockTextElement: HTMLElement;

  beforeEach(() => {
    // Create mock DOM structure
    mockContainer = document.createElement('div');
    mockContainer.id = 'toast-container';
    mockContainer.style.opacity = '0';
    mockContainer.style.transform = 'translate(-50%, 100px)';

    mockToast = document.createElement('div');
    mockToast.id = 'toast';

    mockTextElement = document.createElement('span');
    mockTextElement.className = 'toast-text';

    mockToast.appendChild(mockTextElement);
    mockContainer.appendChild(mockToast);
    document.body.appendChild(mockContainer);

    // Mock console.warn to avoid noise
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('showToast', () => {
    it('should display toast with message', () => {
      showToast({ message: 'Test message' });

      expect(mockTextElement.textContent).toBe('Test message');
      expect(mockContainer.style.opacity).toBe('1');
      expect(mockContainer.style.transform).toBe('translate(-50%, 0)');
    });

    it('should apply info styles by default', () => {
      showToast({ message: 'Info message' });

      expect(mockToast.style.background).toBe('rgba(59, 130, 246, 0.95)');
      expect(mockToast.style.borderColor).toBe('rgb(59, 130, 246)');
      expect(mockTextElement.style.color).toBe('rgb(255, 255, 255)');
    });

    it('should apply success styles', () => {
      showToast({ message: 'Success!', type: 'success' });

      expect(mockToast.style.background).toBe('rgba(16, 185, 129, 0.95)');
      expect(mockToast.style.borderColor).toBe('rgb(16, 185, 129)');
    });

    it('should apply error styles', () => {
      showToast({ message: 'Error!', type: 'error' });

      expect(mockToast.style.background).toBe('rgba(239, 68, 68, 0.95)');
      expect(mockToast.style.borderColor).toBe('rgb(239, 68, 68)');
    });

    it('should apply warning styles', () => {
      showToast({ message: 'Warning!', type: 'warning' });

      expect(mockToast.style.background).toBe('rgba(245, 158, 11, 0.95)');
      expect(mockToast.style.borderColor).toBe('rgb(245, 158, 11)');
    });

    it('should auto-hide after default duration (3000ms)', () => {
      showToast({ message: 'Auto hide' });

      expect(mockContainer.style.opacity).toBe('1');

      vi.advanceTimersByTime(3000);

      expect(mockContainer.style.opacity).toBe('0');
      expect(mockContainer.style.transform).toBe('translate(-50%, 100px)');
    });

    it('should auto-hide after custom duration', () => {
      showToast({ message: 'Custom duration', duration: 5000 });

      expect(mockContainer.style.opacity).toBe('1');

      vi.advanceTimersByTime(4999);
      expect(mockContainer.style.opacity).toBe('1');

      vi.advanceTimersByTime(1);
      expect(mockContainer.style.opacity).toBe('0');
    });

    it('should clear existing timeout when showing new toast', () => {
      showToast({ message: 'First toast', duration: 5000 });

      vi.advanceTimersByTime(2000);
      expect(mockContainer.style.opacity).toBe('1');

      // Show second toast before first one finishes
      showToast({ message: 'Second toast', duration: 3000 });

      expect(mockTextElement.textContent).toBe('Second toast');

      // First timeout should be cleared, only second one active
      vi.advanceTimersByTime(2999);
      expect(mockContainer.style.opacity).toBe('1');

      vi.advanceTimersByTime(1);
      expect(mockContainer.style.opacity).toBe('0');
    });

    it('should apply CSS transition', () => {
      showToast({ message: 'Transition test' });

      expect(mockContainer.style.transition).toBe('all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)');
    });

    it('should handle missing DOM elements gracefully', () => {
      document.body.innerHTML = '';

      expect(() => showToast({ message: 'No elements' })).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith('Toast elements not found in DOM');
    });

    it('should handle missing container', () => {
      mockContainer.remove();

      expect(() => showToast({ message: 'No container' })).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle missing toast element', () => {
      mockToast.remove();

      expect(() => showToast({ message: 'No toast' })).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle missing text element', () => {
      mockTextElement.remove();

      expect(() => showToast({ message: 'No text' })).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('hideToast', () => {
    it('should hide toast', () => {
      showToast({ message: 'Will hide' });
      expect(mockContainer.style.opacity).toBe('1');

      hideToast();

      expect(mockContainer.style.opacity).toBe('0');
      expect(mockContainer.style.transform).toBe('translate(-50%, 100px)');
    });

    it('should clear timeout', () => {
      showToast({ message: 'Test', duration: 5000 });

      hideToast();

      // Advance time past original duration
      vi.advanceTimersByTime(5000);

      // Toast should stay hidden (timeout was cleared)
      expect(mockContainer.style.opacity).toBe('0');
    });

    it('should handle missing container gracefully', () => {
      document.body.innerHTML = '';

      expect(() => hideToast()).not.toThrow();
    });

    it('should apply CSS transition', () => {
      hideToast();

      expect(mockContainer.style.transition).toBe('all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)');
    });

    it('should be callable multiple times', () => {
      hideToast();
      hideToast();
      hideToast();

      expect(mockContainer.style.opacity).toBe('0');
    });
  });

  describe('convenience methods', () => {
    it('toast.success should show success toast', () => {
      toast.success('Success message');

      expect(mockTextElement.textContent).toBe('Success message');
      expect(mockToast.style.background).toBe('rgba(16, 185, 129, 0.95)');
    });

    it('toast.error should show error toast', () => {
      toast.error('Error message');

      expect(mockTextElement.textContent).toBe('Error message');
      expect(mockToast.style.background).toBe('rgba(239, 68, 68, 0.95)');
    });

    it('toast.info should show info toast', () => {
      toast.info('Info message');

      expect(mockTextElement.textContent).toBe('Info message');
      expect(mockToast.style.background).toBe('rgba(59, 130, 246, 0.95)');
    });

    it('toast.warning should show warning toast', () => {
      toast.warning('Warning message');

      expect(mockTextElement.textContent).toBe('Warning message');
      expect(mockToast.style.background).toBe('rgba(245, 158, 11, 0.95)');
    });

    it('convenience methods should accept custom duration', () => {
      toast.success('Custom duration', 1000);

      expect(mockContainer.style.opacity).toBe('1');

      vi.advanceTimersByTime(1000);

      expect(mockContainer.style.opacity).toBe('0');
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid toast changes', () => {
      toast.info('First');
      toast.success('Second');
      toast.error('Third');

      expect(mockTextElement.textContent).toBe('Third');
      expect(mockToast.style.background).toBe('rgba(239, 68, 68, 0.95)');
    });

    it('should queue toasts with proper timeout clearing', () => {
      toast.info('Info', 2000);

      vi.advanceTimersByTime(500);

      toast.success('Success', 1000);

      // Info timeout should be cleared
      vi.advanceTimersByTime(1500);
      expect(mockContainer.style.opacity).toBe('1'); // Still showing

      vi.advanceTimersByTime(1);
      expect(mockContainer.style.opacity).toBe('0'); // Now hidden after success duration
    });

    it('should handle show, hide, show sequence', () => {
      toast.info('First');
      expect(mockContainer.style.opacity).toBe('1');

      hideToast();
      expect(mockContainer.style.opacity).toBe('0');

      toast.success('Second');
      expect(mockContainer.style.opacity).toBe('1');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      showToast({ message: '' });

      expect(mockTextElement.textContent).toBe('');
      expect(mockContainer.style.opacity).toBe('1');
    });

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(1000);
      showToast({ message: longMessage });

      expect(mockTextElement.textContent).toBe(longMessage);
    });

    it('should handle zero duration', () => {
      showToast({ message: 'Zero duration', duration: 0 });

      expect(mockContainer.style.opacity).toBe('1');

      vi.advanceTimersByTime(0);

      expect(mockContainer.style.opacity).toBe('0');
    });

    it('should handle very long duration', () => {
      showToast({ message: 'Long duration', duration: 999999 });

      vi.advanceTimersByTime(999998);
      expect(mockContainer.style.opacity).toBe('1');

      vi.advanceTimersByTime(1);
      expect(mockContainer.style.opacity).toBe('0');
    });

    it('should handle special characters in message', () => {
      const specialMessage = '<script>alert("XSS")</script> & "quotes" \'apostrophes\'';
      showToast({ message: specialMessage });

      // textContent should handle special characters safely
      expect(mockTextElement.textContent).toBe(specialMessage);
    });
  });
});
