import * as THREE from 'three';
import {attachRuntime, bezierEase, makeCanvasTexture} from './keynoteMaterials';

/** Página con encabezado + líneas de texto (arte procedural, sin assets). */
function pageTexture(heading: string, accent: string): THREE.CanvasTexture {
  return makeCanvasTexture(720, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#f7f2e3';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#16305c';
    ctx.font = '900 64px Georgia, serif';
    ctx.textAlign = 'left';
    const words = heading.split(' ');
    words.forEach((word, i) => {
      ctx.fillText(word, 70, 130 + i * 78);
    });
    ctx.fillStyle = accent;
    ctx.fillRect(70, 130 + words.length * 78 + 10, 220, 12);
    // líneas de texto
    ctx.fillStyle = '#9aa3b2';
    const top = 130 + words.length * 78 + 80;
    for (let i = 0; i < 22; i++) {
      const y = top + i * 34;
      if (y > h - 60) break;
      const len = i % 5 === 4 ? 0.55 : 0.92;
      ctx.fillRect(70, y, (w - 140) * len, 12);
    }
    // bloque destacado
    ctx.fillStyle = 'rgba(46,155,255,0.16)';
    ctx.fillRect(60, top + 6 * 34 - 12, w - 120, 3 * 34 + 8);
    ctx.strokeStyle = '#2e9bff';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, top + 6 * 34 - 12, w - 120, 3 * 34 + 8);
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
 * Escena 4 — Libro abierto (img2threejs, spec: specs/libro.spec.json).
 * Tapas azul profundo + lomo + bloques de páginas crema con texto procedural
 * + marcapáginas rojo. Metáfora de contexto ilimitado: el conocimiento abierto.
 * Reemplaza createHubModel (toro + módulos) en el bloque MCP/RAG.
 */
export function createLibroModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Libro_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0.4, 0);
  const nodes = ['Libro_Root'];

  const coverMat = new THREE.MeshStandardMaterial({color: 0x16305c, roughness: 0.45, metalness: 0.15});
  const pageMat = new THREE.MeshStandardMaterial({color: 0xf1e9d4, roughness: 0.9, metalness: 0});
  const spineMat = new THREE.MeshStandardMaterial({color: 0x0e2040, roughness: 0.5, metalness: 0.1});
  const ribbonMat = new THREE.MeshStandardMaterial({color: 0xd64545, roughness: 0.6});

  // tapas (ligeramente caídas hacia afuera)
  const tapaL = box(3.2, 0.1, 4.5, coverMat, -1.6, -0.02, 0, 'Tapa_Izq');
  tapaL.rotation.z = 0.09;
  const tapaR = box(3.2, 0.1, 4.5, coverMat, 1.6, -0.02, 0, 'Tapa_Der');
  tapaR.rotation.z = -0.09;
  root.add(tapaL, tapaR);
  nodes.push('Tapa_Izq', 'Tapa_Der');

  // lomo
  const spineGeo = new THREE.CylinderGeometry(0.16, 0.16, 4.5, 16);
  const spine = new THREE.Mesh(spineGeo, spineMat);
  spine.name = 'Lomo';
  spine.rotation.x = Math.PI / 2;
  spine.position.set(0, -0.05, 0);
  root.add(spine);
  nodes.push('Lomo');

  // bloques de páginas
  const pagL = box(2.9, 0.3, 4.2, pageMat, -1.5, 0.18, 0, 'Paginas_Izq');
  const pagR = box(2.9, 0.3, 4.2, pageMat, 1.5, 0.18, 0, 'Paginas_Der');
  root.add(pagL, pagR);
  nodes.push('Paginas_Izq', 'Paginas_Der');

  // páginas superiores con texto
  const texL = pageTexture('SIN LÍMITES', '#2e9bff');
  const texR = pageTexture('CONTEXTO TOTAL', '#5b4fd6');
  const hojaGeo = new THREE.PlaneGeometry(2.9, 4.2);
  const hojaL = new THREE.Mesh(
    hojaGeo,
    new THREE.MeshStandardMaterial({map: texL, roughness: 0.9}),
  );
  hojaL.name = 'Hoja_Izq';
  hojaL.rotation.x = -Math.PI / 2;
  hojaL.position.set(-1.5, 0.335, 0);
  const hojaR = new THREE.Mesh(
    hojaGeo,
    new THREE.MeshStandardMaterial({map: texR, roughness: 0.9}),
  );
  hojaR.name = 'Hoja_Der';
  hojaR.rotation.x = -Math.PI / 2;
  hojaR.position.set(1.5, 0.335, 0);
  root.add(hojaL, hojaR);
  nodes.push('Hoja_Izq', 'Hoja_Der');

  // marcapáginas rojo (sale por el frente)
  const ribbon = box(0.35, 0.02, 1.4, ribbonMat, 1.2, 0.345, 2.4, 'Marcapaginas');
  root.add(ribbon);
  nodes.push('Marcapaginas');

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    const breath = 1 + 0.012 * Math.sin(t * Math.PI * 2);
    root.scale.set(breath, breath, breath);
    root.rotation.y = 0.22 * Math.sin(t * Math.PI * 2 - Math.PI / 2);
    root.position.y = 0.4 + 0.08 * Math.sin(t * Math.PI * 2);
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {nodes, sockets: ['libro.apertura'], spec: 'specs/libro.spec.json'},
    tick,
    updateFrame,
  );
  return root;
}
