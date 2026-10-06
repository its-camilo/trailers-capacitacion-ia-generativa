import * as THREE from 'three';
import {attachRuntime, bezierEase, makeLight, makeMetalDark} from './keynoteMaterials';

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

function makeRobot(
  accent: [number, number, number],
  name: string,
  scale = 1,
): {group: THREE.Group; head: THREE.Mesh; eyeMat: THREE.MeshStandardMaterial; nodes: string[]} {
  const group = new THREE.Group();
  group.name = name;
  const nodes = [name];
  // LIGHT: cuerpo blanco humo + articulaciones gris-azul claro,
  // con detalles oscuros (visores, marcos, antena, pies)
  const body = new THREE.MeshStandardMaterial({color: 0xf4f7fc, roughness: 0.35, metalness: 0.15});
  const joint = new THREE.MeshStandardMaterial({color: 0xcfdcf0, roughness: 0.4, metalness: 0.3});
  const dark = makeMetalDark();
  const accentMat = makeLight(accent, 3.5);
  const eyeMat = makeLight([0.3, 0.75, 1.0], 5.0);

  // torso
  const torso = box(0.9 * scale, 1.1 * scale, 0.6 * scale, body, 0, 0, 0, `${name}_Torso`);
  group.add(torso);
  nodes.push(torso.name);
  // marco oscuro del pecho + núcleo emisivo
  const chestFrame = box(0.6 * scale, 0.4 * scale, 0.04 * scale, dark, 0, 0.15 * scale, 0.31 * scale, `${name}_ChestFrame`);
  group.add(chestFrame);
  nodes.push(chestFrame.name);
  const chest = box(0.5 * scale, 0.3 * scale, 0.06 * scale, accentMat, 0, 0.15 * scale, 0.32 * scale, `${name}_Chest`);
  group.add(chest);
  nodes.push(chest.name);
  // cabeza
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.55 * scale, 0.6 * scale), body);
  head.name = `${name}_Head`;
  head.position.set(0, 0.95 * scale, 0);
  group.add(head);
  nodes.push(head.name);
  // visor: marco oscuro + ojos emisivos
  const bezel = box(0.58 * scale, 0.24 * scale, 0.04 * scale, dark, 0, 0.95 * scale, 0.3 * scale, `${name}_Bezel`);
  group.add(bezel);
  nodes.push(bezel.name);
  const eyes = box(0.5 * scale, 0.16 * scale, 0.05 * scale, eyeMat, 0, 0.95 * scale, 0.32 * scale, `${name}_Eyes`);
  group.add(eyes);
  nodes.push(eyes.name);
  // antena
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5 * scale, 8), dark);
  ant.name = `${name}_Antenna`;
  ant.position.set(0.25 * scale, 1.45 * scale, 0);
  group.add(ant);
  nodes.push(ant.name);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07 * scale, 12, 12), accentMat);
  tip.name = `${name}_Tip`;
  tip.position.set(0.25 * scale, 1.72 * scale, 0);
  group.add(tip);
  nodes.push(tip.name);
  // brazos
  for (const s of [-1, 1]) {
    const arm = box(0.18 * scale, 0.85 * scale, 0.18 * scale, body, s * 0.62 * scale, 0.05 * scale, 0, `${name}_Arm_${s < 0 ? 'L' : 'R'}`);
    group.add(arm);
    nodes.push(arm.name);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 12, 12), accentMat);
    hand.name = `${name}_Hand_${s < 0 ? 'L' : 'R'}`;
    hand.position.set(s * 0.62 * scale, -0.42 * scale, 0);
    group.add(hand);
    nodes.push(hand.name);
  }
  // piernas claras + pies oscuros
  for (const s of [-1, 1]) {
    const leg = box(0.22 * scale, 0.5 * scale, 0.22 * scale, joint, s * 0.25 * scale, -0.8 * scale, 0, `${name}_Leg_${s < 0 ? 'L' : 'R'}`);
    group.add(leg);
    nodes.push(leg.name);
    const foot = box(0.26 * scale, 0.12 * scale, 0.34 * scale, dark, s * 0.25 * scale, -1.08 * scale, 0.04 * scale, `${name}_Foot_${s < 0 ? 'L' : 'R'}`);
    group.add(foot);
    nodes.push(foot.name);
  }
  // base flotante (anillo)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75 * scale, 0.05 * scale, 10, 32), accentMat);
  ring.name = `${name}_Ring`;
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.1 * scale;
  group.add(ring);
  nodes.push(ring.name);

  return {group, head, eyeMat, nodes};
}

/**
 * Escena S02-B1 — Trío de subagentes robots (img2threejs, spec: specs/robots.spec.json).
 * Metáfora: AGENTE 1 Fintech · AGENTE 2 Datos Públicos · AGENTE 3 Frameworks.
 * Líder al centro (azul), dos workers laterales (violeta / cian), flotación
 * sincronizada + vuelta completa 360° en plano horizontal (como GPU del tráiler 1).
 * LIGHT: cuerpo blanco humo + acentos emisivos sobre #F2F5FA (nada oscuro).
 */
export function createRobotsModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Robots_Root';
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 1.0);
  const nodes = ['Robots_Root'];

  const r0 = makeRobot([0.2, 0.55, 1.0], 'Robot_Lider', 1.15);
  r0.group.position.set(0, 0.4, 0);
  const r1 = makeRobot([0.36, 0.31, 0.84], 'Robot_Fintech', 0.9);
  r1.group.position.set(-2.4, 0.1, -0.4);
  r1.group.rotation.y = 0.5;
  const r2 = makeRobot([0.15, 0.8, 0.85], 'Robot_Datos', 0.9);
  r2.group.position.set(2.4, 0.1, -0.4);
  r2.group.rotation.y = -0.5;
  root.add(r0.group, r1.group, r2.group);
  nodes.push(...r0.nodes, ...r1.nodes, ...r2.nodes);

  // enlaces líder ↔ workers (líneas de consolidación)
  const linkMat = new THREE.LineBasicMaterial({color: 0x0b63e5, transparent: true, opacity: 0.55});
  const linkGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2.4, 0.6, -0.4),
    new THREE.Vector3(0, 0.8, 0),
    new THREE.Vector3(2.4, 0.6, -0.4),
  ]);
  const links = new THREE.Line(linkGeo, linkMat);
  links.name = 'Robots_Links';
  root.add(links);
  nodes.push('Robots_Links');

  const eyeMats = [r0.eyeMat, r1.eyeMat, r2.eyeMat];

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    // vuelta completa 360° en plano horizontal (eje Y), como la GPU del tráiler 1
    root.rotation.y = t * Math.PI * 2;
    const bob = (ph: number) => 0.12 * Math.sin(t * Math.PI * 4 + ph);
    r0.group.position.y = 0.4 + bob(0);
    r1.group.position.y = 0.1 + bob(2.1);
    r2.group.position.y = 0.1 + bob(4.2);
    // cabezas miran al centro / parpadeo emisivo
    r1.group.rotation.y = 0.5 - 0.3 * Math.sin(t * Math.PI * 2);
    r2.group.rotation.y = -0.5 + 0.3 * Math.sin(t * Math.PI * 2);
    const blink = 4.2 + 1.6 * Math.max(0, Math.sin(t * Math.PI * 8));
    eyeMats.forEach((m) => {
      m.emissiveIntensity = blink;
    });
    links.position.y = bob(1.0) * 0.5;
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {nodes, sockets: ['agente.fintech', 'agente.datos', 'agente.frameworks'], spec: 'specs/robots.spec.json'},
    tick,
    updateFrame,
  );
  return root;
}
