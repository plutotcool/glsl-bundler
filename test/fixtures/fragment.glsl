#pragma loader: import './pi.glsl'
#pragma loader: import './utils.glsl'

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
