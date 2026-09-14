import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { ensureAppId } from './scripts/ensure-app-id.mjs';

// Also initialize projects copied directly from this template. Existing IDs stay stable.
ensureAppId(fileURLToPath(new URL('./src/data.ts', import.meta.url)));

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
