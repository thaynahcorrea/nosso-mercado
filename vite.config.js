import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/nosso-mercado/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nosso Mercado',
        short_name: 'Nosso Mercado',
        lang: 'pt-BR',
        description: 'Organize as compras de mercado do casal: listas, preços e orçamento.',
        theme_color: '#2A9D8F',
        background_color: '#DCE9E7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/nosso-mercado/',
        scope: '/nosso-mercado/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png}'] },
    }),
  ],
  server: { host: true, port: 5173 },
})
