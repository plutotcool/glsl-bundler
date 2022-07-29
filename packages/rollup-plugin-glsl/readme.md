# rollup-plugin-glsl

[![test](https://github.com/plutotcool/glsl-bundler/actions/workflows/test.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/test.yml)
[![build](https://github.com/plutotcool/glsl-bundler/actions/workflows/build.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/build.yml)
[![release](https://github.com/plutotcool/glsl-bundler/actions/workflows/release.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/release.yml)
[![version](https://img.shields.io/github/package-json/v/plutotcool/glsl-bundler?filename=packages%2Frollup-plugin-glsl%2Fpackage.json)](https://npmjs.com/package/@plutotcool/rollup-plugin-glsl)
![types](https://img.shields.io/npm/types/@plutotcool/rollup-plugin-glsl)

Rollup plugin that allows imports of glsl files. Resolves `#include` directives and minifies glsl code using [@plutotcool/glsl-bundler](https://github.com/plutotcool/glsl-bundler/tree/main/packages/glsl-bundler).

[Live demo](https://glsl-bundler.vercel.app)

## Install

```bash
yarn add @plutotcool/rollup-plugin-glsl --dev
```

```javascript
// rollup.config.js

import { glsl } from '@plutotcool/rollup-plugin-glsl'

export default {
  plugins: [
    glsl({ /* options */ })
  ]
}
```

## Options

```typescript
interface GLSLParameters {
  /**
   * Patterns of files that must be transformed by the plugin.
   * 
   * Default: /\.(?:glsl|frag|vert)$/
   */
  include?: (string | RegExp)[] | string | RegExp | null

  /**
   * Patterns of files that must not be transformed by the plugin.
   * 
   * Default: null
   */
  exclude?: (string | RegExp)[] | string | RegExp | null

  /**
   * Alternative custom filter function that determines if a file should be
   * transformed by the plugin. If specified, the include and exclude parameters
   * are ignored.
   * 
   * Default: filter function created from include and exclude parameters
   */
  filter?: (id: string) => boolean
  
  /**
   * Enable #include directives
   *
   * Default: true
   */
  loader?: boolean

  /**
   * Enable minifier or specify custom minify parameters
   *
   * Default: true
   */
  minifier?: boolean | {
    renameFunctions?: boolean
    renameVariables?: boolean
    renameDefines?: boolean
    renameStructs?: boolean
    trimComments?: boolean
    trimSpaces?: boolean
    trimZeros?: boolean
  }

  /**
   * Additional transform functions to apply to glsl code
   */
  transforms?: ((source: string) => Promise<string> | string)[]
}
```

## Usage

Get more informations from [@plutotcool/glsl-bundler](https://github.com/plutotcool/glsl-bundler/tree/main/packages/glsl-bundler#readme) package.
