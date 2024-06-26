precision highp float;

varying vec2 vUv;

const float PI = 3.14159265359;

uniform vec2 dimensions;
uniform vec3 camPos;
uniform vec2 zoomLimits;
uniform vec3 backgroundColor;
uniform vec3 lineColor;

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

float lerp(float a, float b,float t) {
    return a * (1.0 - t) + b * t;
}

void main(void) {

    float cx = camPos.x;
    float cy = camPos.y;
    float cz = camPos.z;

    float width = dimensions.x;
    float height =  dimensions.y;

    float minZ = zoomLimits.x;
    float maxZ = zoomLimits.y;

    float divisions = 0.1/cz;
    float thickness = 0.05/cz;
    float delta = 0.1 / 2.0;

    float nz = (cz - minZ) / (maxZ - minZ);

    float ux = (vUv.x-0.5) * width + cx*cz;
    float uy = (vUv.y-0.5) * height - cy*cz;


    //extra small grid
    float m1 = grid(ux, uy, divisions*4.0, thickness*4.0) * 0.9;
    float m2 = grid(ux, uy, divisions*16.0, thickness*16.0) * 0.5;
    float xsmall = max(m1, m2);
    
    float s3 = circle_grid(ux, uy, cz/1.6, 1.0) * 0.5;
    xsmall = max(xsmall, s3);

    // small grid
    float c1 = grid(ux, uy, divisions, thickness) * 0.6;
    float c2 = grid(ux, uy, divisions*2.0, thickness) * 0.5;
    float small = max(c1, c2);

    float s1 = circle_grid(ux, uy, cz*10.0, 2.0) * 0.5;
    small = max(small, s1);

    // large grid
    float c3 = grid(ux, uy, divisions/8.0, thickness/8.0) * 0.5;
    float c4 = grid(ux, uy, divisions/2.0, thickness/4.0) * 0.4;
    float large = max(c3, c4);

    float s2 = circle_grid(ux, uy, cz*20.0, 1.0) * 0.4;
    large = max(large, s2);

    float c = mix(large, small, min(nz*2.0+0.05, 1.0));
    c = mix(c, xsmall, max(min((nz-0.3)/0.7, 1.0), 0.0));

    vec3 color = mix(backgroundColor, lineColor, c); 

    gl_FragColor = vec4(color, 1.0);
}
