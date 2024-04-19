
varying vec2 vUv;

uniform float uWidth;
uniform float uHeight;

uniform vec3 uColorDark;
uniform vec3 uColorBright;

uniform vec3 uStrokeColor;
uniform float uStrokeWidth;

float msign(in float x) { return (x < 0.0) ? -1.0 : 1.0; }

vec4 roundedBoxSDF( in vec2 p, in vec2 b, in float r, in float s) {
  vec2 q = abs(p) - b + r;
  float l = b.x + b.y + 1.570796 * r;

  float k1 = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  float k2 = ((q.x > 0.0) ? atan(q.y, q.x) : 1.570796);
  float k3 = 3.0 + 2.0 * msign(min(p.x, -p.y)) - msign(p.x);
  float k4 = msign(p.x * p.y);
  float k5 = r * k2 + max(-q.x, 0.0);

  float ra = s * round(k1 / s);
  float l2 = l + 1.570796 * ra;

  return vec4(k1 - ra, k3 * l2 + k4 * (b.y + ((q.y > 0.0) ? k5 + k2 * ra : q.y)), 4.0 * l2, k1);
}

void main(){

  float y = (1.0-vUv.y) * uHeight;
  float x = vUv.x * uWidth;

  vec2 size = vec2(uWidth, uHeight);
  vec2 uv = (vUv - 0.5) * 2.0;

  float u_border_radius = 0.4;
  vec4 distance = roundedBoxSDF(uv * size, size, u_border_radius*2.0, 0.0);

  if (distance.w > 0.0 ) {
    // outside
    gl_FragColor = vec4(0.0,0.0,0.0, 0.0);
  }else{
    if (distance.w > -uStrokeWidth || mod(y+5.0, 10.0) < uStrokeWidth/2.0) {
      // draw the outer stroke
      gl_FragColor = vec4(uStrokeColor, 1.0);
    }else if (y<5.0){
      // draw the header
      gl_FragColor = vec4(uColorBright, 1.0);
    }else{
      gl_FragColor = vec4(uColorDark, 1.0);
    }
  }
}
