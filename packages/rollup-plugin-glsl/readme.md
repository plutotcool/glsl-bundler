# rollup-plugin-glsl-bundler

Rollup plugin that allows imports of glsl files. Resolves import pragma and minifies glsl code using [@plutotcool/glsl-bundler](https://github.com/plutotcool/glsl-bundler).

## Install

```bash
yarn add rollup-plugin-glsl-bundler --dev
```

```javascript
// rollup.config.js

import { glslBundler } from '@plutotcool/rollup-plugin-glsl-bundler'

export default {
  plugins: [
    glslBundler({ /* options */ })
  ]
}
```

## Options

```typescript
interface GLSLBundlerParameters {
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
   * Enable loader pragma
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
