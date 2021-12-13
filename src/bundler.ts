export type Transform = (source: string) => Promise<string> | string

export function bundler(transforms: Transform[]): Transform {
  return (source: string) => bundle(source, transforms)
}

export function bundle(
  source: string,
  transforms: Transform[]
): Promise<string> | string {
  return transforms.reduce(async (source, transform) => (
    transform(await source)
  ), source as unknown as Promise<string>)
}
