import { forwardRef, useMemo } from "react";
import { Effect } from "postprocessing";
import * as THREE from "three";

type PosterizerProps = {
  noiseScale?: number;
  colorLevels?: number;
  ditherStrength?: number;
};

const fragmentShader = `
uniform vec2 uResolution;
uniform float uNoiseScale;
uniform float uColorLevels;
uniform float uDitherStrength;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixelCoord = (uv * uResolution) / uNoiseScale;
    float noise = random(floor(pixelCoord));
    
    vec3 ditheredColor = inputColor.rgb + (noise - 0.5) * uDitherStrength;
    
    vec3 quantizedColor = floor(ditheredColor * uColorLevels) / uColorLevels;
    
    outputColor = vec4(quantizedColor, inputColor.a);
}
`;

class PosterizerImpl extends Effect {
  constructor({ noiseScale = 1.0, colorLevels = 4, ditherStrength = 0.5 }) {
    super("Posterizer", fragmentShader, {
      uniforms: new Map<string, THREE.Uniform<unknown>>([
        ["uResolution", new THREE.Uniform(new THREE.Vector2(0, 0))],
        ["uNoiseScale", new THREE.Uniform(noiseScale)],
        ["uColorLevels", new THREE.Uniform(colorLevels)],
        ["uDitherStrength", new THREE.Uniform(ditherStrength)],
      ]),
    });
  }

  update(_: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget) {
    this.uniforms
      .get("uResolution")
      ?.value.set(inputBuffer.width, inputBuffer.height);
  }
}
const Posterizer = forwardRef<THREE.Object3D, PosterizerProps>((props, ref) => {
  const effect = useMemo(() => new PosterizerImpl(props), [props]);

  return <primitive ref={ref} object={effect} dispose={null} />;
});

export default Posterizer;
