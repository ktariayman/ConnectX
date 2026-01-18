
import { defineConfig } from 'vitest/config';

export default defineConfig({
 esbuild: {
  // Enable decorators for NestJS/Inversify compatibility
  target: 'es2022',
  keepNames: true,
 },
 test: {
  globals: true,
  environment: 'node',
 },
});
