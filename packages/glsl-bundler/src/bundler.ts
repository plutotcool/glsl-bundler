export type TransformReturn = Promise<string> | string

export type Transform<T extends TransformReturn = TransformReturn> = (
  (source: string) => T
)

export type BundlerReturn<T extends Transform = Transform> = (
  Promise<string> extends ReturnType<T> ? Promise<string> : string
)

export type Bundler<T extends Transform = Transform> = (
  Transform<BundlerReturn<T>>
)

export function bundler<T extends Transform = Transform>(
  transforms: (T | undefined | null | false | 0)[]
): Bundler<T> {
  return (source: string) => bundle(source, transforms)
}

export function bundle<T extends Transform = Transform>(
  source: string,
  transforms: (T | undefined | null | false | 0)[]
): BundlerReturn<T> {
  return transforms.reduce((source, transform) => (transform
    ? (typeof source === 'string' ? transform(source) : source.then(transform))
    : source
  ) as BundlerReturn<T>, source as unknown as BundlerReturn<T>)
}
