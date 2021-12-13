import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    target: 'esnext',
    lib: {
      name: 'GLSLBundler',
      fileName: 'index.js',
      entry: path.resolve(__dirname, 'src/index.ts')
    },
    rollupOptions: {
      external: ['fs', 'import-meta-resolve'],
      output: [
        {
          format: 'es',
          entryFileNames: `[name].mjs`,
          preserveModules: true,
        },
        {
          format: 'cjs',
          entryFileNames: `[name].js`,
          preserveModules: true
        },
        {
          format: 'umd',
          entryFileNames: `index.umd.js`,
        }
      ]
    }
  },
  optimizeDeps: {
    exclude: ['fs', 'import-meta-resolve']
  }
})
