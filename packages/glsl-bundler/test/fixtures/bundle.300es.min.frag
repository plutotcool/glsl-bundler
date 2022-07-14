#version 300 es
#define c 3.141592653589793
struct b{vec2 direction;}float d(float f){return f/c*180.;}void e(b g,inout vec3 h){h=g.direction;}uniform float a;uniform sampler2D diffuse;uniform b light;in vec2 vUv;out vec4 FragColor;void main(){float i=a*d(c*2.);vec3 j;e(light,j);j.z+=i;FragColor=vec4(1.);FragColor.rgb=texture(diffuse,vUv).rgb*j;}
