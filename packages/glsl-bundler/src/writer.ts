import { Transform } from './bundler'
import { escapeRegExp } from './utils'

const VERSION_PATTERN = /^\s*?#\s*version\b.*$/m

export type WriterLocation = number | RegExp
export type WriterDefineValue = string | number | boolean | null

export type WriterParameters<
  T extends (source: string, ...parameters: any[]) => string // eslint-disable-line @typescript-eslint/no-explicit-any, max-len
> = Parameters<T> extends [any, ...infer U] ? U : never // eslint-disable-line @typescript-eslint/no-explicit-any, max-len

export const writer = {
  replace(...parameters: WriterParameters<typeof replace>): Transform<string> {
    return (source: string) => replace(source, ...parameters)
  },

  insert(...parameters: WriterParameters<typeof insert>): Transform<string> {
    return (source: string) => insert(source, ...parameters)
  },

  remove(...parameters: WriterParameters<typeof remove>): Transform<string> {
    return (source: string) => remove(source, ...parameters)
  },

  define(...parameters: WriterParameters<typeof define>): Transform<string> {
    return (source: string) => define(source, ...parameters)
  },

  version(...parameters: WriterParameters<typeof version>): Transform<string> {
    return (source: string) => version(source, ...parameters)
  }
}

export function replace(
  source: string,
  pattern: RegExp | string = '',
  replacement: string = ''
): string {
  return source.replace(pattern, replacement)
}

export function insert(
  source: string,
  line: string | null = '',
  location: WriterLocation = 0
): string {
  const lines = source.split('\n')
  let index = typeof location === 'number'
    ? (location < 0 ? lines.length + location : location)
    : lines.findIndex(l => (location as RegExp).test(l))

  if (index < 0 || index >= lines.length) {
    throw new Error(`Invalid ${line === null ? 'remove' : 'insert'} location`)
  }

  if (index === 0 && VERSION_PATTERN.test(source)) {
    index = 1
  }

  line === null ? lines.splice(index, 1) : lines.splice(index, 0, line)

  return lines.join('\n')
}

export function remove(
  source: string,
  location: WriterLocation = -1
): string {
  return insert(source, null, location)
}

export function define(
  source: string,
  constant: string = '_',
  value: string | number | boolean | null = 1,
  location: WriterLocation = 0
): string {
  const pattern = new RegExp(`^#define\\s+${escapeRegExp(constant)}.*$`, 'm')
  const line = value === null ? '' : `#define ${constant} ${value}`

  return pattern.test(source)
    ? source.replace(pattern, line)
    : insert(source, line, location)
}

export function version(
  source: string,
  version: string | null = null
): string {
  return `${
    version ? `#version ${version}\n` : ''
  }${
    source.replace(VERSION_PATTERN, '')
  }`
}
