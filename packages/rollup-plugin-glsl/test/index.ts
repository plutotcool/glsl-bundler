import * as os from 'os'
import * as fs from 'fs-extra'
import { rollup, OutputBundle } from 'rollup'
import { minify, load, bundle } from '@plutotcool/glsl-bundler'
import { glslBundler } from '../src'

let output: string
const fixtures: string = `${__dirname}/fixtures`

const read = async (path: string) => (await fs.readFile(path)).toString()
const exists = (path: string) => fs.pathExists(path)

beforeEach(async () => {
  output = `${os.tmpdir()}/rollup-plugin-glsl-bundler`
  await fs.emptyDir(output)
})

afterAll(async () => {
  await fs.emptyDir(output)
})

it('bundles glsl', async () => {
  const rollupBundle = await rollup({
    input: `${fixtures}/index.js`,
    plugins: [
      glslBundler({ loader: false, minifier: false })
    ]
  })

  await rollupBundle.write({
    file: `${output}/index.js`,
    format: 'es',
    name: 'test'
  })

  expect(
    await read(`${output}/index.js`)
  ).toMatch(`\`${
    await read(`${fixtures}/shaders/fragment.glsl`)
  }\``)
})

it('loads glsl imports', async () => {
  const rollupBundle = await rollup({
    input: `${fixtures}/index.js`,
    plugins: [
      glslBundler({ loader: true, minifier: false })
    ]
  })

  await rollupBundle.write({
    file: `${output}/index.js`,
    format: 'es',
    name: 'test'
  })

  expect(
    await read(`${output}/index.js`)
  ).toMatch(`\`${
    await load(`${fixtures}/shaders/fragment.glsl`)
  }\``)
})

it('minifies glsl', async () => {
  const rollupBundle = await rollup({
    input: `${fixtures}/index.js`,
    plugins: [
      glslBundler({ loader: false, minifier: true })
    ]
  })

  await rollupBundle.write({
    file: `${output}/index.js`,
    format: 'es',
    name: 'test'
  })

  expect(
    await read(`${output}/index.js`)
  ).toMatch(`\`${
    await minify(await read(`${fixtures}/shaders/fragment.glsl`))
  }\``)
})

it('both minifies and load glsl imports by default', async () => {
  const rollupBundle = await rollup({
    input: `${fixtures}/index.js`,
    plugins: [
      glslBundler()
    ]
  })

  await rollupBundle.write({
    file: `${output}/index.js`,
    format: 'es',
    name: 'test'
  })

  expect(
    await read(`${output}/index.js`)
  ).toMatch(`\`${
    await bundle(await load(`${fixtures}/shaders/fragment.glsl`, fixtures), [minify])
  }\``)
})
