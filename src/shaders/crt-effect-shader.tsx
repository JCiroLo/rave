import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { Effect } from "postprocessing";

const fragmentShader = `
  uniform float pixelSize;
  uniform vec2 tSize; 
  
  float bayerDither(vec2 p) {
      int x = int(mod(p.x, 4.0));
      int y = int(mod(p.y, 4.0));
      int index = x + y * 4;
      
      float limit = 0.0;
      if (index == 0) limit = 1.0; if (index == 1) limit = 9.0;
      if (index == 2) limit = 3.0; if (index == 3) limit = 11.0;
      if (index == 4) limit = 13.0; if (index == 5) limit = 5.0;
      if (index == 6) limit = 15.0; if (index == 7) limit = 7.0;
      if (index == 8) limit = 4.0; if (index == 9) limit = 12.0;
      if (index == 10) limit = 2.0; if (index == 11) limit = 10.0;
      if (index == 12) limit = 16.0; if (index == 13) limit = 8.0;
      if (index == 14) limit = 14.0; if (index == 15) limit = 6.0;

      return limit / 17.0;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec2 coord = gl_FragCoord.xy;
      vec2 pixelOrigin = floor(coord / pixelSize) * pixelSize;
      
      vec2 centerUv = pixelOrigin / tSize;
      
      vec4 color = texture2D(inputBuffer, centerUv + (pixelSize / tSize) * 0.5);
      
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      float isRed = step(color.g + color.b, color.r * 1.2);
            
      vec2 ditherCoord = coord / pixelSize;
      float dither = bayerDither(ditherCoord);
      
      float lit = 0.0;
      if (luma + (dither * 0.3) > 0.4) lit = 1.0; 

      vec2 uvPixel = fract(coord / pixelSize);
      vec2 gap = vec2(0.15, 0.15); 
      vec2 maskBox = step(gap, uvPixel) * step(uvPixel, 1.0 - gap);
      float mask = maskBox.x * maskBox.y;
      
      vec3 finalColor = vec3(0.0);
      
      if (lit > 0.5) {
          if (isRed > 0.5 && luma < 0.7) {
              finalColor = vec3(1.0, 0.0, 0.1); 
          } else {
              finalColor = vec3(0.9, 0.9, 0.9); 
          }
      }

      outputColor = vec4(finalColor * mask, 1.0);
  }
`;

class CrtEffectImpl extends Effect {
  constructor({ pixelSize = 8.0 } = {}) {
    super("CrtEffect", fragmentShader, {
      uniforms: new Map<string, THREE.Uniform<unknown>>([
        ["pixelSize", new THREE.Uniform(pixelSize)],
        ["tSize", new THREE.Uniform(new THREE.Vector2(0, 0))],
      ]),
    });
  }

  update(_: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget) {
    this.uniforms
      .get("tSize")!
      .value.set(inputBuffer.width, inputBuffer.height);
  }
}

interface CrtEffectProps {
  pixelSize: number;
}

export const CrtEffect = forwardRef<THREE.Object3D, CrtEffectProps>(
  ({ pixelSize }, ref) => {
    const effect = useMemo(() => new CrtEffectImpl({ pixelSize }), [pixelSize]);

    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);
