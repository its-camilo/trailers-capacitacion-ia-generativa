import * as THREE from 'three';
import {
  attachRuntime,
  bezierEase,
  makeCanvasTexture,
  seededRandom,
} from './keynoteMaterials';

// NOTA: mundo Y-up (y=altura). Base apoyada en y=0, pantalla al fondo (-Z).

const BASE_W = 6.4;
const BASE_D = 4.2;
const BASE_T = 0.22;
const BASE_Z = 0.3; // centro: z en [-1.8, 2.4], pantalla en z=-1.8

/** Pantalla del portátil: editor oscuro con prompt (arte procedural, sin assets). */
function screenTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(1024, 640, (ctx, w, h) => {
    const rnd = seededRandom(11);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);
    // barra superior
    ctx.fillStyle = '#111a2e';
    ctx.fillRect(0, 0, w, 56);
    ['#e86a92', '#f2c14e', '#7ee2a8'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(36 + i * 32, 28, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#5b8def';
    ctx.font = '700 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('harness — agent.py', w / 2, 37);
    // sidebar
    ctx.fillStyle = '#0e1626';
    ctx.fillRect(0, 56, 170, h - 56);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i === 2 ? '#1d2f52' : '#16223a';
      ctx.fillRect(14, 84 + i * 44, 142, 28);
    }
    // líneas de código (barras deterministas)
    const palette = ['#5b8def', '#7ee2a8', '#b388ff', '#f2c14e', '#e86a92', '#8fa3c8'];
    for (let i = 0; i < 12; i++) {
      const y = 100 + i * 36;
      const indent = 210 + Math.floor(rnd() * 4) * 42;
      const len = 180 + rnd() * 420;
      ctx.fillStyle = palette[Math.floor(rnd() * palette.length)];
      ctx.globalAlpha = 0.85;
      const ww = Math.min(len, w - indent - 40);
      ctx.fillRect(indent, y, ww, 16);
    }
    ctx.globalAlpha = 1;
    // caja del prompt
    ctx.fillStyle = '#12233d';
    ctx.strokeStyle = '#2e9bff';
    ctx.lineWidth = 3;
    const px = 210;
    const py = h - 150;
    const pw = w - px - 40;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, 96, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('> genera el tráiler de fundamentos…', px + 24, py + 58);
  });
}

function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  name: string,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  m.position.set(x, y, z);
  return m;
}

/**
 * Escena 2 — Portátil de agente (img2threejs, spec: specs/portatil.spec.json).
 * Chasis aluminio + teclado instanciado 5x14 + trackpad + bisagra +
 * pantalla con editor procedural + webcam + logo emisivo + cursor parpadeante.
 * Reemplaza createCerebroModel: el agente se muestra como herramienta de trabajo.
 */
