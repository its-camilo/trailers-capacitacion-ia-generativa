import * as THREE from 'three';
import {
  attachRuntime,
  bezierEase,
  makeCanvasTexture,
  makeLight,
  makeMetalDark,
} from './keynoteMaterials';

/** Etiqueta de tabla Northwind (arte procedural, sin assets). */
function tableTexture(title: string, rows: string[], accent: string): THREE.CanvasTexture {
  return makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, w, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 30px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, 20, 42);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 64, w, 6);
    ctx.font = '400 24px monospace';
    ctx.fillStyle = '#33415c';
    rows.forEach((r, i) => {
      ctx.fillText(r, 20, 110 + i * 38);
    });
    ctx.strokeStyle = '#0b63e5';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);
  });
}

/**
 * Escena S02-B2 — Base de datos Northwind (img2threejs, spec: specs/database.spec.json).
 * Cilindro clásico de 3 discos (SQLite local) + 3 tablas flotantes
 * (Customers · Orders · Products) + vuelta completa 360° en plano
 * horizontal (como la GPU del tráiler 1). Sin partículas.
 * LIGHT: acero + azul emisivo sobre #F2F5FA.
 */
export function createDatabaseModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Database_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 1.0);
  const nodes = ['Database_Root'];

  const steel = new THREE.MeshStandardMaterial({color: 0xc9d4e3, roughness: 0.3, metalness: 0.9});
  const steelDark = makeMetalDark();
  const glowBlue = makeLight([0.2, 0.55, 1.0], 3.0);

  // cilindro DB: 3 discos apilados
  for (let i = 0; i < 3; i++) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.55, 48), steel);
    disc.name = `DB_Disco_${i}`;
    disc.position.set(0, -0.6 + i * 0.62, 0);
    root.add(disc);
    nodes.push(disc.name);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.06, 10, 48), i === 2 ? glowBlue : steelDark);
    rim.name = `DB_Rim_${i}`;
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, -0.32 + i * 0.62, 0);
    root.add(rim);
    nodes.push(rim.name);
  }
  // elipse superior emisiva (boca de la DB)
  const mouth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 0.06, 48),
    new THREE.MeshStandardMaterial({color: 0x0b63e5, emissive: new THREE.Color(0.15, 0.45, 1.0), emissiveIntensity: 2.2, roughness: 0.4}),
  );
  mouth.name = 'DB_Mouth';
  mouth.position.set(0, 1.0, 0);
  root.add(mouth);
  nodes.push('DB_Mouth');

  // tablas Northwind flotantes
  const tables: THREE.Mesh[] = [];
  const defs = [
    {title: 'Customers', rows: ['ALFKI · Berlín', 'ANATR · México', 'ANTON · México'], accent: '#0b63e5', x: -3.1},
    {title: 'Orders', rows: ['10248 · 07/04', '10249 · 07/05', '10250 · 07/08'], accent: '#5b4fd6', x: 0},
    {title: 'Products', rows: ['Chai · 18.00', 'Chang · 19.00', 'Aniseed · 10'], accent: '#15a3a3', x: 3.1},
  ];
  defs.forEach((d, i) => {
    const tex = tableTexture(d.title, d.rows, d.accent);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.2),
      new THREE.MeshStandardMaterial({map: tex, roughness: 0.7, side: THREE.DoubleSide}),
    );
    m.name = `Tabla_${d.title}`;
    m.position.set(d.x, 2.1, -0.6);
    m.rotation.y = d.x * -0.12;
    root.add(m);
    tables.push(m);
    nodes.push(m.name);
    void i;
  });

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    // vuelta completa 360° en plano horizontal (eje Y), como la GPU del tráiler 1
    root.rotation.y = t * Math.PI * 2;
    tables.forEach((m, i) => {
      m.position.y = 2.1 + 0.14 * Math.sin(t * Math.PI * 4 + i * 2.1);
    });
    mouth.position.y = 1.0 + 0.03 * Math.sin(t * Math.PI * 6);
    void frame;
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {nodes, sockets: ['db.northwind', 'db.query'], spec: 'specs/database.spec.json'},
    tick,
    updateFrame,
  );
  return root;
}
