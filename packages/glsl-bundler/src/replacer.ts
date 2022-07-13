// import { Transform } from './bundler'

// export function replacer(...parameters: Parameters<String['replace']>): Transform {
//   return (source: string) => source.replace(source, transforms)
// }

// export function bundle(
//   source: string,
//   transforms: Transform[]
// ): Promise<string> | string {
//   return transforms.reduce(async (source, transform) => (
//     transform(await source)
//   ), source as unknown as Promise<string>)
// }
