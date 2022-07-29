#version 300 es
#define WEBGL_VERSION 2
#define GLSL_VERSION 300

out vec4 FragColor;

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

void main() {
  float angle = a * rad2deg(PI * 2.0);
  vec3 direction;

  getDirection(light, direction);

  direction.z += angle;

  FragColor = vec4(1.0);
  FragColor.rgb = texture(diffuse, vUv).rgb * direction;
}
