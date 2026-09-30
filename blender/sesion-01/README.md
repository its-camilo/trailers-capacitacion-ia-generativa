# Blender — Sesión 01

Script modular `render_trailer.py` estilo Apple Keynote, compatible con **Blender 5.2**
(iteradores de F-Curves vía `layers → strips → channelbags`, salida siempre como
secuencia PNG + ensamblado a MP4 con ffmpeg, ya que 5.x no expone salida directa
a video por Python).

## Smoke test (2 min, valida el pipeline)

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P blender/sesion-01/render_trailer.py -- \
  --escena escena2 --engine EEVEE --preset rapido \
  --frames 10 --fps 30 --res 720p --outdir /tmp/trailer-smoke/
```

Debe terminar con `[OK] escena2_cerebro: 1-11 -> .../escena2_cerebro.mp4`.
Ojo: con `--frames 10` el motion blur se ve exagerado (toda la órbita en 10 frames);
a duración real es sutil.

## Previews por escena (720p30, EEVEE rápido, ~1-6 min c/u a ~0.3s/frame)

```bash
for e in escena1 escena2 escena3 escena4; do
/Applications/Blender.app/Contents/MacOS/Blender -b -P blender/sesion-01/render_trailer.py -- \
  --escena $e --engine EEVEE --preset rapido \
  --fps 30 --res 720p --outdir ./public/blender-renders/sesion-01/
done
```

Salen directo con nombres limpios (`escena1_evolucion.mp4`, `escena2_cerebro.mp4`,
`escena3_atencion.mp4`, `escena4_hub.mp4`) — los mismos que espera `SceneLayer`.
También quedan los PNG (`escenaX_%04d.png`) por si quieres re-ensamblar a mano.

## Render final (Cycles, 1080p60 — lanzar de noche, ~horas por escena)

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P blender/sesion-01/render_trailer.py -- \
  --escena escena2 --engine CYCLES --preset final \
  --fps 60 --res 1080p --outdir ./public/blender-renders/sesion-01/
```

## Capas transparentes para Remotion (opcional, ruta pro)

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P blender/sesion-01/render_trailer.py -- \
  --escena todas --engine EEVEE --preset rapido \
  --transparent --outdir ./public/blender-renders/sesion-01/
ffmpeg -framerate 60 -i escena2_cerebro_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p escena2_cerebro.webm
```

## Integración con Remotion

1. Renderiza cada escena a `../../public/blender-renders/sesion-01/`.
2. En cada `Bloque*.tsx` cambia `SceneLayer kind="gradient"` → `kind="video"`
   (los `src` ya apuntan a los nombres correctos).
3. Verifica con `npx remotion still TrailerSesion01 out/check-700.png --frame=700`.

Escenas: Evolución (nodos alta velocidad) · Cerebro/Harness (esfera cristal + partículas) ·
Atención (matrices + rayos) · Hub MCP/RAG (módulos orbitando).
Cámara: órbitas Bezier + push-in, foco anclado al target, DOF f/2.8, lente 42mm.

Perillas de look (arriba de cada builder): fuerzas de emisión (`make_mat_luz`),
energías de `setup_luces_keynote()`, mezcla del cristal (`make_mat_cristal`).
