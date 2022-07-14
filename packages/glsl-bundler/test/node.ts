/**
 * @jest-environment node
 */

import { promises as fs } from 'fs'
import { minify, load, transpile, version } from '../src'

const fixtures: string = `${__dirname}/fixtures`

it('loads shader files', async () => {
  expect(
    trim(await load('./shader.300es.frag', fixtures))
  ).toBe(
    trim(await read('bundle.300es.frag'))
  )
})

it('minifies shader files', async () => {
  expect(
    trim(minify(await read('bundle.100es.frag')))
  ).toBe(
    trim(await read('bundle.100es.min.frag'))
  )

  expect(
    trim(minify(await read('bundle.300es.frag')))
  ).toBe(
    trim(await read('bundle.300es.min.frag'))
  )
})

it('transpiles shader files', async () => {
  const [
    frag100es,
    frag300es,
    vert100es,
    vert300es,
    frag100esT,
    frag300esT,
    vert100esT,
    vert300esT
  ] = await Promise.all([
    read('bundle.100es.frag'),
    read('bundle.300es.frag'),
    read('bundle.100es.vert'),
    read('bundle.300es.vert'),
    read('bundle.100es.transpiled.frag'),
    read('bundle.300es.transpiled.frag'),
    read('bundle.100es.transpiled.vert'),
    read('bundle.300es.transpiled.vert')
  ])

  const frag300esAmbiguous = version(frag100es, '300 es')
  const frag100esAmbiguous = version(frag300es, null)
  const vert300esAmbiguous = version(vert100es, '300 es')
  const vert100esAmbiguous = version(vert300es, null)

  expect(trim(transpile(frag100es, false))).toBe(trim(frag100esT))
  expect(trim(transpile(frag300es, false))).toBe(trim(frag100esT))
  expect(trim(transpile(frag300es, true))).toBe(trim(frag300esT))
  expect(trim(transpile(frag100esAmbiguous, false))).toBe(trim(frag100esT))
  expect(trim(transpile(frag300esAmbiguous, false))).toBe(trim(frag100esT))
  expect(trim(transpile(frag300esAmbiguous, true))).toBe(trim(frag300esT))

  expect(trim(transpile(vert100es, false))).toBe(trim(vert100esT))
  expect(trim(transpile(vert300es, false))).toBe(trim(vert100esT))
  expect(trim(transpile(vert300es, true))).toBe(trim(vert300esT))
  expect(trim(transpile(vert100esAmbiguous, false))).toBe(trim(vert100esT))
  expect(trim(transpile(vert300esAmbiguous, false))).toBe(trim(vert100esT))
  expect(trim(transpile(vert300esAmbiguous, true))).toBe(trim(vert300esT))
})

function read(path: string): Promise<string> {
  return fs.readFile(`${fixtures}/${path}`).then(content => content.toString())
}

function trim(source: string): string {
  return source.trim().replace(/\n\n+/g, '\n')
}
