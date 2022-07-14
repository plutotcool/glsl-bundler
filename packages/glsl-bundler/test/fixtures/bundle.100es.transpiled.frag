#define WEBGL_VERSION 1
#define GLSL_VERSION 100

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

varying vec2 vUv;

void main() {
  float angle = a * rad2deg(PI * 2.0);
  vec3 direction;

  getDirection(light, direction);

  direction.z += angle;

  gl_FragColor = vec4(1.0);
  gl_FragColor.rgb = texture2D(diffuse, vUv).rgb * direction;
}
