/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        reportsDirectory: './coverage',
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // `@google/genai` is no longer part of the client bundle — all
            // Gemini calls go through the `/api/analyze` serverless function.
            html2canvas: ['html2canvas'],
            jspdf: ['jspdf'],
            recharts: ['recharts'],
            reactMarkdown: ['react-markdown'],
            lucide: ['lucide-react'],
          },
        },
      },
    },
  };
});
