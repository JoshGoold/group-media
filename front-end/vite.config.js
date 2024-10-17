import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
 plugins: [react()],
 preview: {
  port: 8080,
  strictPort: true,
 },
 server: {
  port: 8080,
  strictPort: true,
  host: true,
  hmr: mode === 'development',  // Enable HMR only in development
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
