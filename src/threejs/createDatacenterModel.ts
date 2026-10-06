import * as THREE from 'three';
import {
  attachRuntime,
  bezierEase,
  makeCanvasTexture,
  makeLight,
  makeMetalDark,
  seededRandom,
} from './keynoteMaterials';

/** Frontal de rack con LEDs (arte procedural). */
function rackTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#12161d';
    ctx.fillRect(0, 0, w, h);
    const rnd = seededRandom(21);
    for (let r = 0; r < 8; r++) {
      const y = 18 + r * 60;
      ctx.fillStyle = '#1d232e';
      ctx.fillRect(14, y, w - 28, 44);
      for (let i = 0; i < 6; i++) {
        const on = rnd() > 0.35;
        ctx.fillStyle = on ? (i % 3 === 0 ? '#35e0a1' : '#3f8cff') : '#2a323f';
        ctx.beginPath();
        ctx.arc(30 + i * 34, y + 22, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#39424f';
      ctx.fillRect(14, y + 36, w - 28, 4);
    }
  });
}

function docTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0b63e5';
    ctx.fillRect(0, 0, w, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('INFORME · NORTHWIND', 24, 56);
    ctx.fillStyle = '#9aa3b2';
    for (let i = 0; i < 14; i++) {
      const y = 130 + i * 36;
      const len = i % 4 === 3 ? 0.55 : 0.9;
      ctx.fillRect(24, y, (w - 48) * len, 12);
    }
    ctx.fillStyle = 'rgba(11,99,229,0.14)';
    ctx.fillRect(18, 130 + 5 * 36 - 10, w - 36, 3 * 36);
    ctx.strokeStyle = '#0b63e5';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 130 + 5 * 36 - 10, w - 36, 3 * 36);
  });
}

/**
 * Escena S02-B3 — Datacenter Google Docs (img2threejs, spec: specs/datacenter.spec.json).
 * 3 racks con LEDs + hoja Doc flotante al frente (informe) + arco de
 * sincronización con partículas (comunicación). Sin piso.
 * Vuelta completa 360° en plano horizontal (como la GPU del tráiler 1).
 * Bonus S02: el agente escribe el informe en Drive. LIGHT sobre #F2F5FA.
 */
export function createDatacenterModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Datacenter_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0.6);
  const nodes = ['Datacenter_Root'];

  const metal = makeMetalDark();
  const glowBlue = makeLight([0.25, 0.6, 1.0], 2.6);
  const glowGreen = makeLight([0.2, 0.9, 0.6], 2.2);

  // 3 racks (sin piso: solo datacenter + hoja + comunicación)
  const tex = rackTexture();
  const leds: THREE.Mesh[] = [];
  [-2.6, 0, 2.6].forEach((x, ri) => {
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, 1.2), metal);
    rack.name = `Rack_${ri}`;
    rack.position.set(x, 0, -1.2);
    root.add(rack);
    nodes.push(rack.name);
    const front = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 2.8),
      new THREE.MeshStandardMaterial({map: tex, roughness: 0.6}),
    );
    front.name = `Rack_${ri}_Front`;
    front.position.set(x, 0, -0.58);
    root.add(front);
    nodes.push(front.name);
    // luz superior del rack
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), ri === 1 ? glowBlue : glowGreen);
    bar.name = `Rack_${ri}_Bar`;
    bar.position.set(x, 1.62, -0.6);
    root.add(bar);
    nodes.push(bar.name);
    leds.push(bar);
  });

  // hoja Doc flotante (el informe que escribe el agente)
  const doc = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 2.1),
    new THREE.MeshStandardMaterial({map: docTexture(), roughness: 0.75, side: THREE.DoubleSide}),
  );
  doc.name = 'Doc_Informe';
  doc.position.set(0, 1.3, 1.6);
  root.add(doc);
  nodes.push('Doc_Informe');

  // arco de sincronización rack → doc (tubo curvo emisivo)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.7, -0.6),
    new THREE.Vector3(-0.8, 2.4, 0.6),
    new THREE.Vector3(0, 1.9, 1.55),
  ]);
  const sync = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.035, 8, false), glowBlue);
  sync.name = 'DC_Sync';
  root.add(sync);
  nodes.push('DC_Sync');

  // partículas subiendo (sync Drive)
  const rnd = seededRandom(7);
  const dotGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const parts: {mesh: THREE.Mesh; off: number; speed: number}[] = [];
  for (let i = 0; i < 30; i++) {
    const mesh = new THREE.Mesh(dotGeo, i % 2 === 0 ? glowBlue : glowGreen);
    mesh.name = `SyncDot_${String(i).padStart(2, '0')}`;
    root.add(mesh);
    nodes.push(mesh.name);
    parts.push({mesh, off: rnd(), speed: 0.25 + rnd() * 0.5});
  }

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    // vuelta completa 360° en plano horizontal (eje Y), como la GPU del tráiler 1
    root.rotation.y = t * Math.PI * 2;
    doc.position.y = 1.3 + 0.16 * Math.sin(t * Math.PI * 4);
    doc.rotation.y = 0.25 * Math.sin(t * Math.PI * 2);
    leds.forEach((b, i) => {
      const m = b.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 2.2 + 1.2 * Math.sin(t * Math.PI * 6 + i * 2.0);
    });
    for (const p of parts) {
      const k = (t * p.speed + p.off) % 1;
      const pos = curve.getPoint(k);
      p.mesh.position.copy(pos);
    }
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {nodes, sockets: ['docs.informe', 'drive.sync'], spec: 'specs/datacenter.spec.json'},
    tick,
    updateFrame,
  );
  return root;
}
