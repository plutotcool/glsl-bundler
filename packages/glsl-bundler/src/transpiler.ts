import { bundle, Transform } from './bundler'
import { writer } from './writer'
import { escapeRegExp } from './utils'

const GLSL300ES_PATTERN = /^(#version\s+300\s+es\s*\n)/
const IN_PATTERN = /(;\s*)in(\s+[^\;]+)/g
const OUT_PATTERN = /(;\s*)out(\s+[^\;]+)/g
const FRAG_OUT_PATTERN = /;\s*out\s+vec4\s+([^\s;]+)\s*;/
const ATTRIBUTE_PATTERN = /(;\s*)attribute(\s+[^\;]+)/g
const VARYING_PATTERN = /(;\s*)varying(\s+[^\;]+)/g
const FRAG_COLOR_PATTERN = /\bgl_FragColor\b/g
const VERT_POSITION_PATTERN = /\bgl_Position\b/
const GLSL300ES_TEXTURE_PATTERN = /\btexture\b/g
const GLSL100ES_TEXTURE_PATTERN = /\btexture(?:2D|Cube)\b/g

export function transpiler(webgl2: boolean = false): Transform<string> {
  return (source: string) => transpile(source, webgl2)
}

/**
 * Transpiles shader source from and to glsl 300 and 100.
 */
export function transpile(
  source: string,
  webgl2: boolean = false
): string {
  return isVertex(source)
    ? transpileVertex(source, webgl2)
    : transpileFragment(source, webgl2)
}

/**
 * Transpiles vertex shader source from and to glsl 300 and 100.
 */
export function transpileVertex(
  source: string,
  webgl2: boolean = false
): string {
  return bundle(source, [
    writer.define('WEBGL_VERSION', webgl2 ? 2 : 1),
    webgl2 && is300es(source)
      ? transpileVertexTo300es
      : transpileVertexTo100es
  ])
}

/**
 * Transpiles fragment shader source from and to glsl 300 and 100.
 */
export function transpileFragment(
  source: string,
  webgl2: boolean = false
): string {
  return bundle(source, [
    writer.define('WEBGL_VERSION', webgl2 ? 2 : 1),
    webgl2 && is300es(source)
      ? transpileFragmentTo300es
      : transpileFragmentTo100es
  ])
}

/**
 * Transpiles shader source to glsl 100
 */
export function transpileTo100es(source: string): string {
  return isVertex(source)
    ? transpileVertexTo100es(source)
    : transpileFragmentTo100es(source)
}

/**
 * Transpiles shader source to glsl 100
 */
export function transpileTo300es(source: string): string {
  return isVertex(source)
    ? transpileVertexTo300es(source)
    : transpileFragmentTo300es(source)
}

/**
 * Transpiles vertex shader source to glsl 100
 */
export function transpileVertexTo100es(source: string): string {
  return bundle(source, [
    transpileCommonTo100es,
    writer.replace(IN_PATTERN, '$1attribute$2'),
    writer.replace(OUT_PATTERN, '$1varying$2')
  ])
}

/**
 * Transpiles vertex shader source to glsl 300
 */
export function transpileVertexTo300es(source: string): string {
  return bundle(source, [
    transpileCommonTo300es,
    writer.replace(ATTRIBUTE_PATTERN, '$1in$2'),
    writer.replace(VARYING_PATTERN, '$1out$2')
  ])
}

/**
 * Transpiles fragment shader source to glsl 100
 */
export function transpileFragmentTo100es(source: string): string {
  const out = source.match(FRAG_OUT_PATTERN)

  return bundle(source, [
    transpileCommonTo100es,
    out && writer.replace(
      new RegExp(`\\b${escapeRegExp(out[1])}\\b`, 'g'),
      'gl_FragColor'
    ),
    writer.replace(FRAG_OUT_PATTERN, ';'),
    writer.replace(IN_PATTERN, '$1varying$2'),
    writer.replace(OUT_PATTERN, '$1')
  ])
}

/**
 * Transpiles fragment shader source to glsl 300
 */
export function transpileFragmentTo300es(source: string): string {
  const out = source.match(FRAG_OUT_PATTERN)
  const color = out ? out[1] : 'FragColor'

  return bundle(source, [
    transpileCommonTo300es,
    writer.replace(VARYING_PATTERN, '$1in$2'),
    writer.replace(FRAG_COLOR_PATTERN, color),
    writer.replace(FRAG_OUT_PATTERN, ';'),
    writer.insert(`out vec4 ${color};`)
  ])
}

/**
 * Transpiles common shader source to glsl 100 (partial transpilation)
 */
export function transpileCommonTo100es(source: string): string {
  return bundle(source, [
    writer.version(null),
    writer.define('GLSL_VERSION', 100),
    writer.replace(GLSL300ES_TEXTURE_PATTERN, 'texture2D')
  ])
}

/**
 * Transpiles common shader source to glsl 300 (partial transpilation)
 */
export function transpileCommonTo300es(source: string): string {
  return bundle(source, [
    writer.version('300 es'),
    writer.define('GLSL_VERSION', 300),
    writer.replace(GLSL100ES_TEXTURE_PATTERN, 'texture')
  ])

  return source
}

export function is300es(source: string): boolean {
  return GLSL300ES_PATTERN.test(source)
}

export function is100es(source: string): boolean {
  return !is300es(source)
}

export function isVertex(source: string): boolean {
  return !FRAG_COLOR_PATTERN.test(source) && VERT_POSITION_PATTERN.test(source)
}

export function isFragment(source: string): boolean {
  return !isVertex(source)
}
