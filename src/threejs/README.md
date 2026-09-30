# Objetos 3D — img2threejs (sin Blender MCP)

Los 6 fondos 3D del tráiler son **procedurales code-only** con la skill `img2threejs`:
primitivas + PBR + semillas deterministas. Nada de `.glb`, nada de MP4 de Blender
en runtime. Por eso se ven más definidos: aristas a resolución nativa en cada
frame, sin denoise de Cycles, sin samples de EEVEE, sin compresión H.264.

## Qué reemplaza a qué

| Bloque | Objeto literal (img2threejs) | Factory | Spec / Referencia |
|--------|------------------------------|---------|-------------------|
| Historia 0-8s | Tarjeta perforada IBM 80 col: corte diagonal, ~150 slots pasantes reales, impresión en canvas | `createTarjetasModel` — entrada rápida + showcase + 2 ecos | `specs/tarjeta.spec.json` / `references/tarjeta-perforada.jpg` |
| Agente 8-18s | Portátil de agente: chasis aluminio, teclado 5×14 instanciado, pantalla con editor + prompt, logo emisivo | `createPortatilModel` — respiración + giro + cursor parpadeante | `specs/portatil.spec.json` (genérico, sin foto) |
| Transformer 18-28s | GPU doble ventilador: 2×9 aspas contrarrotantes, disipador, PCIe dorado, bracket, LED | `createGpuModel` — fans por frame + tilt | `specs/gpu.spec.json` / `references/gpu.jpg` |
| MCP/RAG 28-38s | Libro abierto: tapas azul + páginas con texto procedural + marcapáginas | `createLibroModel` — respiración + yaw + flotación | `specs/libro.spec.json` (genérico, sin foto) |

Materiales en `keynoteMaterials.ts` (réplica PBR de `make_mat_*` de Blender):
metal `#141C29` metalness 1.0 roughness 0.28 · cristal `MeshPhysicalMaterial`
roughness 0.05 IOR 1.45 clearcoat · luz emisiva por escena (6.0 / 1.5 / 4.0 / 3.5).

## Contrato de cada factory (skill img2threejs)

```ts
export function createXModel(spec = {}, options = {}): THREE.Group
// group.userData.sculptRuntime = { nodes, sockets, spec }  (jerarquía explotable/clicable)
// group.userData.tick(dt, elapsed)                          (preview interactivo)
// group.userData.updateFrame(frame, fps, dur)               (Remotion determinista)
```

- `Group` raíz con `scale [1,1,1]` (regla img2threejs: nunca ocultar con escala).
- Ruido solo vía `seededRandom(7)` — mismo frame, mismo píxel, en cada render.
- `ThreeSceneLayer` aporta luces Keynote (key spot + rim azul + fill) y órbita
  de cámara `radius/pushIn` idéntica a `orbit_camera()` de Blender, pero evaluada
  por frame (`useCurrentFrame`), no por wall-clock.

## Rehacer un objeto con la skill (flujo oficial)

```bash
# 1. referencia (las PNG de Blender sirven como referencia de composición)
python3 /Users/itscamilo/Projects/img2threejs/forge/stage1_intake/probe_image.py \
  public/blender-renders/sesion-01/escena2_cerebro_0150.png

# 2. assessment + spec (ver specs/*.json como ejemplo ya rellenado)
python3 /Users/itscamilo/Projects/img2threejs/forge/stage2_spec/new_pre_spec_assessment.py \
  "Harness Cerebro Esfera" --image public/blender-renders/sesion-01/escena2_cerebro_0150.png \
  --complexity moderate --out /tmp/cerebro-assessment.json
# …inspección visual, rellenar qualityContract/detailInventory, luego new_sculpt_spec.py…

# 3. validar antes de generar código
python3 /Users/itscamilo/Projects/img2threejs/forge/stage2_spec/validate_sculpt_spec.py specs/cerebro.spec.json

# 4. verificar que compila + still determinista
npm run threejs:check
npm run still:3d   # out/check3d-700.png, frame 700 = bloque Agente
```

Nota honesta de la skill: una sola vista no revela caras ocultas — las specs lo
declaran (`singleViewLimits`) y espejan lo visible en vez de inventar.

## Integrar un bloque nuevo

```tsx
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createHubModel} from '../../threejs/createHubModel';

<ThreeSceneLayer
  createModel={createHubModel}
  orbit={{radius: 10.0, height: 4.6, from: -0.9, to: 0.9, pushIn: 2.0}}
  target={[0, 0, 1.6]}
/>
```

`blender/` queda como referencia legada (composición, timings, luces). No se usa en runtime.
