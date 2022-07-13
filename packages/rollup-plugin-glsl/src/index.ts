import { Plugin } from 'rollup'
import { createFilter, FilterPattern } from '@rollup/pluginutils'

import {
  bundle,
  loader,
  minifier,
  MinifierParameters,
  Transform
} from '@plutotcool/glsl-bundler'

export interface GLSLBundlerParameters {
  include?: FilterPattern
  exclude?: FilterPattern
  filter?: (id: string) => boolean
  loader?: boolean
  minifier?: boolean | MinifierParameters
  transforms?: Transform[]
}

export function glslBundler({
  include = /\.(?:glsl|frag|vert)$/,
  exclude = undefined,
  filter = createFilter(include, exclude),
  loader: loaderEnabled = true,
  minifier: minifierParameters = true,
  transforms = []
}: GLSLBundlerParameters = {}): Plugin {

  if (minifierParameters) {
    transforms = [...transforms, minifier({
      ...(minifierParameters as MinifierParameters)
    })]
  }

  return {
    name: 'glsl-bundler',

    async transform(code, id) {
      if (!filter(id)) {
        return
      }

      return `export default \`${await bundle(code, [
        loaderEnabled && loader(id),
        ...transforms
      ].filter(Boolean) as Transform[])}\``
    }
  }
}
