import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Use happy-dom for faster DOM simulation (lighter than jsdom)
    environment: 'happy-dom',

    // Global test utilities
    globals: true,

    // Setup files to run before tests
    setupFiles: ['./vitest.setup.ts'],

    // Include test files
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.astro',
      'coverage',
      'tests/e2e/**',
      '**/*.config.*'
    ],

    // Coverage configuration with v8
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'dist',
        '.astro',
        'coverage',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types.ts',
        'src/env.d.ts',
        'src/data/**', // Exclude exercise data files (static content)
        'src/i18n/locales/**', // Exclude translation JSON files
        'public/**'
      ],
      // Coverage thresholds - aim for 80%+
      thresholds: {
        lines: 80,
        functions: 75,
        branches: 75,
        statements: 80
      }
    },

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Enable watch mode features
    watch: false,

    // Reporter configuration
    reporters: ['verbose'],

    // Mock configuration
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@stores': resolve(__dirname, './src/stores'),
      '@utils': resolve(__dirname, './src/utils'),
      '@data': resolve(__dirname, './src/data'),
      '@scripts': resolve(__dirname, './src/scripts'),
      '@i18n': resolve(__dirname, './src/i18n'),
    }
  }
});
