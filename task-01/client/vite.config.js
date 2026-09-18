import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? (process.env.VITE_BASE_PATH || '/') : '/',
  server: {
    port: 5173,
  },
}));
