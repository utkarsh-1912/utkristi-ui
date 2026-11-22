import { defineConfig } from 'vitest/config';

export default defineConfig({
  // axe and full-catalog renders can exceed 5s on a cold, busy machine; they are not slow when warm.
  test: { include: ['test/**/*.test.{ts,tsx}'], environment: 'jsdom', setupFiles: ['test/setup.ts'], testTimeout: 20_000 },
});
