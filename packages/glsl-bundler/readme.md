# glsl-bundler

[![test](https://github.com/plutotcool/glsl-bundler/actions/workflows/test.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/test.yml)
[![build](https://github.com/plutotcool/glsl-bundler/actions/workflows/build.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/build.yml)
[![release](https://github.com/plutotcool/glsl-bundler/actions/workflows/release.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/release.yml)
[![version](https://img.shields.io/github/package-json/v/plutotcool/glsl-bundler?filename=packages%2Fglsl-bundler%2Fpackage.json)](https://npmjs.com/package/@plutotcool/glsl-bundler)
![types](https://img.shields.io/npm/types/@plutotcool/glsl-bundler)

Functional regex-based bundling tools for glsl. Run both on node and the browser.

*Currently in alpha*

## Install

```bash
yarn add @plutotcool/glsl-bundler
```

## Usage

- [Common examples](#common-examples)
- [Bundler](#bundler)
- [Loader](#loader)
- [Writer](#writer)
- [Transpiler](#transpiler)
- [Minifier](#minifier)

### Common examples

Load a shader as a string and resolve `#include` directives:

```typescript
import { load } from '@plutotcool/glsl-bundler'

await load(`./fragment.glsl`, import.meta.url)
```

Edit a shader:

```typescript
import { define } from '@plutotcool/glsl-bundler'

const source = `
  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }
`

define(source, 'PI', 3.141592653589793)
```

Transpile a shader:

```typescript
import { transpile } from '@plutotcool/glsl-bundler'

const source = `#version es 300
  uniform diffuse sampler2D;

  in vec2 vUv;
  out vec4 FragColor;

  void main() {
    FragColor = texture(diffuse, vUv);
  }
`

transpile(source)
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

Combine loading, editing, transpiling and minifying into a bundle function:

```typescript
import {
  bundler,
  loader,
  writer,
  transpiler,
  minifier
} from '@plutotcool/glsl-bundler'

const bundle = bundler([
  loader(import.meta.url),
  writer.define('PI', 3.141592653589793),
  transpiler(),
  minifier()
])

await bundle(`
  #include ./pi.glsl
  #include ./rad2deg.glsl

  void main() {
    float turn = rad2deg(PI * 2.0);
  }
`)
```

### Bundler

The `bundler` factory creates a function that transforms glsl source code given an array of [transform functions](src/bundler.ts#L1):

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

Alternatively, the `bundle` shortcut can be used to get the same result in a single call:

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

The `loader` factory creates an asynchronous transform function that resolves `#include` directives from file system (node) or network (browser):

```glsl
// ./rad2deg.glsl

#include ./pi.glsl

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

const load = loader(import.meta.url)

await load(`
  #include ./pi.glsl
  #include ./rad2deg.glsl

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

> Note that, even if `pi.glsl` is included twice, it is only outputed once as soon as needed.
> On node, the loader follows node module resolution using [import-meta-resolve](https://github.com/wooorm/import-meta-resolve).

Alternatively, the `load` shortcut can be used to load shaders directly from file system or network:

```glsl
// ./fragment.glsl

#include ./pi.glsl
#include ./rad2deg.glsl

void main() {
  float turn = rad2deg(PI * 2.0);
}
```

```typescript
import { load } from '@plutotcool/glsl-bundler'

await load('./fragment.glsl', import.meta.url)
```

### Writer

The `writer` namespace exposes useful synchronous transform factories for editing glsl code:

```typescript
import { writer, bundler } from '@plutotcool/glsl-bundler'

const write = bundler([
  // insert line at given index or pattern, negative index starts from the end
  writer.insert('// comment at line 3', 3)
  writer.insert('// comment at last line', -1)
  writer.insert('// comment before uniforms', /\buniform\b/)

   // remove line at given number or pattern
  writer.remove(/\/\/\s+comment line to remove/)

  // insert or override define directive
  // by default to the top of the code, or at given line index or patten
  writer.define('PI', 3.14)
  writer.define('A', true)
  writer.define('B', 'foo', /uniform float a;/)

  // replace given string or pattern
  writer.replace(/\bFragColor\b/g, 'Color')

  // insert or override glsl version, pass null to remove the version directive
  writer.version('300 es')
])

write(`
  #define PI 3.141592653589793

  // comment line to remove

  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }

  uniform float a;

  out vec4 FragColor;

  void main() {
    float turn = rad2deg(PI * 2.0);
    FragColor = vec4(turn / 360.0, 0., 0., 1.);
  }
`)

// #version es 300
// #define A true
// #define PI 3.14
//
// // comment at line 3
//
// float rad2deg(float angle) {
//   return angle / PI * 180.0;
// }
//
// // comment before uniforms
// #define B foo
// uniform float a;
//
// out vec4 Color;
//
// void main() {
//   float turn = rad2deg(PI * 2.0);
//   Color = vec4(turn / 360.0, 0., 0., 1.);
// }
// // comment at last line
```

Alternatively, the writer modules exposes shortcuts to edit glsl code in a single call:

```typescript
import {
  insert,
  remove,
  define,
  replace,
  version
} from '@plutotcool/glsl-bundler'

const source = `
  #define PI 3.141592653589793

  // comment line to remove

  float rad2deg(float angle) {
    return angle / PI * 180.0;
  }

  uniform float a;

  out vec4 FragColor;

  void main() {
    float turn = rad2deg(PI * 2.0);
    FragColor = vec4(turn / 360.0, 0., 0., 1.);
  }
`

source = insert(source, '// comment at last line', -1)
source = remove(source, /\/\/\s+comment line to remove/)
source = define(source, 'PI', 3.14)
source = replace(source, /\bFragColor\b/g, 'Color')
source = version(source, '300 es')

// #version es 300
// #define A true
// #define PI 3.14
//
// float rad2deg(float angle) {
//   return angle / PI * 180.0;
// }
//
// uniform float a;
//
// out vec4 Color;
//
// void main() {
//   float turn = rad2deg(PI * 2.0);
//   Color = vec4(turn / 360.0, 0., 0., 1.);
// }
// // comment at last line
```

### Transpiler

The `transpiler` factory creates a synchronous transform function that transpiles glsl code from and to versions 300 es and 100 es:

```typescript
import { transpiler } from '@plutotcool/glsl-bundler'

const transpile = transpiler({
  // Default transpile parameters:
  target: 'auto',
  version: 'auto',
  defineTarget: true,
  defineVersion: true
})

transpile(`#version es 300
  in vec3 position;
  in vec2 uv;

  out vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.);
  }
`)

// #define WEBGL_VERSION 1
// #define GLSL_VERSION 100
// attribute vec3 position;
// attribute vec2 uv;
//
// varying vec2 vUv;
//
// void main() {
//   vUv = uv;
//   gl_Position = vec4(position, 1.);
// }

transpile(`#version es 300
  uniform diffuse sampler2D;

  in vec2 vUv;

  out vec4 FragColor;

  void main() {
    FragColor = texture(diffuse, vUv);
  }
`)

// #define WEBGL_VERSION 1
// #define GLSL_VERSION 100
// uniform diffuse sampler2D;
//
// varying vec2 vUv;
//
// void main() {
//   gl_FragColor = texture2D(diffuse, vUv);
// }
```

> If `target` is set to `'webgl2'` and `version` is set to `'auto'`, the transpiler will not transform the syntax since both glsl 100 es and 300 es are supported.
>
> If `target` is set to `'webgl1'` and `version` is set to `'auto'`, the transpiler will transform the syntax to support 100 es.
>
> Even if the glsl code have mixed syntaxes (when including dependencies for instance), the transpiler will always output valid glsl;
> With the syntax that satisfies the version detected from the `#version` directive, but primarily with a syntax that is supported by the webgl target.
>
> If `version` is set to `'100 es'` or `'300 es'`, the transpiler will always transform the syntax to support the given glsl version.

### Minifier

The `minifier` factory creates a synchronous transform function that removes unnecessary characters and renames tokens:

```typescript
import { minifier } from '@plutotcool/glsl-bundler'

const minify = minifier({
  // Default minify parameters:
  renameFunctions: true,
  renameVariables: true,
  renameDefines: true,
  renameStructs: true,
  trimComments: true,
  trimSpaces: true,
  trimZeros: true
})

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
// float b(float c){return c/a*180.;}void main(){float d=b(a*2.);}
```

Alternatively, the `minify` shortcut can be used to get the same result in a single call:

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
