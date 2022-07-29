#include ./pi.glsl
#include ./utils.glsl

uniform float a;
uniform sampler2D diffuse;
uniform Light light;

varying vec2 vUv;

void main() {
  float angle = a * rad2deg(PI * 2.0);
  vec3 direction;

  getDirection(light, direction);

  direction.z += angle;

  gl_FragColor = vec4(1.0);
  gl_FragColor.rgb = texture2D(diffuse, vUv).rgb * direction;
}
