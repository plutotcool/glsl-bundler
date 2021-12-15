import { bundle, Transform } from './bundler'

const NODE = typeof window === 'undefined'
const PRAGMA = /^\s*#pragma\s+loader\s*:\s*import\s+'(.+?)'\s*$/gm

export function loader(
  base: URL | string = '.',
  transforms: Transform[] = [],
  ignore: string[] = []
): Transform {
  return (source: string) => {
    return bundle(source, [...(source.match(PRAGMA) || []).map((pragma) => {
      return async (source: string) => source.replace(
        new RegExp(`^${pragma}$`, 'm'),
        await load(pragma.replace(PRAGMA, '$1'), base, [], ignore)
      )
    }), ...transforms])
  }
}

export async function load(
  path: string,
  base: URL | string = '.',
  transforms: Transform[] = [],
  ignore: string[] = []
): Promise<string> {
  path = await resolve(path, base)

  if (ignore.includes(path)) {
    return ''
  }

  ignore.push(path)

  return loader(dirname(path), transforms, ignore)(await read(path))
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
