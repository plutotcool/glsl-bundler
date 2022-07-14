#define GLSL_VERSION 100
#define WEBGL_VERSION 1
uniform mat4 transform;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = transform * vec4(position, 1.0);
}
