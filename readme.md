# glsl-bundler

Functional regex-based glsl bundler, loader and minifier. Runs both on node and the browser.

## Install

```bash
yarn add @plutotcool/glsl-bundler
```

## Usage

- [Common examples](#common-examples)
- [Bundler](#bundler)
- [Loader](#loader)
- [Minifier](#minifer)

### Common examples

Load a shader as a string and resolve import pragmas:

```typescript
import { load } from '@plutotcool/glsl-bundler'

await load(`./fragment.glsl`, import.meta.url)
```

Minify a shader:

```typescript
import { minify } from '@plutotcool/glsl-bundler'

minify(`
  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }
`)
```

Combine loading and minifying into a bundle function:

```typescript
import { bundler, minifier, loader } from '@plutotcool/glsl-bundler'

const bundle = bundler([
  loader(import.meta.url),
  minifier()
])

await bundle(`
  #pragma loader: import './pi.glsl'
  #pragma loader: import './rad2deg.glsl'

  void main() {
    float turn = rad2deg(PI * 2.0);
  }
`)
```

### Bundler

The `bundler` transforms glsl source code given an array of [transform functions](src/bundler.ts#L1):

```typescript
import { bundler } from '@plutotcool/glsl-bundler'

const bundle = bundler([
  (source: string) => `#define PI 3.141592653589793\n${source}`
])

bundle(`
  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }
`)

// #define PI 3.141592653589793
// float rad2deg(float angle) {
//   return angle / PI * 180.0;
// }
```

> Note that the resulting `bundle` function is itself a transform function

Alternatively, the `bundle` shorcut can be used to get the same result in a single call:

```typescript
import { bundle } from '@plutotcool/glsl-bundler'

bundle(`
  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }
`, [
  (source: string) => `#define PI 3.141592653589793\n${source}`
])
```

### Loader

The `loader` factory creates an asynchronous transform function that resolves import pragmas from file system (node) or network (browser):

```glsl
// ./rad2deg.glsl

#pragma loader: import './pi.glsl'

float rad2deg(float angle) {
  return angle / PI * 180.0;
}
```

```glsl
// ./pi.glsl

#define PI 3.141592653589793
```

```typescript
import { loader } from '@plutotcool/glsl-bundler'

const load = loader(import.meta.url, [ /* Additional transform functions */ ])

await load(`
  #pragma loader: import './pi.glsl'
  #pragma loader: import './rad2deg.glsl'

  void main() {
    float turn = rad2deg(PI * 2.0);
  }
`)

// #define PI 3.141592653589793
//
// float rad2deg(float angle) {
//   return angle / PI * 180.0;
// }
//
// void main() {
//   float turn = rad2deg(PI * 2.0);
// }
```

> Note that, even if the `pi.glsl` is imported twice, it is only outputed once as soon as needed.
> On node, the loader follows node module resolution using [import-meta-resolve](https://github.com/wooorm/import-meta-resolve).

Alternatively, the `load` shorcut can be used to load shaders directly from file system or network:

```glsl
// ./fragment.glsl

#pragma loader: import './pi.glsl'
#pragma loader: import './rad2deg.glsl'

void main() {
  float turn = rad2deg(PI * 2.0);
}
```

```typescript
import { load } from '@plutotcool/glsl-bundler'

await load('./fragment.glsl', import.meta.url, [ /* Additional transform functions */])
```

### Minifier

The `minifier` factory creates a synhronous transform function that removes unnecessary characters and renames tokens:

```typescript
import { minifier } from '@plutotcool/glsl-bundler'

const minify = minifier(
  {
    // Default minify parameters:
    renameFunctions: true,
    renameVariables: true,
    renameDefines: true,
    renameStructs: true,
    trimComments: true,
    trimSpaces: true,
    trimZeros: true
  },
  [ /* Additional transform functions */ ]
)

minify(`
  #define PI 3.141592653589793

  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }

  void main() {
    float turn = rad2deg(PI * 2.0);
  }
`)

// #define a 3.141592653589793
// float b(float c){return c/a*180.}void main(){float d=b(a*2.)}
```

Alternatively, the `minify` shorcut can be used to get the same result in a single call:

```typescript
import { minify } from '@plutotcool/glsl-bundler'

minify(`
  #define PI 3.141592653589793

  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }

  void main() {
    float turn = rad2deg(PI * 2.0);
  }
`, { /* Minify parameters */ }, [ /* Additional transform functions */ ])
```
