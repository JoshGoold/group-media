import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  base: "/",
 plugins: [react()],
 server: {
  proxy: {
    '/api': {
      target: 'https://group-media-geiwtdvjg-joshs-projects-9174c388.vercel.app/', // The API server URL
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '') // Removes '/api' prefix when forwarding
    },
    
  },
  historyApiFallback: true,
},
 build: {
  target: 'esnext',
  rollupOptions: {
    input: {
      main: './src/entry-client.jsx',  // client entry point
      ssr: './server.js' // dedicated SSR entry
    }
  },
  ssr: true,
  outDir: 'dist',
 } 
})
