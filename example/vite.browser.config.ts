import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  build: {
    minify: false,
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: ['fs', 'import-meta-resolve']
  },
  server: {
    open: true
  }
})
