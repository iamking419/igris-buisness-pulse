import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  server: {
    port: 8000,
    host: true,
  },
  plugins: [
    {
      name: 'clean-route-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          try {
            const url = req.url.split('?')[0];
            // Only attempt for likely HTML navigation requests
            if (!url.includes('.')) {
              // normalize leading slash and trim
              const stripped = url.replace(/(^\/+|\/+$)/g, '');
              const tryPaths = [];
              if (stripped === '') {
                tryPaths.push(path.join(server.config.root, 'index.html'));
              } else {
                tryPaths.push(path.join(server.config.root, stripped + '.html'));
                tryPaths.push(path.join(server.config.root, stripped, 'index.html'));
              }
              for (const p of tryPaths) {
                if (fs.existsSync(p)) {
                  // rewrite the url to the found html file
                  req.url = '/' + path.relative(server.config.root, p).replace(/\\/g, '/');
                  break;
                }
              }
            }
          } catch (e) {
            // ignore errors
          }
          next();
        });
      }
    }
  ]
});
