import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL: This sets the base path to relative. 
  // It ensures assets are loaded from "./assets/" instead of "/assets/",
  // which fixes the blank screen on GitHub Pages subdirectories.
  base: './', 
  build: {
    outDir: 'dist',
  }
});