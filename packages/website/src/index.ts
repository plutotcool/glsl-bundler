import { EditorView, lineNumbers, rectangularSelection, keymap } from '@codemirror/view'
import { bracketMatching, indentOnInput } from '@codemirror/language'
import { indentWithTab } from '@codemirror/commands'
import { cpp } from '@codemirror/lang-cpp'
import { githubDark } from '@uiw/codemirror-theme-github'
import { Pane } from 'tweakpane'
import { bundle, transpiler, minifier } from '@plutotcool/glsl-bundler'

import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete'

const [
  inputContainer,
  outputContainer
] = document.querySelectorAll('section')

const config = {
  lineNumbers: true,
  lineWrapping: true,
  tabSize: 2,
  extensions: [
    githubDark,
    lineNumbers(),
    rectangularSelection(),
    cpp(),
    EditorView.theme({
      '&.cm-editor': {
        backgroundColor: 'transparent',
        height: '100%'
      },
      '&.cm-editor.cm-focused': {
        outline: 'none'
      },
      '& .cm-content': {
        width: '100%',
        backgroundColor: 'transparent',
        whiteSpace: 'pre-wrap !important',
        wordBreak: 'break-all !important',
        flexShrink: '1',
        flexGrow: '1'
      },
      '.cm-scroller': {
        width: '100%',
        padding: '20px 0',
        display: 'flex'
      },
      '.cm-gutters': {
        backgroundColor: '#000',
        paddingRight: '10px',
        color: 'rgba(255, 255, 255, 0.3)'
      },
      '&.cm-focused .cm-selectionBackground .cm-selectionBackground, & .cm-selectionLayer .cm-selectionBackground, & ::selection': {
        backgroundColor: 'rgba(255, 255, 255, .08) !important'
      }
    }, {dark: true})
  ],
}

const input = new EditorView({
  ...config,
  extensions: [
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    keymap.of([indentWithTab]),
    ...config.extensions,
  ],
  parent: inputContainer
})

const output = new EditorView({
  ...config,
  readOnly: true,
  parent: outputContainer
})

output.contentDOM.removeAttribute('contenteditable')
input.contentDOM.addEventListener('input', update)

const pane = new Pane({
  container: document.querySelector('aside')
})

input.dispatch({
  changes: { from: 0, insert: `#version 300 es

#define PI 3.141592653589793

struct Light {
  vec2 direction;
}

float rad2deg(float angle) {
  return angle / PI * 180.0;
}

void getDirection(Light light, inout vec3 direction) {
  direction = light.direction;
}

uniform float a;
uniform sampler2D diffuse;
uniform Light light;

in vec2 vUv;
out vec4 FragColor;

void main() {
  float angle = a * rad2deg(PI * 2.0);
  vec3 direction;

  getDirection(light, direction);

  direction.z += angle;

  FragColor = vec4(1.0);
  FragColor.rgb = texture(diffuse, vUv).rgb * direction;
}` } })

pane.element.classList.add('tweakpane')

const minifierParameters = {
  enabled: true,
  renameFunctions: true,
  renameVariables: true,
  renameDefines: true,
  renameStructs: true,
  trimComments: true,
  trimSpaces: true,
  trimZeros: true
}

const transpilerParameters = {
  enabled: false,
  version: '100es'
}

const minifierPane = pane.addFolder({
  title: 'minifier'
})

const transpilerPane = pane.addFolder({
  title: 'transpiler'
})

minifierPane
  .addInput(minifierParameters, 'enabled')
  .on('change', update)

minifierPane
  .addInput(minifierParameters, 'renameFunctions')
  .on('change', update)

minifierPane
  .addInput(minifierParameters, 'renameVariables')
  .on('change', update)

minifierPane
  .addInput(minifierParameters, 'renameDefines')
  .on('change', update)

minifierPane
  .addInput(minifierParameters, 'renameStructs')
  .on('change', update)

minifierPane
  .addInput(minifierParameters, 'trimComments')
  .on('change', update)

minifierPane
  .addInput(minifierParameters, 'trimSpaces')
  .on('change', update)

minifierPane
  .addInput(minifierParameters, 'trimZeros')
  .on('change', update)

transpilerPane
  .addInput(transpilerParameters, 'enabled')
  .on('change', update)

transpilerPane
  .addInput(transpilerParameters, 'version', {
    options: {
      '100es': '100es',
      '300es': '300es'
    }
  })
  .on('change', update)

update()

function update() {
  output.dispatch({
    changes: {
      from: 0,
      to: output.docView.length,
      insert: bundle(input.state.doc.toString(), [
        transpilerParameters.enabled && transpiler({
          version: transpilerParameters.version,
          webgl: 'webgl2',
          defineTarget: false,
          defineVersion: false
        }),
        minifierParameters.enabled && minifier({
          renameFunctions: minifierParameters.renameFunctions,
          renameVariables: minifierParameters.renameVariables,
          renameDefines: minifierParameters.renameDefines,
          renameStructs: minifierParameters.renameStructs,
          trimComments: minifierParameters.trimComments,
          trimSpaces: minifierParameters.trimSpaces,
          trimZeros: minifierParameters.trimZeros
        })
      ])
    }
  })
}
