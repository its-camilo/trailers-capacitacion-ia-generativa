# Audio — Sesión 01

El tráiler espera `sesion-01-base.mp3` (45s, synthwave / tech-trailer con golpes marcados).

## Dónde conseguirla (opciones libres o con licencia)

1. Pixabay Music / Uppbeat / Artlist: buscar `tech trailer synthwave 45s`.
2. Generar un bed con Suno/Udio: prompt `cinematic tech trailer, synthwave, sub-bass impacts every 8s, whoosh transitions, 45 seconds, 120bpm`.
3. Temporal para preview: cualquier `.mp3` renombrado a `sesion-01-base.mp3`.

## Stems opcionales (sincronizados a cortes)

Coloca aquí también y referéncialos con `<Audio startFrom={...}>`:
- `whoosh.mp3` → frames 480, 1080, 1680, 2280
- `impact.mp3` → frames 480, 1680
- `glitch.mp3` → frames 1080-1680 (cada 50 frames)
- `sub-bass.mp3` → frame 2280 (cierre)

## Normalización sugerida

```bash
ffmpeg -i input.mp3 -t 45 -af loudnorm=I=-16:TP=-1.5:LRA=11 public/audio/sesion-01-base.mp3
```
