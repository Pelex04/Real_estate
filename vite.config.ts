import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Root deployment on Netlify
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
