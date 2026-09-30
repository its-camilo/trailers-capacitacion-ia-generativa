import * as THREE from 'three';
import {attachRuntime, bezierEase, makeLight, makeMetalDark} from './keynoteMaterials';

/**
 * Escena 4 — Hub MCP/RAG (img2threejs, spec: specs/hub.spec.json).
 * Toro R=1.2/r=0.28 + núcleo cilindro r=0.55 + 7 módulos en órbita r=3.4.
 * Reemplaza escena4_hub de Blender.
 */
export function createHubModel(
  _spec: Record<string, unknown> = {},
  _options: Record<string, unknown> = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Hub_Root';
  root.scale.set(1, 1, 1);

  const matMetal = makeMetalDark();
  const matMod = makeLight([0.35, 0.7, 1.0], 3.5);

  const hub = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.28, 24, 64), matMetal);
  hub.name = 'Hub_Central';
  hub.position.set(0, 0, 1.6);
  root.add(hub);

  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.7, 32), matMod);
  core.name = 'Hub_Core';
  core.rotation.x = Math.PI / 2;
  core.position.set(0, 0, 1.6);
  root.add(core);

  const mods: {mesh: THREE.Mesh; ang: number}[] = [];
  const modGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  for (let i = 0; i < 7; i++) {
    const ang = (Math.PI * 2 * i) / 7;
    const mesh = new THREE.Mesh(modGeo, i % 2 === 0 ? matMod : matMetal);
    mesh.name = `Modulo_${String(i).padStart(2, '0')}`;
    root.add(mesh);
    mods.push({mesh, ang});
  }

  const updateFrame = (frame: number, _fps: number, dur: number) => {
    const t = bezierEase(dur <= 1 ? 0 : frame / (dur - 1));
    hub.rotation.z = Math.PI * t;
    core.rotation.z = Math.PI * 2 * t;
    for (const {mesh, ang} of mods) {
      const a = ang + 1.4 * t;
      mesh.position.set(
        3.4 * Math.cos(a),
        3.4 * Math.sin(a),
        1.6 + 0.5 * Math.sin(a * 2),
      );
      mesh.rotation.set(0, 0, a);
    }
  };

  const tick = (_dt: number, elapsed: number) => {
    updateFrame((elapsed * 60) % 600, 60, 600);
  };

  updateFrame(0, 60, 600);
  attachRuntime(
    root,
    {
      nodes: ['Hub_Root', 'Hub_Central', 'Hub_Core', ...mods.map((m) => m.mesh.name)],
      sockets: ['modulo.orbita'],
      spec: 'specs/hub.spec.json',
    },
    tick,
    updateFrame,
  );
  return root;
}
