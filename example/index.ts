import { load, minifier } from '../src'

;(async () => {
  const source = await load('./shaders/fragment.glsl', import.meta.url, [minifier()])
  typeof document !== 'undefined' && document.querySelector('pre')!.append(source)
  console.log(source)
})()
