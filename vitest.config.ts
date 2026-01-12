import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    },
  })
);
