// Timings oficiales del guion 45s @ 60fps = 2700 frames.
// Bloques: Historia 0-8s, Agente 8-18s, Transformer 18-28s, MCP/RAG 28-38s, Cierre 38-45s.
export const FPS = 60;
export const W = 1920;
export const H = 1080;

export const BLOQUES = {
  historia: {from: 0, dur: 8 * FPS}, // 0-480
  agente: {from: 8 * FPS, dur: 10 * FPS}, // 480-1080
  transformer: {from: 18 * FPS, dur: 10 * FPS}, // 1080-1680
  mcpRag: {from: 28 * FPS, dur: 10 * FPS}, // 1680-2280
  cierre: {from: 38 * FPS, dur: 7 * FPS}, // 2280-2700
} as const;

export const DURACION_TOTAL = 45 * FPS; // 2700

export const COLORES = {
  fondo: '#F2F5FA',
  fondo2: '#E4EAF3',
  texto: '#0A1628',
  muted: '#5A6B8C',
  acento: '#0B63E5',
  acento2: '#5B4FD6',
  linea: 'rgba(11,99,229,0.28)',
} as const;
