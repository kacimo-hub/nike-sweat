import { defineConfig } from 'vite';

// GitHub Pages serves the site under /nike-sweat/ (project page), not /.
// The trailing slashes matter. For a *.github.io root page or custom domain,
// change base back to '/'.
export default defineConfig({
  base: '/nike-sweat/',
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
});