export function createPortatilModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Portatil_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  const nodes = ['Portatil_Root'];

  const aluMat = new THREE.MeshStandardMaterial({color: 0xc9cfd6, roughness: 0.35, metalness: 0.9});
  const darkMat = new THREE.MeshStandardMaterial({color: 0x1a1e26, roughness: 0.5, metalness: 0.2});
  const blackMat = new THREE.MeshStandardMaterial({color: 0x0a0c10, roughness: 0.45, metalness: 0.3});
  const padMat = new THREE.MeshStandardMaterial({color: 0xb9c1ca, roughness: 0.4, metalness: 0.85});
  const logoMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: new THREE.Color(0.18, 0.61, 1.0),
    emissiveIntensity: 3.0,
    roughness: 0.4,
  });

  // base (cara superior en y=0)
  const base = box(BASE_W, BASE_T, BASE_D, aluMat, 0, -BASE_T / 2, BASE_Z, 'Base');
  root.add(base);
  nodes.push('Base');

  // teclado 5x14 instanciado (filas hacia el fondo, -Z)
  const keyGeo = new THREE.BoxGeometry(0.36, 0.09, 0.36);
  const keys = new THREE.InstancedMesh(keyGeo, darkMat, 70);
  keys.name = 'Teclado';
  const dummy = new THREE.Object3D();
  let ki = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 14; c++) {
      dummy.position.set(-2.86 + c * 0.44, 0.045, -1.15 + r * 0.44);
      dummy.updateMatrix();
      keys.setMatrixAt(ki++, dummy.matrix);
    }
  }
  keys.instanceMatrix.needsUpdate = true;
  root.add(keys);
  nodes.push('Teclado');

  // spacebar
  const space = box(2.6, 0.09, 0.36, darkMat, -0.4, 0.045, 1.13, 'Spacebar');
  root.add(space);
  nodes.push('Spacebar');

  // trackpad
  const pad = box(1.9, 0.03, 1.15, padMat, 0, 0.015, 1.75, 'Trackpad');
  root.add(pad);
  nodes.push('Trackpad');

  // patas + puertos
  const footGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12);
  [[-2.9, -1.5], [2.9, -1.5], [-2.9, 2.1], [2.9, 2.1]].forEach(([x, z], i) => {
    const f = new THREE.Mesh(footGeo, blackMat);
    f.name = `Pata_${i}`;
    f.position.set(x, -BASE_T - 0.03, z);
    root.add(f);
    nodes.push(f.name);
  });
  const portL = box(0.06, 0.1, 0.7, blackMat, -BASE_W / 2 - 0.01, -0.1, 1.2, 'Puerto_L');
  const portR = box(0.06, 0.1, 0.7, blackMat, BASE_W / 2 + 0.01, -0.1, 1.2, 'Puerto_R');
  root.add(portL, portR);
  nodes.push('Puerto_L', 'Puerto_R');

  // bisagra (eje X, al fondo)
  const hingeGeo = new THREE.CylinderGeometry(0.14, 0.14, 5.4, 16);
  const hinge = new THREE.Mesh(hingeGeo, darkMat);
  hinge.name = 'Bisagra';
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.1, -1.82);
  root.add(hinge);
  nodes.push('Bisagra');

  // pantalla (vertical, inclinada ~12° hacia atrás)
  const screen = new THREE.Group();
  screen.name = 'Pantalla';
  screen.position.set(0, 0.15, -1.85);
  screen.rotation.x = -0.21;
  root.add(screen);
  nodes.push('Pantalla');

  const lid = box(6.4, 4.3, 0.16, aluMat, 0, 2.15, 0, 'Pantalla_Lid');
  screen.add(lid);
  nodes.push('Pantalla_Lid');
  const bezel = box(6.1, 3.95, 0.04, blackMat, 0, 2.2, 0.075, 'Pantalla_Marco');
  screen.add(bezel);
  nodes.push('Pantalla_Marco');

  const displayMat = new THREE.MeshBasicMaterial({map: screenTexture()});
  const display = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 3.7), displayMat);
  display.name = 'Pantalla_Display';
  display.position.set(0, 2.22, 0.1);
  screen.add(display);
  nodes.push('Pantalla_Display');

  // webcam + logo + cursor
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), blackMat);
  cam.name = 'Webcam';
  cam.position.set(0, 4.02, 0.1);
  screen.add(cam);
  nodes.push('Webcam');
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.34, 32), logoMat);
  logo.name = 'Logo';
  logo.rotation.y = Math.PI;
  logo.position.set(0, 2.45, -0.095);
  screen.add(logo);
  nodes.push('Logo');

  const cursorMat = new THREE.MeshBasicMaterial({color: 0x2e9bff, transparent: true, opacity: 1});
  const cursor = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.3), cursorMat);
  cursor.name = 'Cursor';
  cursor.position.set(2.2, 0.94, 0.115);
  screen.add(cursor);
  nodes.push('Cursor');

  // resplandor de pantalla
  const glow = new THREE.PointLight(0x86b8ff, 26, 13);
  glow.name = 'Luz_Pantalla';
  glow.position.set(0, 2.2, 1.8);
  screen.add(glow);
  nodes.push('Luz_Pantalla');

  const updateFrame = (_frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : _frame / (dur - 1));
    const breath = 1 + 0.012 * Math.sin(t * Math.PI * 2);
    root.scale.set(breath, breath, breath);
    root.rotation.y = 0.28 * Math.sin(t * Math.PI * 2 - Math.PI / 2);
    root.position.y = 0.06 * Math.sin(t * Math.PI * 2);
    cursorMat.opacity = 1;
    glow.intensity = 26;
    logoMat.emissiveIntensity = 3.0;
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {nodes, sockets: ['portatil.tecleo', 'pantalla.pulso'], spec: 'specs/portatil.spec.json'},
    tick,
    updateFrame,
  );
  return root;
}
