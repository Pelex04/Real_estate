import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add this section
    allowedHosts: [
      'cb851dd961cb.ngrok-free.app', // your ngrok URL
      'localhost' // keep localhost allowed
    ]
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
