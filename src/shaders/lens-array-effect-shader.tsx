import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { Effect } from "postprocessing";

const fragmentShader = `
uniform float gridSize;
uniform float curvature;
uniform float gridAngle;
uniform int uShape;      // 0: Circle, 1: Diamond, 2: Square
uniform vec2 uScale;     // Controla el aspecto (ancho/alto) de la celda
uniform float uStagger;  // 0.0: Grid normal, 1.0: Grid desplazado (panal)

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // 1. Rotación global
    float c = cos(gridAngle);
    float s = sin(gridAngle);
    mat2 rot = mat2(c, -s, s, c);
    
    // Ajustar aspecto
    vec2 aspectUV = uv;
    // aspectUV.x *= 1.77; // Descomentar si quieres forzar aspecto 16:9 duro
    
    // 2. Crear la cuadrícula
    vec2 gridUV = aspectUV * gridSize;
    
    // 3. Desplazamiento de filas (Stagger) condicional
    float row = floor(gridUV.y);
    // Solo desplazamos si uStagger es > 0.5 y la fila es impar
    if (uStagger > 0.5 && mod(row, 2.0) > 0.0) {
        gridUV.x += 0.5;
    }
    
    // 4. Coordenadas locales (-0.5 a 0.5)
    vec2 cellUV = fract(gridUV) - 0.5;
    
    // 5. MODULACIÓN DE FORMA (Aquí ocurre la magia)
    // Aplicamos la escala para deformar (ej: óvalos verticales)
    // Invertimos escala para que sea intuitivo (valor alto = forma más grande)
    vec2 shapedUV = cellUV / uScale; 
    
    float dist = 0.0;
    
    if (uShape == 0) {
        // Círculo / Óvalo
        dist = length(shapedUV);
    } else if (uShape == 1) {
        // Rombo / Diamante (Manhattan distance)
        dist = abs(shapedUV.x) + abs(shapedUV.y);
    } else if (uShape == 2) {
        // Cuadrado / Rectángulo (Chebyshev distance)
        dist = max(abs(shapedUV.x), abs(shapedUV.y));
    }
    
    // 6. Renderizado de la lente
    // El borde de la forma es siempre 0.5 en este espacio normalizado
    if (dist < 0.5) {
        // Calculamos la "profundidad" (z) basada en la distancia para simular volumen
        // Usamos una función suave para que rombos y cuadrados también parezcan burbujas
        float z = sqrt(0.5 * 0.5 - dist * dist);
        
        // Normal aproximada
        vec3 normal = normalize(vec3(shapedUV.x, shapedUV.y, z));
        
        // Refractar
        vec2 distortedUV = uv + normal.xy * curvature;
        outputColor = texture2D(inputBuffer, distortedUV);
        
        // Sombreado (Vignette interno de cada celda)
        float shading = dot(normal, vec3(0.0, 0.0, 1.0));
        outputColor.rgb *= smoothstep(0.0, 1.2, shading); // 1.2 para suavizar más
    } else {
        // Color de fondo de la rejilla (negro)
        outputColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
`;

class LensArrayEffectImpl extends Effect {
  constructor({
    gridSize = 50.0,
    curvature = 0.25,
    gridAngle = 0.0,
    shape = 0, // 0: circle, 1: diamond, 2: square
    scale = [1, 1],
    stagger = true,
  } = {}) {
    super("LensArrayEffect", fragmentShader, {
      uniforms: new Map<string, THREE.Uniform<unknown>>([
        ["gridSize", new THREE.Uniform(gridSize)],
        ["curvature", new THREE.Uniform(curvature)],
        ["gridAngle", new THREE.Uniform(gridAngle)],
        ["uShape", new THREE.Uniform(shape)],
        ["uScale", new THREE.Uniform(new THREE.Vector2(scale[0], scale[1]))],
        ["uStagger", new THREE.Uniform(stagger ? 1.0 : 0.0)],
      ]),
    });
  }
}

interface LensArrayEffectProps {
  gridSize?: number;
  curvature?: number;
  gridAngle?: number;
}

export const LensArrayEffect = forwardRef<THREE.Object3D, LensArrayEffectProps>(
  (props, ref) => {
    const effect = useMemo(() => new LensArrayEffectImpl(props), [props]);

    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);
