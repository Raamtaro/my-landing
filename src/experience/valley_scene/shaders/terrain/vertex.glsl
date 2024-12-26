uniform float uTime;


varying vec2 vUv;
varying float vElevation;

#include ../partials/getElevation.glsl

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    //Elevation
    float elevation = getElevation(modelPosition.xz + vec2(uTime * 0.03, uTime * 0.0));

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}