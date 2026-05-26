/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      environment: 'jsdom',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            genai: ['@google/genai'],
            html2canvas: ['html2canvas'],
            jspdf: ['jspdf'],
            recharts: ['recharts'],
            reactMarkdown: ['react-markdown'],
            lucide: ['lucide-react']
          },
        },
      },
    },
  };
});
