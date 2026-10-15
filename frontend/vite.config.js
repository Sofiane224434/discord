import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Version des fichiers de traduction (évite qu'un navigateur garde une ancienne copie)
const BUILD_ID = Date.now().toString(36)

// Télécharge la traduction française en même temps que le code : le premier affichage n'attend plus ce fichier
const preloadLocale = {
  name: 'azim-preload-locale',
  transformIndexHtml: (_html, ctx) => ctx.path !== '/index.html' ? [] : [
    { tag: 'link', attrs: { rel: 'preload', href: `/locales/fr/translation.json?v=${BUILD_ID}`, as: 'fetch', crossorigin: 'anonymous' }, injectTo: 'head' },
  ],
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadLocale],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  build: {
    rollupOptions: {
      // Deux pages : le site, et l'Activité Discord « La Mecque en direct » (/activite)
      input: {
        main: 'index.html',
        activite: 'activite/index.html',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
