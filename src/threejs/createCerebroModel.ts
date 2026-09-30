import * as THREE from 'three';
import {attachRuntime, bezierEase} from './keynoteMaterials';

// Semiejes del ovoide cortical (x=fronto-occipital, y=altura, z=bitemporal)
// v2: alargado 1.85 para igualar ilustración cerebro.jpg (2816px, estilo cartoon apaisado)
const A = 1.85;
const B = 1.15;
const C = 1.4;

/**
 * Gyri v2 — observado de cerebro.jpg (raíz, alta-res cartoon):
 * macro: ovoide apaisado frontal-izq redondeado, temporal prominente abajo-centro.
 * meso: gyri anchos con surcos maroon gruesos (no ruido fino fotorrealista).
 * 3 octavas deterministas + prominencia temporal alargada horizontal.
 */
function gyri(x: number, y: number, z: number): number {
  const n1 =
    Math.sin(x * 2.6 + Math.sin(y * 2.0) * 1.9) *
    Math.sin(y * 2.3 + Math.sin(z * 2.8) * 1.5) *
    Math.sin(z * 2.5 + Math.sin(x * 1.9) * 2.1);
  const n2 =
    Math.sin(x * 5.1 + 5.0) * Math.sin(y * 4.6 + 1.2) * Math.sin(z * 5.0 + 3.1);
  const n3 =
    Math.sin(x * 9.4 + 2.2) * Math.sin(y * 8.8 + 4.0) * Math.sin(z * 9.1 + 1.4);
  // lóbulo temporal: bulbo alargado abajo-centro (como la ilustración: banda horizontal)
  const dz = Math.abs(z) - 0.9;
  const temporal =
    0.16 * Math.exp(-((x - 0.1) ** 2 / 0.9 + (y + 0.68) ** 2 / 0.22 + dz * dz / 0.5));
  // domo superior continuo (aplana micro-ruido arriba para curva limpia cartoon)
  const domeMask = 0.6 + 0.4 * Math.tanh((0.5 - y) * 2.0);
  return (0.068 * n1 + 0.03 * n2 + 0.012 * n3) * domeMask + temporal;
}

/** Punto sobre el elipsoide para trazar surcos (lado s=+1/-1). */
function surfPoint(x: number, y: number, s: 1 | -1, lift = 0.0): THREE.Vector3 {
  const k = 1 - (x / A) ** 2 - (y / B) ** 2;
  const z = s * C * Math.sqrt(Math.max(0.02, k));
  const v = new THREE.Vector3(x, y, z);
  // lift: empuja el tubo ligeramente fuera para que asiente como línea cartoon
  const n = v.clone().normalize();
  return v.addScaledVector(n, lift);
}

function displace(
  geo: THREE.BufferGeometry,
  fn: (p: THREE.Vector3) => number,
): {colors: Float32Array; min: number; max: number} {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const colors = new Float32Array(pos.count * 3);
  // v2 palette muestreada de cerebro.jpg: rosa cartoon #E9AAB8 con highlight #F7D0D8
  const cLow = new THREE.Color(0xd98ca0);
  const cMid = new THREE.Color(0xe9aab8);
  const cHigh = new THREE.Color(0xf7d0d8);
  const tmp = new THREE.Color();
  let min = Infinity;
  let max = -Infinity;
  const ds: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const d = fn(v);
    ds.push(d);
    if (d < min) min = d;
    if (d > max) max = d;
  }
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = max > min ? (ds[i] - min) / (max - min) : 0.5;
    v.multiplyScalar(1 + ds[i]);
    pos.setXYZ(i, v.x, v.y, v.z);
    if (t < 0.5) tmp.copy(cLow).lerp(cMid, t * 2);
    else tmp.copy(cMid).lerp(cHigh, (t - 0.5) * 2);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return {colors, min, max};
}

/**
 * Escena 2 — Cerebro lateral v2 (img2threejs, spec: specs/cerebro.spec.json).
 * Ref: cerebro.jpg raíz (2816px, cartoon rosado con outline granate).
 * Mejoras v2 sobre foto vieja de 701px:
 * - paleta cartoon (rosa #E9AAB8 / granate #7A2E4E) en vez de moteado fotorrealista
 * - 9 surcos principales por lado (central + lateral larga + 7 gyri) vs 2 antes
 * - outline toon por inverted-hull (borde grueso como la ilustración)
 * - cerebelo con 7 estrías horizontales como tubos (la ref muestra líneas, no ruido)
 * - proporción alargada A=1.85 y temporal en banda horizontal baja
 * API intacta: mismo root, nodes, sockets, updateFrame.
 */
