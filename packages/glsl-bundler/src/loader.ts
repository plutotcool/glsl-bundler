import { bundle, Transform } from './bundler'

const NODE = typeof window === 'undefined'
const INCLUDE_PATTERN = /^\s*#\s*include\s+(.+?)\s*$/gm

export function loader(
  base: URL | string = '.',
  pattern: RegExp = INCLUDE_PATTERN,
  ignore: string[] = []
): Transform {
  return (source: string) => {
    return bundle(source, (source.match(pattern) || []).map((match) => {
      return async (source: string) => source.replace(
        new RegExp(`${escapeRegExp(match.trim())}\\n?`),
        await load(match.replace(pattern, '$1'), base, pattern, ignore)
      )
    }))
  }
}

export async function load(
  path: string,
  base: URL | string = '.',
  pattern: RegExp = INCLUDE_PATTERN,
  ignore: string[] = []
): Promise<string> {
  path = await resolve(path, base)

  if (ignore.includes(path)) {
    return ''
  }

  ignore.push(path)

  return loader(dirname(path), pattern, ignore)(await read(path))
}

async function resolve(
  path: string,
  base: URL | string = '.'
): Promise<string> {
  base = new URL(base, `file://${NODE
    ? process.cwd()
    : location.pathname
  }`).toString()

  return new URL((NODE
    ? await (await import('import-meta-resolve')).resolve(path, base)
    : new URL(path, base)
  )).pathname
}

async function read(path: string): Promise<string> {
  return NODE
    ? (await (await import('fs')).promises.readFile(path)).toString()
    : (await fetch(path)).text()
}

function dirname(path: string): string {
  return path.replace(/[^\/]+\/?$/, '')
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
