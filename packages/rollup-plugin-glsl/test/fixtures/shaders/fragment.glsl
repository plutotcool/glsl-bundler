#pragma loader: import './pi.glsl'
#pragma loader: import './rad2deg.glsl'

void main() {
  float turn = rad2deg(PI * 2.0);
}
