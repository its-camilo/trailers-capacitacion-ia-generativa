# Tráilers — Capacitación IA Generativa (UIFCE · UNAL)

Project contenedor de los tráilers cinematográficos estilo **Apple Keynote** para cada sesión.
Sesiones: **01 — Fundamentos** y **02 — Práctica MCP** (45s, 60fps, 1920×1080 + variante vertical 1080×1920).
Plantilla: `src/plantilla/` (extraída de S01) — ver `src/plantilla/README.md`.

## Estructura

```
trailers-capacitacion-ia-generativa/
├── src/
│   ├── Root.tsx                    # Compositions TrailerSesion01/02 (+Vertical)
│   ├── constants.ts                # Timings 0-8 / 8-18 / 18-28 / 28-38 / 38-45s
│   ├── plantilla/
│   │   ├── TrailerPlantilla.tsx    # shell 45s: fondo + SoundTrack + 5 Sequences
│   │   ├── BloquePlantilla.tsx     # overlay Keynote LIGHT estándar
│   │   ├── tipos.ts                # ORDEN_BLOQUES + TIMINGS + SesionConfig
│   │   └── README.md               # mapa S01 → plantilla → S02
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
│   │   ├── createHubModel.ts       # S01: toro + core + 7 módulos
│   │   ├── createRobotsModel.ts    # S02: 3 robots subagentes (Fintech/Datos/Frameworks)
│   │   ├── createDatabaseModel.ts  # S02: cilindro DB + tablas Northwind + query dots
│   │   ├── createDatacenterModel.ts # S02: 3 racks + Doc informe + arco sync
│   │   ├── specs/                  # specs de reconstrucción (una por objeto)
│   │   └── README.md               # tutorial: rehacer un objeto con la skill
│   └── sesiones/sesion-02/         # usa TrailerPlantilla (no duplica lógica)
│       ├── TrailerSesion02.tsx     # bloques=[Intro,Subagentes,Sqlite,Docs,Cierre02]
│       ├── BloqueIntro.tsx         # gradiente + SESIÓN 02 PRÁCTICA MCP
│       ├── BloqueSubagentes.tsx    # ThreeSceneLayer + createRobotsModel
│       ├── BloqueSqlite.tsx        # ThreeSceneLayer + createDatabaseModel
│       ├── BloqueDocs.tsx          # ThreeSceneLayer + createDatacenterModel
│       └── BloqueCierre02.tsx      # cierre + quitar Docs MCP
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

Próximas sesiones (03, 04…): usar `src/plantilla/` — ver `src/plantilla/README.md`.
S01 queda intacto como referencia origen. `blender/` no se duplica: es solo referencia.

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
npm run render:sesion02       # out/sesion-02-practica-mcp.mp4
npm run still:sesion01        # thumbnail frame 300
npm run still:sesion02        # thumbnail S02 frame 300
npm run still:sesion02-robots # frame 700  (subagentes)
npm run still:sesion02-db     # frame 1300 (SQLite)
npm run still:sesion02-dc     # frame 1900 (Docs)
npm run threejs:check         # tsc: las 9 factories compilan
```

## Guion Sesión 01 (45s)

- **0:00-0:08 El Salto Histórico:** DE TARJETAS PERFORADAS… → …A DESCRIBIR LO INIMAGINABLE / De C++ a Prompting.
- **0:08-0:18 Agente & Harness:** AGENTE explota → [Planear]→[Actuar]→[Observar] / El modelo es el cerebro. El Harness es la ciudad.
- **0:18-0:28 Transformer:** 2017: ATTENTION IS ALL YOU NEED / Paralelo, clave-valor, glitch cuts.
- **0:28-0:38 MCP y RAG:** NO MÁS LÍMITES DE CONTEXTO / MCP: Reglas y Herramientas | RAG: Recuperación Vectorial.
- **0:38-0:45 Cierre:** UIFCE · UNAL + destello / SESIÓN 01: FUNDAMENTOS / INICIAMOS AHORA.

## Guion Sesión 02 — Práctica MCP (45s, plantilla)

- **0:00-0:08 Intro:** UIFCE · UNAL / SESIÓN 02 / PRÁCTICA MCP / Conectores — de Northwind a Google Docs.
- **0:08-0:18 Subagentes (robots):** EJEMPLO · SUBAGENTES / 3 ROBOTS INVESTIGAN / [Fintech][Datos Públicos][Frameworks] / Casos de agentes que automaticen análisis económico.
- **0:18-0:28 SQLite (database):** PASO 1–3 · NORTHWIND / MCP SQLITE / ¿Qué tablas hay? → SQL → top 5 productos y ventas por país.
- **0:28-0:38 Docs (datacenter):** PASO 4–6 · BONUS GOOGLE DOCS / INFORME EN DRIVE / Crear Doc → Probar | Entregables del equipo / @a-bonus/google-docs-mcp.
- **0:38-0:45 Cierre:** SESIÓN 02: PRÁCTICA MCP / CIERRE: quitar el MCP de Google Docs / NOS VEMOS EN PRÁCTICA.
