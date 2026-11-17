import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'icon.png', 'icon.svg', 'fonts/*'],
            manifest: {
                name: 'ADM - Sistema de Inventario',
                short_name: 'ADM',
                lang: 'es',
                theme_color: '#1976d2',
                background_color: '#000000',
                display: 'standalone',
                start_url: '.',
                icons: [
                    {
                        src: '/img/icons/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/img/icons/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                globPatterns: [
                    '**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg}',
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            fs: fileURLToPath(new URL('./src/lib/browser-fs.js', import.meta.url)),
        },
    },
    server: {
        port: 8080,
    },
    build: {
        sourcemap: true,
        chunkSizeWarningLimit: 800,
    },
    define: {
        __VUE_I18N_FULL_INSTALL__: true,
        __VUE_I18N_LEGACY_API__: false,
        __INTLIFY_PROD_DEVTOOLS__: false,
    },
})
