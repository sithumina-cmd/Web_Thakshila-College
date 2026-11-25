import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './server/apiRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'thakshila-express-api',
      configureServer(server) {
        // Serve /Pictures directly from public/Pictures directory
        const picturesPath = path.join(__dirname, 'public', 'Pictures');
        server.middlewares.use('/Pictures', express.static(picturesPath));

        // Serve REST API
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            return apiApp(req, res, next);
          }
          next();
        });
      }
    }
  ],
  server: {
    host: true,
    port: 5173,
    open: false,
    watch: {
      ignored: ['**/*.zip', '**/dist/**']
    }
  }
});
