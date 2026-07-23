import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          devOptions: {
            enabled: true,
            type: 'module'
          },
          includeAssets: [
            'favicon.svg',
            'apple-touch-icon.png',
            'pwa-192x192.png',
            'pwa-512x512.png',
            'pwa-192x192-maskable.png',
            'pwa-512x512-maskable.png'
          ],
          workbox: {
            maximumFileSizeToCacheInBytes: 5000000,
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
          },
          manifest: {
            name: 'GPS Plus',
            short_name: 'GPS Plus',
            description: 'Geographic positioning and surveying tool',
            theme_color: '#e2e8f0',
            background_color: '#e2e8f0',
            display: 'standalone',
            orientation: 'portrait',
            start_url: './',
            scope: './',
            id: './',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'pwa-192x192-maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
              },
              {
                src: 'pwa-512x512-maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ],
            file_handlers: [
              {
                action: './',
                name: 'KML / KMZ Dosyaları',
                accept: {
                  'application/vnd.google-earth.kml+xml': ['.kml'],
                  'application/vnd.google-earth.kmz': ['.kmz'],
                  'application/xml': ['.kml'],
                  'text/xml': ['.kml']
                }
              },
              {
                action: './',
                name: 'GPX / Harita Dosyaları',
                accept: {
                  'application/gpx+xml': ['.gpx']
                }
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
