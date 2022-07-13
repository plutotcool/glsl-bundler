/**
 * @jest-environment node
 */

import { promises as fs } from 'fs'
import { minify, load, loader, bundle } from '../src'

const fixtures: string = `${__dirname}/fixtures/`

it('loads shader files', async () => {
  expect(
    (await load('./fragment.glsl', fixtures)).trim()
  ).toBe(
    (await read(`${fixtures}bundle.glsl`)).trim()
  )
})

it('minifies shader files', async () => {
  expect(
    (await bundle(await read(`${fixtures}fragment.glsl`), [loader(fixtures), minify])).trim()
  ).toBe(
    (await read(`${fixtures}bundle.min.glsl`)).trim()
  )
})

function read(path: string): Promise<string> {
  return fs.readFile(path).then(content => content.toString())
}

function write(path: string, content: string): Promise<void> {
  return fs.writeFile(path, content, 'utf8')
}
