precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;

uniform vec2 uMouse;
uniform float uTime;
uniform float uRadius;

#define TWO_PI 6.28318530718
#include ./includes/simplexNoise3d.glsl;

float circle(in vec2 _st, in float _radius, in float blurriness){
	vec2 dist = _st;
	return 1.-smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
}

void main()
{   vec2 res = uResolution * PR;
    vec2 st = gl_FragCoord.xy/uResolution.xy;
    vec2 newUv = vUv;

    st.y *= uResolution.y / uResolution.x;

    vec2 mouse = uMouse;
    mouse.y *= uResolution.y/uResolution.x;
    mouse *= -1.0;
    vec2 circlePos = st + mouse;

    float c = circle(circlePos, uRadius, 2.) * 2.5;

    //noise 
    float offX = newUv.x + sin(newUv.y + uTime * .1);
    float offY = newUv.y - uTime * 0.1 - cos(uTime * .001) * .01;


    float n = snoise(vec3(offX, offY, uTime * .1)*8.0) - 1.;

    //Final Mask
    float finalMask = smoothstep(0.475, .5, n + pow(c, 2.));

    //final image
    vec4 firstTexture = texture2D(uTexture1, newUv); //Hover 
    vec4 secondTexture = texture2D(uTexture2, newUv); //Cover

    vec4 finalImage = mix(secondTexture, firstTexture, finalMask);

    // gl_FragColor = secondTexture;
    gl_FragColor = vec4(firstTexture); //I'm manually rendering the first texture right now

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}