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

export const targets = {
  'webgl1': writer.define('WEBGL_VERSION', 1),
  'webgl2': writer.define('WEBGL_VERSION', 2)
}

export const versions = {
  '100es': writer.define('GLSL_VERSION', 100),
  '300es': writer.define('GLSL_VERSION', 300)
}

export type TranspilerType = 'vertex' | 'fragment'
export type TranspilerTarget = keyof typeof targets
export type TranspilerVersion = keyof typeof versions

export interface TranspilerParameters {
  type?: TranspilerType | 'auto'
  target?: TranspilerTarget | 'auto'
  version?: TranspilerVersion | 'auto'
  defineTarget?: boolean
  defineVersion?: boolean
}

export function transpiler(
  parameters: TranspilerParameters = {}
): Transform<string> {
  return (source: string) => transpile(source, parameters)
}

/**
 * Transpiles shader source from and to glsl 300 and 100
 */
export function transpile(
  source: string,
  parameters: TranspilerParameters = {}
): string {
  const target = resolveTarget(source, parameters)
  const type = resolveType(source, parameters)
  const version = resolveVersion(source, { ...parameters, target })

  return bundle(source, [
    version === '100es' && (type === 'vertex'
      ? transpileVertexTo100es
      : transpileFragmentTo100es
    ),
    version === '300es' && (type === 'vertex'
      ? transpileVertexTo300es
      : transpileFragmentTo300es
    ),
    (source: string) => defineEnvironment(source, {
      ...parameters,
      type,
      target
    })
  ])
}

export function defineEnvironment(source: string, {
  defineTarget = true,
  defineVersion = true,
  ...parameters
}: TranspilerParameters = {}): string {
  return bundle(source, [
    defineTarget && versions[resolveVersion(source, parameters)],
    defineVersion && targets[resolveTarget(source, parameters)]
  ])
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

function resolveTarget(source: string, {
  target = 'auto'
}: TranspilerParameters = {}): TranspilerTarget {
  if (target === 'auto') {
    try {
      if (!document.createElement('canvas').getContext('webgl2')) {
        return 'webgl1'
      }
    } catch (_) {

    }

    return 'webgl2'
  }

  return target
}

function resolveType(source: string, {
  type = 'auto'
}: TranspilerParameters = {}): TranspilerType {
  return type === 'auto'
    ? isVertex(source) ? 'vertex' : 'fragment'
    : type
}

function resolveVersion(source: string, {
  version = 'auto',
  ...parameters
}: TranspilerParameters = {}): TranspilerVersion {
  if (version === 'auto') {
    return resolveTarget(source, parameters) === 'webgl2' && is300es(source)
      ? '300es'
      : '100es'
  }

  return version
}

/**
 * Transpiles vertex shader source to glsl 100
 */
function transpileVertexTo100es(source: string): string {
  return bundle(source, [
    transpileCommonTo100es,
    writer.replace(IN_PATTERN, '$1attribute$2'),
    writer.replace(OUT_PATTERN, '$1varying$2')
  ])
}

/**
 * Transpiles vertex shader source to glsl 300
 */
function transpileVertexTo300es(source: string): string {
  return bundle(source, [
    transpileCommonTo300es,
    writer.replace(ATTRIBUTE_PATTERN, '$1in$2'),
    writer.replace(VARYING_PATTERN, '$1out$2')
  ])
}

/**
 * Transpiles fragment shader source to glsl 100
 */
function transpileFragmentTo100es(source: string): string {
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
function transpileFragmentTo300es(source: string): string {
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
function transpileCommonTo100es(source: string): string {
  return bundle(source, [
    writer.version(null),
    writer.replace(GLSL300ES_TEXTURE_PATTERN, 'texture2D')
  ])
}

/**
 * Transpiles common shader source to glsl 300 (partial transpilation)
 */
function transpileCommonTo300es(source: string): string {
  return bundle(source, [
    writer.version('300 es'),
    writer.replace(GLSL100ES_TEXTURE_PATTERN, 'texture')
  ])

  return source
}
