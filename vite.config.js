import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGeminiRequest } from './lib/geminiHandler.js';

function applyEnvToProcess(mode) {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY']) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }
}

function geminiDevApiPlugin(mode) {
  return {
    name: 'gemini-dev-api',
    configureServer(server) {
      applyEnvToProcess(mode);
      server.middlewares.use('/api/gemini', (req, res) => {
        handleGeminiRequest(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), geminiDevApiPlugin(mode)],
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
}));
