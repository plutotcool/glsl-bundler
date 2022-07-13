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
uniform Light light;

in vec2 uv;
out vec4 FragColor;

void main() {
  float angle = a * rad2deg(PI * 2.0);
  vec3 direction;

  getDirection(light, direction);

  direction.z += angle;
}
