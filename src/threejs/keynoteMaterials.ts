import * as THREE from 'three';

/**
 * Materiales Keynote compartidos (img2threejs, code-only).
 * Réplica PBR de make_mat_* de blender/sesion-01/render_trailer.py,
 * pero nítida: sin samples de EEVEE/Cycles ni compresión H.264.
 */

export function makeMetalDark(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.08, 0.11, 0.16),
    metalness: 1.0,
    roughness: 0.28,
  });
}

export function makeCrystal(opacity = 0.32): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.75, 0.88, 1.0),
    metalness: 0,
    roughness: 0.05,
    ior: 1.45,
    transparent: true,
    opacity,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
}

export function makeLight(
  color: [number, number, number] = [0.3, 0.75, 1.0],
  strength = 6.0,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0, 0, 0),
    emissive: new THREE.Color(...color),
    emissiveIntensity: strength,
    roughness: 0.4,
    metalness: 0,
  });
}

/** PRNG determinista (mulberry32) — misma distribución en cada render. */
export function seededRandom(seed = 7): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SculptRuntime = {
  nodes: string[];
  sockets: string[];
  spec: string;
};

/** Easing Bezier suave equivalente a set_bezier() de Blender. */
export function bezierEase(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

/** Canvas texture generada (img2threejs: arte procedural, sin assets externos). */
export function makeCanvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('sin contexto 2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function attachRuntime(
  group: THREE.Group,
  runtime: SculptRuntime,
  tick: (dt: number, elapsed: number) => void,
  updateFrame: (frame: number, fps: number, durationInFrames: number) => void,
): void {
  group.userData.sculptRuntime = runtime;
  group.userData.tick = tick;
  group.userData.updateFrame = updateFrame;
}
