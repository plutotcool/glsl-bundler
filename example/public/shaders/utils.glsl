#pragma loader: import './pi.glsl'

struct Light {
  vec2 direction;
}

vec2 piVec2(vec2 offset) {
  vec2 factor = 2.0;
  offset.x *= factor;
  return vec2(PI, PI) + offset;
}

vec3 piVec3(vec3 offset) {
  vec2 factor = 2.0;
  offset.x *= factor;
  return vec3(PI, PI, PI) + offset;
}

void getDirection(Light light, inout vec3 direction) {
  direction = light.direction
}
