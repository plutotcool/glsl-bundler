import { bundler, Transform } from './bundler'

const KEY_PATTERN = /@(\d+)@/g
const DIRECTIVE_PATTERN = /^\s*(#.+?)\s*$/gm
const COMMENTS_PATTERN = /(?:\/\/.*\n|\/\*(?:.|\n)+?\*\/)/g
const TOKEN_SPACE_PATTERN = /\s*([,;{}()?:=+-/*<>])\s*/g
const LEADING_ZERO_PATTERN = /\b0+(\.\d+)/g
const TRAILING_ZERO_PATTERN = /(\d+\.)0+\b/g
const LEADING_TRAILING_SPACE_PATTERN = /^ *(.*?) *$/gm
const EXTRA_SPACE_PATTERN = /  +/g
const EXTRA_NEWLINE_PATTERN = /\n\n+/g
const FUNCTION_PATTERN = /^.*?\b([a-z_]\w*)\s+([a-z_]\w*)\s*\(/gmi
const VARIABLE_PATTERN = /^.*?\b\s*(?:(?:in|out|inout)\s+)?[a-zA-Z_]\w*\s+([a-zA-Z_]\w*)\s*[;,=)]/gm // eslint-disable-line max-len
const STRUCT_PATTERN = /^.*?\bstruct\s+([a-zA-Z_]\w*)\s*\{/gm
const DEFINE_PATTERN = /^#define\s+([^\s]+)/gm
const RETURN_PATTERN = /^return$/
const MAIN_PATTERN = /^main$/
const GROUP_PATTERN = /[{}()]/g

const CHARS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

export interface MinifierParameters {
  renameFunctions?: boolean
  renameVariables?: boolean
  renameDefines?: boolean
  renameStructs?: boolean
  trimComments?: boolean
  trimSpaces?: boolean
  trimZeros?: boolean
}

export function minifier({
  renameFunctions = true,
  renameVariables = true,
  renameDefines = true,
  renameStructs = true,
  trimComments = true,
  trimSpaces = true,
  trimZeros = true
}: MinifierParameters = {}): Transform<string> {
  return bundler([
    trimComments && trimCommentsTransform,
    trimSpaces && trimSpacesTransform,
    trimZeros && trimZerosTransform,
    renameStructs && renameStructsTransform,
    renameDefines && renameDefinesTransform,
    renameFunctions && renameFunctionsTransform,
    renameVariables && renameVariablesTransform
  ])
}

export function minify(
  source: string,
  parameters: MinifierParameters = {}
): string {
  return minifier(parameters)(source)
}

function renameFunctionsTransform(source: string): string {
  let replacement: string
  let offset: number = 0
  let index: number = 0
  let match: string[] | null

  FUNCTION_PATTERN.lastIndex = 0

  while (match = FUNCTION_PATTERN.exec(source.slice(index))) {
    DIRECTIVE_PATTERN.lastIndex = 0

    if (DIRECTIVE_PATTERN.test(match[0])) {
      index += FUNCTION_PATTERN.lastIndex
      FUNCTION_PATTERN.lastIndex = 0
      continue
    }

    RETURN_PATTERN.lastIndex = 0

    if (RETURN_PATTERN.test(match[1])) {
      index += FUNCTION_PATTERN.lastIndex
      FUNCTION_PATTERN.lastIndex = 0
      continue
    }

    MAIN_PATTERN.lastIndex = 0

    if (MAIN_PATTERN.test(match[2])) {
      index += FUNCTION_PATTERN.lastIndex
      FUNCTION_PATTERN.lastIndex = 0
      continue
    }

    [replacement, offset] = uniqueName(offset, source)

    source = source.replace(
      new RegExp(`([^\\.\\w])${match[2]}\\b`, 'g'),
      `$1${replacement}`
    )

    index += FUNCTION_PATTERN.lastIndex + replacement.length - match[2].length
    FUNCTION_PATTERN.lastIndex = 0
  }

  return source
}

function renameVariablesTransform(source: string): string {
  let replacement: string
  let offset: number = 0
  let index: number = 0
  let startIndex: number = 0
  let endIndex: number = 0
  let bufferI: string
  let bufferO: string
  let body: boolean
  let match: string[] | null
  let parenthesis: number
  let bracket: number

  FUNCTION_PATTERN.lastIndex = 0

  while (match = FUNCTION_PATTERN.exec(source.slice(endIndex))) {
    DIRECTIVE_PATTERN.lastIndex = 0

    if (DIRECTIVE_PATTERN.test(match[0])) {
      endIndex += FUNCTION_PATTERN.lastIndex
      FUNCTION_PATTERN.lastIndex = 0
      continue
    }

    RETURN_PATTERN.lastIndex = 0

    if (RETURN_PATTERN.test(match[1])) {
      endIndex += FUNCTION_PATTERN.lastIndex
      FUNCTION_PATTERN.lastIndex = 0
      continue
    }

    body = false
    startIndex = GROUP_PATTERN.lastIndex = FUNCTION_PATTERN.lastIndex + endIndex
    parenthesis = 1
    bracket = 0

    while (match = GROUP_PATTERN.exec(source)) {
      parenthesis += (
        ((match[0] === '(') as unknown as number) -
        ((match[0] === ')') as unknown as number)
      )

      bracket += (
        ((match[0] === '{') as unknown as number) -
        ((match[0] === '}') as unknown as number)
      )

      body = body || (parenthesis === 0 && bracket === 1)
      endIndex = GROUP_PATTERN.lastIndex

      if (body && !parenthesis && !bracket) {
        break
      }
    }

    bufferI = bufferO = source.slice(startIndex, endIndex)
    VARIABLE_PATTERN.lastIndex = index = 0

    while (match = VARIABLE_PATTERN.exec(bufferI.slice(index))) {
      DIRECTIVE_PATTERN.lastIndex = 0

      if (DIRECTIVE_PATTERN.test(match[0])) {
        continue
      }

      [replacement, offset] = uniqueName(offset, source)

      bufferO = bufferO.replace(
        new RegExp(`([^\\.\\w])${match[1]}\\b`, 'g'),
        `$1${replacement}`
      )

      index += VARIABLE_PATTERN.lastIndex
      VARIABLE_PATTERN.lastIndex = 0
    }

    source = `${source.slice(0, startIndex)}${bufferO}${source.slice(endIndex)}`
    endIndex = startIndex + bufferO.length
    FUNCTION_PATTERN.lastIndex = 0
  }

  return source
}

function renameStructsTransform(source: string): string {
  let replacement: string
  let offset: number = 0
  let index: number = 0
  let match: string[] | null

  STRUCT_PATTERN.lastIndex = 0

  while (match = STRUCT_PATTERN.exec(source.slice(index))) {
    DIRECTIVE_PATTERN.lastIndex = 0

    if (DIRECTIVE_PATTERN.test(match[0])) {
      index += STRUCT_PATTERN.lastIndex
      STRUCT_PATTERN.lastIndex = 0
      continue
    }

    [replacement, offset] = uniqueName(offset, source)

    source = source.replace(
      new RegExp(`([^\\.\\w])${match[1]}\\b`, 'g'),
      `$1${replacement}`
    )

    index += STRUCT_PATTERN.lastIndex + replacement.length - match[1].length
    STRUCT_PATTERN.lastIndex = 0
  }

  return source
}

function renameDefinesTransform(source: string): string {
  let replacement: string
  let offset: number = 0
  let index: number = 0
  let match: string[] | null

  DEFINE_PATTERN.lastIndex = 0

  while (match = DEFINE_PATTERN.exec(source.slice(index))) {
    [replacement, offset] = uniqueName(offset, source)

    source = source.replace(
      new RegExp(`([^\\.\\w])${match[1]}\\b`, 'g'),
      `$1${replacement}`
    )

    index += DEFINE_PATTERN.lastIndex + replacement.length - match[1].length
    DEFINE_PATTERN.lastIndex = 0
  }

  return source
}

function trimCommentsTransform(source: string): string {
  return source.replace(COMMENTS_PATTERN, '')
}

function trimSpacesTransform(source: string): string {
  const directives: string[] = []

  return source
    .replace(DIRECTIVE_PATTERN, (_, d) => `@${directives.push(d) - 1}@`)
    .replace(TOKEN_SPACE_PATTERN, '$1')
    .replace(KEY_PATTERN, (_, index) => `\n${directives[index]}\n`)
    .replace(LEADING_TRAILING_SPACE_PATTERN, '$1')
    .replace(EXTRA_SPACE_PATTERN, ' ')
    .replace(EXTRA_NEWLINE_PATTERN, '\n')
    .trim()
}

function trimZerosTransform(source: string): string {
  return source
    .replace(LEADING_ZERO_PATTERN, '$1')
    .replace(TRAILING_ZERO_PATTERN, '$1')
}

function uniqueName(
  offset: number,
  source: string,
  chars = CHARS
): [string, number] {
  let name: string = ''
  let value: number

  while (!name || new RegExp(`\\b${name}\\b`).test(source)) {
    for (name = '', value = offset + 1; value; offset++) {
      name += chars[value % chars.length]
      value = ~~(value / chars.length)
    }
  }

  return [name, offset]
}
