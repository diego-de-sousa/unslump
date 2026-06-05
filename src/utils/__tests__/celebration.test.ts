import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { celebratePhase, celebrateComplete } from '../celebration';

describe('celebration', () => {
  let mockConfetti: any;
  let mockMotionAnimate: any;
  let mockMotionStagger: any;
  let mockLetterGroup: HTMLElement;

  beforeEach(() => {
    // Mock confetti
    mockConfetti = vi.fn();
    (window as any).confetti = mockConfetti;

    // Mock Motion One
    mockMotionAnimate = vi.fn();
    mockMotionStagger = vi.fn((delay: number) => delay);
    (window as any).motionAnimate = mockMotionAnimate;
    (window as any).motionStagger = mockMotionStagger;

    // Create mock DOM elements
    mockLetterGroup = document.createElement('div');
    mockLetterGroup.className = 'letter-group';
    mockLetterGroup.setAttribute('data-phase', 'fase1');

    // Mock getBoundingClientRect
    mockLetterGroup.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 50,
      width: 50,
      height: 50,
      right: 150,
      bottom: 100,
      x: 100,
      y: 50,
      toJSON: () => {}
    }));

    document.body.appendChild(mockLetterGroup);

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  });

  afterEach(() => {
    document.body.replaceChildren();
    delete (window as any).confetti;
    delete (window as any).motionAnimate;
    delete (window as any).motionStagger;
    vi.useRealTimers();
  });

  describe('celebratePhase', () => {
    it('should animate letter group with Motion One', () => {
      celebratePhase('fase1');

      expect(mockMotionAnimate).toHaveBeenCalledWith(
        mockLetterGroup,
        expect.objectContaining({
          scale: [1, 1.15, 1],
          rotate: [0, -3, 3, 0],
          y: [0, -10, 0]
        }),
        expect.objectContaining({
          duration: 0.8,
          easing: "ease-out"
        })
      );
    });

    it('should trigger confetti from letter position', () => {
      celebratePhase('fase1');

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number)
          }),
          angle: 270,
          particleCount: 80,
          spread: 80
        })
      );
    });

    it('should use fase1 indigo colors', () => {
      celebratePhase('fase1');

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#4f46e5', '#6366f1', '#818cf8']
        })
      );
    });

    it('should use fase2 teal colors', () => {
      const fase2Element = document.createElement('div');
      fase2Element.className = 'letter-group';
      fase2Element.setAttribute('data-phase', 'fase2');
      fase2Element.getBoundingClientRect = mockLetterGroup.getBoundingClientRect;
      document.body.appendChild(fase2Element);

      celebratePhase('fase2');

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#14b8a6', '#2dd4bf', '#5eead4']
        })
      );
    });

    it('should use fase3 orange colors', () => {
      const fase3Element = document.createElement('div');
      fase3Element.className = 'letter-group';
      fase3Element.setAttribute('data-phase', 'fase3');
      fase3Element.getBoundingClientRect = mockLetterGroup.getBoundingClientRect;
      document.body.appendChild(fase3Element);

      celebratePhase('fase3');

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#f97316', '#fb923c', '#fdba74']
        })
      );
    });

    it('should use fase4 pink colors', () => {
      const fase4Element = document.createElement('div');
      fase4Element.className = 'letter-group';
      fase4Element.setAttribute('data-phase', 'fase4');
      fase4Element.getBoundingClientRect = mockLetterGroup.getBoundingClientRect;
      document.body.appendChild(fase4Element);

      celebratePhase('fase4');

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#ec4899', '#f472b6', '#f9a8d4']
        })
      );
    });

    it('should not throw when letter group not found', () => {
      document.body.replaceChildren();

      expect(() => celebratePhase('fase1')).not.toThrow();
      expect(mockConfetti).not.toHaveBeenCalled();
    });

    it('should not throw when confetti not available', () => {
      delete (window as any).confetti;

      expect(() => celebratePhase('fase1')).not.toThrow();
    });

    it('should not throw when Motion One not available', () => {
      delete (window as any).motionAnimate;

      expect(() => celebratePhase('fase1')).not.toThrow();
      // Confetti should still work
      expect(mockConfetti).toHaveBeenCalled();
    });

    it('should calculate correct origin position', () => {
      // Letter at (100, 50), size 50x50
      // Center at (125, 75)
      // Window 1000x800
      // Origin X: 125/1000 = 0.125
      // Origin Y: 75/800 = 0.09375

      celebratePhase('fase1');

      const confettiCall = mockConfetti.mock.calls[0][0];
      expect(confettiCall.origin.x).toBeCloseTo(0.125, 2);
      expect(confettiCall.origin.y).toBeCloseTo(0.09375, 2);
    });
  });

  describe('celebrateComplete', () => {
    beforeEach(() => {
      // Create letter groups for all 4 phases
      ['fase1', 'fase2', 'fase3', 'fase4'].forEach(phaseId => {
        const element = document.createElement('div');
        element.className = 'letter-group';
        element.setAttribute('data-phase', phaseId);
        element.getBoundingClientRect = mockLetterGroup.getBoundingClientRect;
        document.body.appendChild(element);
      });
    });

    it('should animate all letter groups with stagger', () => {
      celebrateComplete();

      expect(mockMotionAnimate).toHaveBeenCalled();
      expect(mockMotionStagger).toHaveBeenCalledWith(0.15);
    });

    it('should trigger confetti for all 4 phases', () => {
      vi.useFakeTimers();

      celebrateComplete();
      vi.advanceTimersByTime(0);

      // First phase confetti should fire on the first queued timeout.
      expect(mockConfetti).toHaveBeenCalledTimes(1);

      // Advance through each staggered delay
      vi.advanceTimersByTime(150);
      expect(mockConfetti).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(150);
      expect(mockConfetti).toHaveBeenCalledTimes(3);

      vi.advanceTimersByTime(150);
      expect(mockConfetti).toHaveBeenCalledTimes(4);

      vi.useRealTimers();
    });

    it('should use different colors for each phase', () => {
      vi.useFakeTimers();

      celebrateComplete();
      vi.advanceTimersByTime(0);

      // Check fase1 (indigo)
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#4f46e5', '#6366f1', '#818cf8']
        })
      );

      vi.advanceTimersByTime(150);

      // Check fase2 (teal)
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#14b8a6', '#2dd4bf', '#5eead4']
        })
      );

      vi.advanceTimersByTime(150);

      // Check fase3 (orange)
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#f97316', '#fb923c', '#fdba74']
        })
      );

      vi.advanceTimersByTime(150);

      // Check fase4 (pink)
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#ec4899', '#f472b6', '#f9a8d4']
        })
      );

      vi.useRealTimers();
    });

    it('should use larger particle count for complete celebration', () => {
      vi.useFakeTimers();

      celebrateComplete();
      vi.advanceTimersByTime(0);

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 100 // vs 80 for phase
        })
      );
    });

    it('should not throw when confetti not available', () => {
      delete (window as any).confetti;

      expect(() => celebrateComplete()).not.toThrow();
    });

    it('should not throw when Motion One not available', () => {
      delete (window as any).motionAnimate;
      delete (window as any).motionStagger;

      vi.useFakeTimers();

      expect(() => celebrateComplete()).not.toThrow();

      // Confetti should still work with staggered timing
      vi.advanceTimersByTime(600);
      expect(mockConfetti).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should handle missing letter groups gracefully', () => {
      document.body.replaceChildren();

      // Create only 2 out of 4 letter groups
      ['fase1', 'fase3'].forEach(phaseId => {
        const element = document.createElement('div');
        element.className = 'letter-group';
        element.setAttribute('data-phase', phaseId);
        element.getBoundingClientRect = mockLetterGroup.getBoundingClientRect;
        document.body.appendChild(element);
      });

      vi.useFakeTimers();

      expect(() => celebrateComplete()).not.toThrow();

      // Only 2 confetti calls (for the 2 existing elements)
      vi.advanceTimersByTime(600);
      expect(mockConfetti).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle zero window dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { value: 0 });
      Object.defineProperty(window, 'innerHeight', { value: 0 });

      expect(() => celebratePhase('fase1')).not.toThrow();
    });

    it('should handle very small letter group', () => {
      mockLetterGroup.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        right: 1,
        bottom: 1,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      expect(() => celebratePhase('fase1')).not.toThrow();
      expect(mockConfetti).toHaveBeenCalled();
    });
  });
});
