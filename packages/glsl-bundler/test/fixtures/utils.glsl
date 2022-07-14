#include ./pi.glsl

struct Light {
  vec2 direction;
}

float rad2deg(float angle) {
  return angle / PI * 180.0;
}

void getDirection(Light light, inout vec3 direction) {
  direction = light.direction;
}
