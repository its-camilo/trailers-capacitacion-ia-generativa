# Plantilla de tráilers (extraída de Sesión 01)

`TrailerPlantilla` + `BloquePlantilla` + `tipos.ts` son la abstracción del
tráiler que quedó bien en S01, para clonar sesiones sin copiar/pegar lógica.

## Contrato visual LIGHT (no negociable)

- Fondo claro `#F2F5FA`, viñeta + `LightPattern`, textos `#0A1628` con
  `contrastStroke` (borde blanco), acentos `#0B63E5` / `#5B4FD6`.
- Tipografía: `KineticText` spring stiffness 200 damping 15, push-in continuo.
- 3D: `ThreeSceneLayer` + factory img2threejs determinista por frame
  (`userData.updateFrame`), órbita `radius/height/from/to/pushIn`.
- 45s @ 60fps = 2700 frames. Timings: 0-8 / 8-18 / 18-28 / 28-38 / 38-45s.

## Crear una sesión nueva (ej. S02)

```bash
mkdir -p src/sesiones/sesion-02
# 5 bloques: Intro, ConceptoA, ConceptoB, ConceptoC, Cierre
# cada uno usa <BloquePlantilla fondo3D={{createModel}} ... /> o composición libre
# Trailer: <TrailerPlantilla audioSrc bloques={[B0,B1,B2,B3,B4]} />
# Root: agregar Composition TrailerSesion02 (+Vertical)
# render: npm run render:sesion02
```

## Mapa S01 → plantilla → S02

| Slot plantilla | S01 (origen) | S02 (Práctica MCP) | Modelo 3D |
|---|---|---|---|
| bloque0 0-8s Intro | Historia: tarjetas | Intro: SESIÓN 02 PRÁCTICA MCP | gradiente + anillos (sin 3D pesado) |
| bloque1 8-18s Concepto A | Agente: portátil | Subagentes: 3 robots investigan economía | `createRobotsModel` |
| bloque2 18-28s Concepto B | Transformer: GPU | SQLite Northwind: tablas→SQL | `createDatabaseModel` |
| bloque3 28-38s Concepto C | MCP/RAG: libro | Google Docs bonus + entregables | `createDatacenterModel` |
| bloque4 38-45s Cierre | Cierre S01 | Cierre S02 + quitar Docs MCP | gradiente + anillos |

S01 queda intacto como referencia. S02 en adelante usan la plantilla.
