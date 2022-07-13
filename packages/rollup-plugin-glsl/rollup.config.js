import path from 'path'
import autoExternal from 'rollup-plugin-auto-external'
import cleaner from 'rollup-plugin-cleaner'
import ts from 'rollup-plugin-ts'
import { eslint } from 'rollup-plugin-eslint'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ],
  plugins: [
    cleaner({ targets: [path.dirname(pkg.main)] }),
    autoExternal(),
    eslint(),
    ts(),
  ]
}
