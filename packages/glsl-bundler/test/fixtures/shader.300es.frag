#version 300 es

#include ./pi.glsl
#include ./utils.glsl

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
}
