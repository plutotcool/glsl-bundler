import path from 'path'
import autoExternal from 'rollup-plugin-auto-external'
import cleaner from 'rollup-plugin-cleaner'
import ts from 'rollup-plugin-ts'
import { eslint } from 'rollup-plugin-eslint'

import pkg from './package.json'

const dir = path.dirname(pkg.main)

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      entryFileNames: '[name].js',
      dir,
      preserveModules: true
    },
    {
      format: 'es',
      entryFileNames: '[name].mjs',
      dir,
      preserveModules: true
    },
    {
      format: 'umd',
      file: `${dir}/index.umd.js`,
      name: 'GLSLBundler'
    }
  ],
  plugins: [
    cleaner({ targets: [dir] }),
    autoExternal(),
    eslint(),
    ts()
  ]
}
