import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
 plugins: [react()],
 server: {

    hmr: process.env.NODE_ENV !== 'production',
  
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
