// Plantilla de tráilers — abstracción de Sesión 01.
// Timings oficiales 45s @ 60fps, 5 bloques. Reutilizar en todas las sesiones.
// Origen: src/sesiones/sesion-01/TrailerPrincipal.tsx
import {BLOQUES} from '../constants';

/** Orden canónico de los 5 bloques de la plantilla. */
export const ORDEN_BLOQUES = [
  'bloque0', // 0-8s   Hook / Intro sesión
  'bloque1', // 8-18s  Concepto A (S01: Agente · S02: Subagentes)
  'bloque2', // 18-28s Concepto B (S01: Transformer · S02: SQLite)
  'bloque3', // 28-38s Concepto C (S01: MCP/RAG · S02: Google Docs)
  'bloque4', // 38-45s Cierre / CTA
] as const;

export type BloqueKey = (typeof ORDEN_BLOQUES)[number];

/** Timings en frames, derivados de constants.BLOQUES para no duplicar. */
export const TIMINGS_PLANTILLA = [
  BLOQUES.historia,
  BLOQUES.agente,
  BLOQUES.transformer,
  BLOQUES.mcpRag,
  BLOQUES.cierre,
] as const;

/** Config mínima que cada sesión debe aportar. */
export type SesionConfig = {
  id: string; // ej. '02'
  titulo: string; // ej. 'PRÁCTICA MCP'
  subtitulo: string; // ej. 'Conectores'
  audioSrc?: string; // ej. 'audio/sesion-02-base.mp3' (fallback a sesion-01)
};
