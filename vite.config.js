import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl({
      domains: ['https://localhost:5174'],
    }),
  ],
  server: {
    https: true,
    port: 5174
  },
});
