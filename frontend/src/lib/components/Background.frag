precision highp float;

varying vec2 vUv;

const float PI = 3.14159265359;

uniform float width;
uniform float height;
uniform float cx;
uniform float cy;
uniform float cz;
uniform float minZ;
uniform float maxZ;

float grid(float x, float y, float divisions, float thickness) {
    x = fract(x * divisions);
    x = min(x, 1.0 - x);

    float xdelta = fwidth(x);
    x = smoothstep(x - xdelta, x + xdelta, thickness);

    y = fract(y * divisions);
    y = min(y, 1.0 - y);

    float ydelta = fwidth(y);
    y = smoothstep(y - ydelta, y + ydelta, thickness);

    return clamp(x + y, 0.0, 1.0);
}

float circle_grid(float x, float y, float divisions, float circleRadius) {

    float gridX = mod(x + divisions/2.0, divisions) - divisions / 2.0;
    float gridY = mod(y + divisions/2.0, divisions) - divisions / 2.0;

    // Calculate the distance from the center of the grid
    float gridDistance = length(vec2(gridX, gridY));

    // Use smoothstep to create a smooth transition at the edges of the circle
    float circle = 1.0 - smoothstep(circleRadius - 0.5, circleRadius + 0.5, gridDistance);

    return circle;
}

void main(void) {
    float divisions = 0.1/cz;
    float thickness = 0.05/cz;
    float delta = 0.1 / 2.0;

    float ux = (vUv.x-0.5) * width + cx*cz;
    float uy = (vUv.y-0.5) * height - cy*cz;

    float c1 = grid(ux, uy, divisions, thickness) * 0.1;
    float c2 = grid(ux, uy, divisions*2.0, thickness) * 0.1;
    float c = max(c1, c2);

    float s1 = circle_grid(ux, uy, cz*10.0, 2.0) * 0.2;
    c = max(c, s1);

    gl_FragColor = vec4(c, c, c, 1.0);
}
