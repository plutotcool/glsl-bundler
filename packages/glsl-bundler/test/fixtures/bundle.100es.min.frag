#define c 3.141592653589793
struct b{vec2 direction;}float d(float f){return f/c*180.;}void e(b g,inout vec3 h){h=g.direction;}uniform float a;uniform sampler2D diffuse;uniform b light;varying vec2 vUv;void main(){float i=a*d(c*2.);vec3 j;e(light,j);j.z+=i;gl_FragColor=vec4(1.);gl_FragColor.rgb=texture2D(diffuse,vUv).rgb*j;}
