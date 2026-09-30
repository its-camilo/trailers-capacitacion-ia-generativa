# Tráilers — Capacitación IA Generativa (UIFCE · UNAL)

Project contenedor de los tráilers cinematográficos estilo **Apple Keynote** para cada sesión.
Sesión activa: **01 — Fundamentos** (45s, 60fps, 1920×1080 + variante vertical 1080×1920).

## Estructura

```
trailers-capacitacion-ia-generativa/
├── src/
│   ├── Root.tsx                    # Compositions TrailerSesion01 (+Vertical)
│   ├── constants.ts                # Timings 0-8 / 8-18 / 18-28 / 28-38 / 38-45s
│   ├── components/
│   │   ├── KineticText.tsx         # spring stiffness 200 damping 15
│   │   ├── SceneLayer.tsx          # fallback 2D (gradients / PNG) — Cierre lo usa
│   │   ├── ThreeSceneLayer.tsx     # capa 3D procedural img2threejs (determinista por frame)
│   │   ├── SoundTrack.tsx          # Audio + staticFile
│   │   └── LightSweep.tsx          # máscara de luz Keynote
│   ├── threejs/                    # factories img2threejs code-only (sin Blender en runtime)
│   │   ├── keynoteMaterials.ts     # PBR Keynote: metal / cristal / luz + seededRandom(7)
│   │   ├── createEvolucionModel.ts # escena1: 26 nodos, barrido 8s
│   │   ├── createCerebroModel.ts   # escena2: esfera + core pulsante + 160 partículas
│   │   ├── createAtencionModel.ts  # escena3: Q/K 4×6 + 12 rayos
│   │   ├── createHubModel.ts       # escena4: toro + core + 7 módulos
│   │   ├── specs/                  # specs de reconstrucción (una por objeto)
│   │   └── README.md               # tutorial: rehacer un objeto con la skill
│   └── sesiones/sesion-01/
│       ├── TrailerPrincipal.tsx    # ensamblaje 5 Sequences
│       ├── BloqueHistoria.tsx      # ThreeSceneLayer + createEvolucionModel
│       ├── BloqueAgente.tsx        # ThreeSceneLayer + createCerebroModel
│       ├── BloqueTransformer.tsx   # ThreeSceneLayer + createAtencionModel
│       ├── BloqueMcpRag.tsx        # ThreeSceneLayer + createHubModel
│       └── BloqueCierre.tsx
├── blender/sesion-01/render_trailer.py  # LEGADO: referencia de composición (no se usa en runtime)
├── public/audio/                   # sesion-01-base.mp3 (ver README)
└── public/blender-renders/sesion-01/    # LEGADO: PNG/MP4 de referencia (no se montan)
```

Próximas sesiones: duplicar `src/sesiones/sesion-01/` → `sesion-02/` y `src/threejs/create*.ts` según nuevos objetos, ajustar guion/timings. `blender/` no se duplica: es solo referencia.

## Flujo recomendado (Audio → Remotion → img2threejs)

1. **Audio primero:** consigue una pista synthwave/tech-trailer 45s con golpes marcados (ver `public/audio/README.md`). Sin audio final, usa un placeholder para no bloquear el ritmo.
2. **Video en Remotion:** `npm install && npm run start` → abre `TrailerSesion01`. Ajusta textos/ritmo con springs y `interpolate()`. Render: `npm run render:sesion01`.
3. **Objetos 3D con img2threejs (sin Blender MCP):** cada fondo 3D es un factory
   procedural en `src/threejs/` montado vía `ThreeSceneLayer` (render determinista
   por frame, nítido a cualquier resolución). Para rehacer un objeto sigue
   `src/threejs/README.md` (probe → assessment → spec → factory → `npm run still:3d`).
   `blender/` y `public/blender-renders/` quedan como referencia legada de composición.

## Comandos

```bash
npm install
npm run start                 # Remotion Studio
npm run render:sesion01       # out/sesion-01-fundamentos.mp4
npm run still:sesion01        # thumbnail frame 300
npm run still:3d              # verifica capa 3D (frame 700, bloque Agente)
npm run threejs:check         # tsc: las 4 factories compilan
```

## Guion Sesión 01 (45s)

- **0:00-0:08 El Salto Histórico:** DE TARJETAS PERFORADAS… → …A DESCRIBIR LO INIMAGINABLE / De C++ a Prompting.
- **0:08-0:18 Agente & Harness:** AGENTE explota → [Planear]→[Actuar]→[Observar] / El modelo es el cerebro. El Harness es la ciudad.
- **0:18-0:28 Transformer:** 2017: ATTENTION IS ALL YOU NEED / Paralelo, clave-valor, glitch cuts.
- **0:28-0:38 MCP y RAG:** NO MÁS LÍMITES DE CONTEXTO / MCP: Reglas y Herramientas | RAG: Recuperación Vectorial.
- **0:38-0:45 Cierre:** UIFCE · UNAL + destello / SESIÓN 01: FUNDAMENTOS / INICIAMOS AHORA.
