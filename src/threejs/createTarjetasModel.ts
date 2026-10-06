import * as THREE from 'three';
import {
  attachRuntime,
  bezierEase,
  makeCanvasTexture,
  seededRandom,
} from './keynoteMaterials';

const W = 7.375;
const H = 3.25;
const T = 0.02;
const COLS = 80;
const ROWS = 12;

/** Tarjeta con corte diagonal sup-izq (identidad IBM) y resto redondeado. */
function cardOutline(): THREE.Shape {
  const s = new THREE.Shape();
  const x0 = -W / 2;
  const x1 = W / 2;
  const y0 = -H / 2;
  const y1 = H / 2;
  const r = 0.12;
  const c = 0.5;
  s.moveTo(x0 + c, y1);
  s.lineTo(x1 - r, y1);
  s.quadraticCurveTo(x1, y1, x1, y1 - r);
  s.lineTo(x1, y0 + r);
  s.quadraticCurveTo(x1, y0, x1 - r, y0);
  s.lineTo(x0 + r, y0);
  s.quadraticCurveTo(x0, y0, x0, y0 + r);
  s.lineTo(x0, y1 - c);
  s.lineTo(x0 + c, y1);
  return s;
}

function slotHole(cx: number, cy: number, w: number, h: number): THREE.Path {
  const p = new THREE.Path();
  const r = Math.min(w, h) * 0.35;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  p.moveTo(x0 + r, y0);
  p.lineTo(x0 + w - r, y0);
  p.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  p.lineTo(x0 + w, y0 + h - r);
  p.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  p.lineTo(x0 + r, y0 + h);
  p.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  p.lineTo(x0, y0 + r);
  p.quadraticCurveTo(x0, y0, x0 + r, y0);
  return p;
}

/** Impresión estilo IBM: cabeceras, números de columna, checkboxes, recuadros, pie. */
function printTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(2048, 904, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    const ink = '#4a3a26';
    const faint = '#7a6748';
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 3;
    const sx = w / W;
    const sy = h / H;
    const X = (x: number) => (x + W / 2) * sx;
    const Y = (y: number) => (H / 2 - y) * sy;
    // banda de cabecera
    ctx.strokeRect(X(-3.55), Y(1.5), 7.1 * sx, 0.42 * sy);
    ctx.font = `700 ${Math.round(0.16 * sy)}px Arial`;
    ctx.fillText('A U T O R', X(-3.45), Y(1.32));
    ctx.fillText('T I T U L O', X(-1.6), Y(1.32));
    ctx.fillText('No.', X(1.4), Y(1.32));
    ctx.fillText('Fecha', X(2.5), Y(1.32));
    // números de columna cada 10
    ctx.font = `${Math.round(0.09 * sy)}px Arial`;
    ctx.fillStyle = faint;
    for (let c = 0; c < 80; c += 10) {
      ctx.fillText(String(c + 1), X(-3.35 + c * 0.0848), Y(1.02));
    }
    // checkboxes centrales con etiquetas
    ctx.fillStyle = ink;
    ctx.font = `${Math.round(0.11 * sy)}px Arial`;
    const labels = ['AGOTADO', 'REIMPRESION', 'RESERVA', 'PEDIDO', 'CATALOGO', 'PRESTAMO', 'DEVOLUCION', 'ARCHIVO'];
    labels.forEach((label, i) => {
      const y = 0.45 - i * 0.21;
      ctx.strokeRect(X(-0.7), Y(y), 0.14 * sx, 0.14 * sy);
      ctx.fillText(label, X(-0.48), Y(y - 0.11));
    });
    // recuadro sello + dirección
    ctx.strokeRect(X(-3.55), Y(-0.15), 1.9 * sx, 0.95 * sy);
    ctx.font = `${Math.round(0.1 * sy)}px Arial`;
    ctx.fillText('SELLO', X(-3.45), Y(-0.28));
    ctx.strokeRect(X(1.75), Y(-0.35), 1.8 * sx, 0.85 * sy);
    ctx.fillText('UIFCE · UNAL', X(1.85), Y(-0.5));
    ctx.fillText('CAPACITACION IA', X(1.85), Y(-0.72));
    // pie
    ctx.font = `700 ${Math.round(0.11 * sy)}px Arial`;
    ctx.fillText('IBM SYSTEEM', X(-3.55), Y(-1.45));
    ctx.font = `${Math.round(0.1 * sy)}px Arial`;
    ctx.fillText('DE TARJETAS PERFORADAS A PROMPTS', X(0.2), Y(-1.45));
  });
}

/**
 * Escena 1 — Tarjeta perforada (img2threejs, spec: specs/tarjeta.spec.json).
 * Hero IBM 80 columnas con slots pasantes reales, sola en escena.
 * Reemplaza createEvolucionModel (nodos abstractos).
 */
export function createTarjetasModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Tarjetas_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 1.0);

  const outline = cardOutline();
  const rnd = seededRandom(7);

  // slots: rejilla 80x12, ~16% + onda de datos determinista
  const holes: THREE.Path[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const wave = (col * 7 + row * 13) % 29 < 4;
      if (rnd() < 0.14 || wave) {
        if (holes.length >= 220) break;
        holes.push(
          slotHole(-3.35 + col * 0.0848, 0.9 - row * 0.185, 0.05, 0.13),
        );
      }
    }
  }
  outline.holes.push(...holes);

  const geo = new THREE.ExtrudeGeometry(outline, {
    depth: T,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1,
    curveSegments: 3,
  });
  geo.translate(0, 0, -T / 2);

  const print = printTexture();
  print.repeat.set(1 / W, 1 / H);
  print.offset.set(0.5, 0.5);
  const faceMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd9be8c),
    map: print,
    roughness: 0.85,
    metalness: 0,
  });
  const edgeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xc4a878),
    roughness: 0.9,
  });
  const hero = new THREE.Mesh(geo, [faceMat, edgeMat]);
  hero.name = 'Hero_Tarjeta';
  root.add(hero);

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    // entrada rápida (primer tercio) + vuelta completa 360° durante el showcase
    const te = bezierEase(Math.min(1, t * 3.0));
    hero.position.x = -9 + 9 * te + 0.3 * Math.sin(t * Math.PI * 2) * te;
    hero.rotation.y = -0.9 * (1 - te) + t * Math.PI * 2;
    hero.position.z = 0.1 * Math.sin(t * Math.PI);
    hero.position.y = 0.08 * Math.sin(t * Math.PI * 3);
  };

  const tick = (dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 480, 60, 480);
    void dt;
  };

  updateFrame(0, 60, 480);
  attachRuntime(
    root,
    {
      nodes: ['Tarjetas_Root', 'Hero_Tarjeta'],
      sockets: ['hero.presentacion'],
      spec: 'specs/tarjeta.spec.json',
    },
    tick,
    updateFrame,
  );
  return root;
}
