import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use '.' to avoid issues with process.cwd() in some environments
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Fix: Manually define Supabase variables in process.env for the client
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
          output: {
              manualChunks: {
                  vendor: ['react', 'react-dom', 'lucide-react'],
                  utils: ['@google/genai', '@supabase/supabase-js']
              }
          }
      }
    },
    server: {
      proxy: {
        // Proxy API requests to localhost:3000 during local dev if running vercel dev
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});