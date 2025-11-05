import { beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Mock window.confetti (canvas-confetti library)
const confettiMock = vi.fn(() => Promise.resolve());
Object.assign(confettiMock, {
  reset: vi.fn(),
  create: vi.fn(() => confettiMock)
});

// Setup global mocks before each test
beforeEach(() => {
  // Mock localStorage
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
  });

  // Mock confetti
  Object.defineProperty(global, 'confetti', {
    value: confettiMock,
    writable: true
  });

  // Mock window.matchMedia (for responsive design tests)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;

  // Mock requestAnimationFrame (for Motion One animations)
  global.requestAnimationFrame = vi.fn((cb) => {
    cb(0);
    return 0;
  }) as any;

  global.cancelAnimationFrame = vi.fn();
});

// Cleanup after each test
afterEach(() => {
  // Clear localStorage
  localStorage.clear();

  // Clear all mocks
  vi.clearAllMocks();

  // Clear all timers
  vi.clearAllTimers();
});
