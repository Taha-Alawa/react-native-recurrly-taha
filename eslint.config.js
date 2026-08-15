// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Architecture enforcement (§17 phase 5, §18).
 *
 * The dependency direction in §1 is the backbone of the whole structure, so it
 * is a lint error rather than a convention people remember:
 *
 *   app      -> features, layouts, core
 *   features -> core, assets
 *   layouts  -> core, features
 *   core     -> assets only
 */
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'app-example/*', '.expo/*'],
  },

  // core/ is the bottom of the stack: it may never reach upward.
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/layouts/*', '@/app/*'],
              message:
                'core/ must not import from features/, layouts/ or app/ (architecture §1). Invert the dependency: have the feature pass what core needs.',
            },
          ],
        },
      ],
    },
  },

  // features/ may use core and assets, never the shell or the chrome.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/layouts/*'],
              message:
                'features/ must not import from app/ or layouts/ (architecture §1).',
            },
          ],
        },
      ],
    },
  },

  // "No component calls the network directly" (§18): the SDK belongs to
  // core/services and each feature's services/ layer, nowhere else.
  {
    files: [
      'src/features/**/components/**/*.{ts,tsx}',
      'src/features/**/pages/**/*.{ts,tsx}',
      'src/layouts/**/*.{ts,tsx}',
      'src/app/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['firebase', 'firebase/*'],
              message:
                'Components and screens must not talk to Firebase directly (architecture §4). Go through a service object, called from a hook.',
            },
          ],
        },
      ],
    },
  },

  // Route files are wrappers: they declare the screen and nothing else (§2).
  {
    files: ['src/app/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['firebase', 'firebase/*', '@clerk/*', 'posthog-react-native'],
              message:
                'Route files delegate to a feature page and hold no logic (architecture §2).',
            },
          ],
        },
      ],
    },
  },
]);
