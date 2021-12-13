import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  build: {
    minify: false,
    target: 'esnext',
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      formats: ['es'],
      fileName: format => `index.js`,
    },
    rollupOptions: {
      external: ['fs', 'import-meta-resolve']
    }
  }
})
