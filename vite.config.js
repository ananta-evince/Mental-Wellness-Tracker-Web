import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGeminiRequest } from './lib/geminiHandler.js';

function geminiDevApiPlugin() {
  return {
    name: 'gemini-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/gemini', (req, res) => {
        handleGeminiRequest(req, res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), geminiDevApiPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}', 'lib/**/*.js'],
      exclude: ['src/main.jsx'],
    },
  },
});
