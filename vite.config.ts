/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
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
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        reportsDirectory: './coverage',
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@google/genai')) return 'genai';
            if (id.includes('html2canvas')) return 'html2canvas';
            if (id.includes('jspdf')) return 'jspdf';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('react-markdown')) return 'reactMarkdown';
            if (id.includes('lucide-react')) return 'lucide';
          },
        },
      },
    },
  };
});