export function createCerebroModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Cerebro_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 1.6);

  const cortexMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.5,
    metalness: 0,
  });
  // granate de la ilustración para surcos / estrías / tronco-outline
  const sulcusMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x7a2e4e),
    roughness: 0.65,
  });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x7a2e4e),
    side: THREE.BackSide,
  });

  const nodes = ['Cerebro_Root'];

  // hemisferios: mitades de esfera (fisura longitudinal real entre ambas)
  (['L', 'R'] as const).forEach((hemi, hi) => {
    const geo = new THREE.SphereGeometry(1, 128, 80, hi * Math.PI, Math.PI);
    displace(geo, (p) => gyri(p.x, p.y, p.z));
    const m = new THREE.Mesh(geo, cortexMat);
    m.name = `Cerebro_Hemisferio_${hemi}`;
    m.scale.set(A, B, C);
    m.position.z = hemi === 'L' ? 0.02 : -0.02;
    root.add(m);
    nodes.push(m.name);
    // outline toon: cáscara invertida 3.5% mayor
    const outline = new THREE.Mesh(geo, outlineMat);
    outline.name = `Cerebro_Hemisferio_${hemi}_Outline`;
    outline.scale.set(A * 1.035, B * 1.035, C * 1.035);
    outline.position.copy(m.position);
    root.add(outline);
    nodes.push(outline.name);
  });

  // surcos v2: 9 trazos principales por lado (observados en cerebro.jpg)
  const sulciPaths: {pts: [number, number][]; r: number; name: string}[] = [
    {name: 'Central', r: 0.055, pts: [[0.55, 1.0], [0.35, 0.5], [0.12, 0.05], [-0.05, -0.4]]},
    {name: 'Lateral', r: 0.06, pts: [[1.5, -0.32], [0.7, -0.55], [-0.15, -0.62], [-1.0, -0.5]]},
    {name: 'Precentral', r: 0.035, pts: [[0.85, 0.9], [0.68, 0.45], [0.5, 0.0]]},
    {name: 'FrontalSup', r: 0.035, pts: [[1.6, 0.35], [1.1, 0.55], [0.6, 0.7]]},
    {name: 'FrontalMed', r: 0.032, pts: [[1.65, -0.05], [1.15, 0.1], [0.65, 0.2]]},
    {name: 'TemporalSup', r: 0.038, pts: [[1.2, -0.75], [0.4, -0.9], [-0.5, -0.88], [-1.2, -0.7]]},
    {name: 'TemporalInf', r: 0.032, pts: [[1.0, -1.0], [0.2, -1.08], [-0.7, -1.0]]},
    {name: 'Occipital', r: 0.034, pts: [[-1.0, 0.6], [-1.25, 0.1], [-1.35, -0.35]]},
    {name: 'ParietalSup', r: 0.032, pts: [[-0.2, 0.95], [-0.6, 0.75], [-0.95, 0.5]]},
  ];
  ([1, -1] as const).forEach((s) => {
    sulciPaths.forEach((sp) => {
      const pts = sp.pts.map(([x, y]) => surfPoint(x, y, s, -0.015));
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, sp.r, 8, false), sulcusMat);
      tube.name = `Surco_${sp.name}_${s === 1 ? 'L' : 'R'}`;
      root.add(tube);
      nodes.push(tube.name);
    });
  });

  // cerebelo postero-inferior: volumen + 7 estrías horizontales (como la ref)
  const cerebGeo = new THREE.SphereGeometry(1, 64, 40);
  displace(cerebGeo, (p) => 0.012 * Math.sin(p.y * 30) + 0.008 * gyri(p.x * 2, p.y * 2, p.z * 2));
  const cereb = new THREE.Mesh(
    cerebGeo,
    new THREE.MeshStandardMaterial({color: 0xd894a4, roughness: 0.6}),
  );
  cereb.name = 'Cerebelo';
  cereb.scale.set(0.66, 0.5, 0.62);
  cereb.position.set(-1.78, -0.95, 0);
  root.add(cereb);
  nodes.push('Cerebelo');
  const cerebOutline = new THREE.Mesh(cerebGeo, outlineMat);
  cerebOutline.name = 'Cerebelo_Outline';
  cerebOutline.scale.set(0.66 * 1.05, 0.5 * 1.05, 0.62 * 1.05);
  cerebOutline.position.copy(cereb.position);
  root.add(cerebOutline);
  nodes.push('Cerebelo_Outline');
  // estrías del cerebelo: arcos horizontales empotrados
  for (let i = 0; i < 7; i++) {
    const yy = -0.75 - i * 0.11;
    const xx = -1.78 + Math.sin(i * 0.9) * 0.08;
    const pts = [
      new THREE.Vector3(xx - 0.45, yy, 0.42),
      new THREE.Vector3(xx, yy - 0.04, 0.58),
      new THREE.Vector3(xx + 0.45, yy, 0.42),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const stria = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.018, 6, false), sulcusMat);
    stria.name = `Cerebelo_Estria_${i}`;
    // hereda posición del cerebelo relativa al root
    stria.position.set(0, -0.18, -0.05);
    root.add(stria);
    nodes.push(stria.name);
  }

  // tronco encefálico: cono corto + outline
  const troncoGeo = new THREE.CylinderGeometry(0.12, 0.19, 0.62, 20);
  const tronco = new THREE.Mesh(
    troncoGeo,
    new THREE.MeshStandardMaterial({color: 0xde97a6, roughness: 0.6}),
  );
  tronco.name = 'Tronco';
  tronco.position.set(-1.6, -1.52, 0);
  tronco.rotation.z = 0.3;
  root.add(tronco);
  nodes.push('Tronco');
  const troncoOutline = new THREE.Mesh(troncoGeo, outlineMat);
  troncoOutline.name = 'Tronco_Outline';
  troncoOutline.scale.set(1.12, 1.04, 1.12);
  troncoOutline.position.copy(tronco.position);
  troncoOutline.rotation.copy(tronco.rotation);
  root.add(troncoOutline);
  nodes.push('Tronco_Outline');

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    const breath = 1 + 0.015 * Math.sin(t * Math.PI * 2);
    root.scale.set(breath, breath, breath);
    root.rotation.y = 0.3 * Math.sin(t * Math.PI * 2 - Math.PI / 2) + 0.3;
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {nodes, sockets: ['cerebro.respiracion'], spec: 'specs/cerebro.spec.json'},
    tick,
    updateFrame,
  );
  return root;
}
