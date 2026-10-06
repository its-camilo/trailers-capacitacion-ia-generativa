import * as THREE from 'three';
import {
  attachRuntime,
  bezierEase,
  makeCanvasTexture,
} from './keynoteMaterials';

const CARD_W = 6.4;
const CARD_H = 2.6;

/** Sticker del hub: rayas + texto neutro (genérico, no marca). */
function stickerTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#101216';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 5;
    for (let i = -h; i < w; i += 18) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
    ctx.fillStyle = '#101216';
    ctx.fillRect(28, 92, 200, 72);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI·GPU', w / 2, 142);
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
 * Escena 3 — GPU doble ventilador (img2threejs, spec: specs/gpu.spec.json).
 * PCB + shroud facetado + 2 fans de 9 aspas contrarrotantes + disipador
 * de aletas + peine PCIe dorado + bracket + LED.
 * Reemplaza createAtencionModel (matrices abstractas).
 */
export function createGpuModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Gpu_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 1.6);
  const nodes = ['Gpu_Root'];

  const shroudMat = new THREE.MeshStandardMaterial({color: 0x15181d, roughness: 0.5, metalness: 0.3});
  const pcbMat = new THREE.MeshStandardMaterial({color: 0x101418, roughness: 0.6, metalness: 0.2});
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x23262b, roughness: 0.35, transparent: true, opacity: 0.92,
  });
  const silverMat = new THREE.MeshStandardMaterial({color: 0xc9cfd6, roughness: 0.35, metalness: 1.0});
  const goldMat = new THREE.MeshStandardMaterial({color: 0xd8a93b, roughness: 0.3, metalness: 1.0});
  const steelMat = new THREE.MeshStandardMaterial({color: 0x9aa0a8, roughness: 0.4, metalness: 1.0});
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x000000, emissive: new THREE.Color(0.18, 0.61, 1.0), emissiveIntensity: 4.0,
  });

  // PCB + shroud facetado
  const pcb = box(CARD_W, CARD_H, 0.12, pcbMat, 0, 0, -0.22, 'PCB');
  root.add(pcb);
  nodes.push('PCB');
  const frame: [number, number, number, number, number, number, string][] = [
    [CARD_W, 0.5, 0.5, 0, CARD_H / 2 - 0.25, 0, 'Shroud_Top'],
    [CARD_W, 0.42, 0.5, 0, -CARD_H / 2 + 0.21, 0, 'Shroud_Bottom'],
    [0.42, CARD_H, 0.5, -CARD_W / 2 + 0.21, 0, 0, 'Shroud_Left'],
    [0.5, CARD_H, 0.5, CARD_W / 2 - 0.25, 0, 0, 'Shroud_Right'],
  ];
  for (const [w, h, d, x, y, z, n] of frame) {
    const m = box(w, h, d, shroudMat, x, y, z, n);
    root.add(m);
    nodes.push(n);
  }
  // cuñas diagonales del shroud (facetas angulares de la referencia)
  const wedgeL = box(2.2, 0.34, 0.52, shroudMat, -1.55, 1.02, 0, 'Shroud_Wedge_L');
  wedgeL.rotation.z = 0.38;
  const wedgeR = box(2.2, 0.34, 0.52, shroudMat, 1.55, -1.02, 0, 'Shroud_Wedge_R');
  wedgeR.rotation.z = 0.38;
  root.add(wedgeL, wedgeR);
  nodes.push('Shroud_Wedge_L', 'Shroud_Wedge_R');

  // tira LED superior
  const led = box(4.6, 0.07, 0.07, ledMat, 0, CARD_H / 2 + 0.02, 0.1, 'LedStrip');
  root.add(led);
  nodes.push('LedStrip');

  // disipador: 2 bloques x 28 aletas plateadas tras los fans
  const finGeo = new THREE.BoxGeometry(0.035, 1.9, 0.42);
  const fins = new THREE.InstancedMesh(finGeo, silverMat, 56);
  fins.name = 'Heatsink_Fins';
  {
    const dummy = new THREE.Object3D();
    let k = 0;
    for (const cx of [-1.55, 1.55]) {
      for (let i = 0; i < 28; i++) {
        dummy.position.set(cx - 0.95 + i * 0.07, 0, -0.05);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        fins.setMatrixAt(k++, dummy.matrix);
      }
    }
  }
  root.add(fins);
  nodes.push('Heatsink_Fins');

  // ventiladores
  const sticker = stickerTexture();
  const spinners: THREE.Group[] = [];
  const bladeGeo = new THREE.BoxGeometry(0.33, 0.32, 0.05);
  bladeGeo.translate(0.18, 0, 0);
  ([
    {x: -1.55, n: 'Fan_L'},
    {x: 1.55, n: 'Fan_R'},
  ] as const).forEach(({x, n}) => {
    const fan = new THREE.Group();
    fan.name = n;
    fan.position.set(x, 0, 0.22);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.09, 12, 48), shroudMat);
    ring.name = `${n}_Ring`;
    fan.add(ring);
    const spinner = new THREE.Group();
    spinner.name = `${n}_Rotor`;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 24), shroudMat);
    hub.rotation.x = Math.PI / 2;
    hub.name = `${n}_Hub`;
    spinner.add(hub);
    const cap = new THREE.Mesh(
      new THREE.CircleGeometry(0.36, 24),
      new THREE.MeshStandardMaterial({map: sticker, roughness: 0.4}),
    );
    cap.position.z = 0.16;
    cap.name = `${n}_Sticker`;
    spinner.add(cap);
    const blades = new THREE.InstancedMesh(bladeGeo, bladeMat, 9);
    blades.name = `${n}_Blades`;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 9; i++) {
      dummy.position.set(Math.cos((i / 9) * Math.PI * 2) * 0.62, Math.sin((i / 9) * Math.PI * 2) * 0.62, 0);
      dummy.rotation.set(0, 0.6, (i / 9) * Math.PI * 2);
      dummy.updateMatrix();
      blades.setMatrixAt(i, dummy.matrix);
    }
    spinner.add(blades);
    fan.add(spinner);
    root.add(fan);
    spinners.push(spinner);
    nodes.push(n, `${n}_Rotor`, `${n}_Blades`);
  });

  // peine PCIe dorado + bracket + tornillos
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.045, 0.3, 0.1), goldMat, 36);
  pins.name = 'PCIe_Pins';
  {
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 36; i++) {
      dummy.position.set(-1.35 + i * 0.077, -CARD_H / 2 - 0.12, -0.22);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pins.setMatrixAt(i, dummy.matrix);
    }
  }
  root.add(pins);
  nodes.push('PCIe_Pins');
  const bracket = box(0.12, CARD_H + 0.3, 0.9, steelMat, -CARD_W / 2 - 0.35, 0, -0.1, 'Bracket');
  root.add(bracket);
  nodes.push('Bracket');
  for (let i = 0; i < 3; i++) {
    const slit = box(0.13, 0.5, 0.2, pcbMat, -CARD_W / 2 - 0.35, 0.7 - i * 0.7, -0.1, `Bracket_Slit_${i}`);
    root.add(slit);
  }
  const screwGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12);
  const screws = new THREE.InstancedMesh(screwGeo, steelMat, 6);
  screws.name = 'Shroud_Screws';
  {
    const dummy = new THREE.Object3D();
    const pts: [number, number][] = [
      [-2.9, 1.0], [2.9, 1.0], [-2.9, -1.0], [2.9, -1.0], [0, 1.0], [0, -1.0],
    ];
    pts.forEach(([x, y], i) => {
      dummy.position.set(x, y, 0.26);
      dummy.rotation.set(Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      screws.setMatrixAt(i, dummy.matrix);
    });
  }
  root.add(screws);
  nodes.push('Shroud_Screws');

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    // fans contrarrotantes, velocidad constante determinista por frame
    spinners[0].rotation.z = frame * 0.28;
    spinners[1].rotation.z = -frame * 0.28;
    // vuelta completa 360° durante el bloque
    root.rotation.y = t * Math.PI * 2;
    root.position.y = 0.1 * Math.sin(t * Math.PI * 3);
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {nodes, sockets: ['fan_L.spin', 'fan_R.spin'], spec: 'specs/gpu.spec.json'},
    tick,
    updateFrame,
  );
  return root;
}
