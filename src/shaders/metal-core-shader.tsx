import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { Effect } from "postprocessing";

type MetalCoreEffectProps = {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  enablePixelate?: boolean;
  pixelFactor?: number;
  enablePosterize?: boolean;
  colorLevels?: number;
  ditherStrength?: number;
  chromAberration?: number;
  vignetteStrength?: number;
  grainStrength?: number;
  tintColor?: THREE.Vector3;
  tintStrength?: number;
  viewportSize?: THREE.Vector2;
  time?: number;
};

const fragmentShader = `
uniform float exposure;
uniform float contrast;
uniform float saturation;

uniform bool enablePixelate;
uniform float pixelFactor;

uniform bool enablePosterize;
uniform float colorLevels;
uniform float ditherStrength;

uniform float chromAberration;
uniform float vignetteStrength;
uniform float grainStrength;

uniform vec3 tintColor;
uniform float tintStrength;

uniform vec2 viewportSize;
uniform float time;

float bayer4x4(vec2 p){
    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    int m[16] = int[16](
         0,  8,  2, 10,
        12,  4, 14,  6,
         3, 11,  1,  9,
        15,  7, 13,  5
    );
    return (float(m[y*4 + x]) + 0.5) / 16.0;
}

vec3 to_hsv(vec3 c){
    float cmax = max(c.r, max(c.g, c.b));
    float cmin = min(c.r, min(c.g, c.b));
    float d = cmax - cmin;
    float h = 0.0;

    if(d > 1e-5){
        if(cmax == c.r)       h = mod((c.g - c.b) / d, 6.0);
        else if(cmax == c.g)  h = (c.b - c.r) / d + 2.0;
        else                  h = (c.r - c.g) / d + 4.0;

        h /= 6.0;
        if(h < 0.0) h += 1.0;
    }

    float s = cmax <= 1e-5 ? 0.0 : d / cmax;
    return vec3(h, s, cmax);
}

vec3 to_rgb(vec3 hsv){
    float h = hsv.x * 6.0;
    float s = hsv.y;
    float v = hsv.z;

    int i = int(floor(h));
    float f = h - float(i);

    float p = v * (1.0 - s);
    float q = v * (1.0 - s * f);
    float t = v * (1.0 - s * (1.0 - f));

    if(i == 0) return vec3(v, t, p);
    if(i == 1) return vec3(q, v, p);
    if(i == 2) return vec3(p, v, t);
    if(i == 3) return vec3(p, q, v);
    if(i == 4) return vec3(t, p, v);
    return vec3(v, p, q);
}

vec3 adjust(vec3 c, float contrast, float saturation){
    c = (c - 0.5) * contrast + 0.5;
    vec3 hsv = to_hsv(c);
    hsv.y *= saturation;
    return clamp(to_rgb(hsv), 0.0, 1.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outColor){
    vec2 px = 1.0 / viewportSize;
    if(viewportSize.x <= 0.0) {
        px = vec2(1.0) / vec2(textureSize(inputBuffer, 0));
    }

    vec2 u = uv;

    if(enablePixelate){
        vec2 stepUv = px * pixelFactor;
        u = floor(uv / stepUv) * stepUv + stepUv * 0.5;
    }

    vec2 center = vec2(0.5);
    vec2 dir = u - center;
    float dist = length(dir);
    float ca = chromAberration * dist * dist;

    vec3 col;
    col.r = texture(inputBuffer, u + dir * ca).r;
    col.g = texture(inputBuffer, u).g;
    col.b = texture(inputBuffer, u - dir * ca).b;

    col *= exposure;

    col = mix(col, col * tintColor, tintStrength);

    if(enablePosterize){
        vec2 frag = floor(uv / px);
        float b = bayer4x4(frag);
        vec3 q = floor(col * colorLevels + b * ditherStrength);
        col = q / (colorLevels - 1.0);
    }

    col = adjust(col, contrast, saturation);

    float vignette = smoothstep(0.5, 0.9, dist) * vignetteStrength;
    col *= clamp(1.0 - vignette, 0.0, 1.0);

    float n = fract(sin(dot(floor(uv/px), vec2(12.9898, 78.233)) + time * 37.0) * 43758.5453);
    col += (n - 0.5) * (px.x + px.y) * 2.0 * grainStrength;

    outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

class MetalCoreEffectImpl extends Effect {
  private time: number;

  constructor({
    exposure = 1.0,
    contrast = 1.05,
    saturation = 0.9,
    enablePixelate = true,
    pixelFactor = 2.0,
    enablePosterize = true,
    colorLevels = 8.0,
    ditherStrength = 0.35,
    chromAberration = 0.35,
    vignetteStrength = 1.0,
    grainStrength = 0.2,
    tintColor = new THREE.Vector3(0.95, 1.03, 0.9),
    tintStrength = 0.15,
    viewportSize = new THREE.Vector2(0, 0),
  } = {}) {
    super("MetalCoreEffect", fragmentShader, {
      uniforms: new Map<string, THREE.Uniform<unknown>>([
        ["exposure", new THREE.Uniform(exposure)],
        ["contrast", new THREE.Uniform(contrast)],
        ["saturation", new THREE.Uniform(saturation)],
        ["enablePixelate", new THREE.Uniform(enablePixelate)],
        ["pixelFactor", new THREE.Uniform(pixelFactor)],
        ["enablePosterize", new THREE.Uniform(enablePosterize)],
        ["colorLevels", new THREE.Uniform(colorLevels)],
        ["ditherStrength", new THREE.Uniform(ditherStrength)],
        ["chromAberration", new THREE.Uniform(chromAberration)],
        ["vignetteStrength", new THREE.Uniform(vignetteStrength)],
        ["grainStrength", new THREE.Uniform(grainStrength)],
        ["tintColor", new THREE.Uniform(tintColor)],
        ["tintStrength", new THREE.Uniform(tintStrength)],
        ["viewportSize", new THREE.Uniform(viewportSize)],
        ["time", new THREE.Uniform(0)],
      ]),
    });

    this.time = 0;
  }

  update(
    renderer: THREE.WebGLRenderer,
    inputBuffer: THREE.WebGLRenderTarget,
    deltaTime: number
  ) {
    this.time += deltaTime;
    this.uniforms.get("time").value = this.time;
    this.uniforms
      .get("viewportSize")
      ?.value.set(inputBuffer.width, inputBuffer.height);
  }
}

const MetalCoreEffect = forwardRef<THREE.Object3D, MetalCoreEffectProps>(
  (props, ref) => {
    const effect = useMemo(() => new MetalCoreEffectImpl(props), [props]);

    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);

export default MetalCoreEffect;
