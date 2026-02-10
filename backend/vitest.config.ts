import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Increase timeout slightly for potentially slower CI or DB-backed integration tests
    testTimeout: 10_000,
  },
});
