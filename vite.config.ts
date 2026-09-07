/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/apple-touch-icon.png'],
        manifest: {
          name: 'iPrint Pro',
          short_name: 'iPrint',
          description: 'Bluetooth termal yazıcı stüdyosu — fotoğraf, belge, etiket ve şablon baskısı.',
          theme_color: '#0d9488',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          lang: 'tr',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          navigateFallback: 'index.html',
          // App shell only: never cache BLE/GATT traffic or large runtime models
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } }
            }
          ]
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks: {
            'template-archive-data': ['./src/template-archive/data/templates.ts', './src/template-archive/components/ThermalTemplatesBatch3.tsx', './src/template-archive/components/ThermalTemplatesEcommerce.tsx'],
            'image-capture-vendor': ['html-to-image', 'html2canvas'],
            'fabric-vendor': ['fabric'],
          }
        }
      }
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});
