import React from 'react';
import {TrailerPlantilla} from '../../plantilla/TrailerPlantilla';
import {BloqueCierre02} from './BloqueCierre02';
import {BloqueDocs} from './BloqueDocs';
import {BloqueIntro} from './BloqueIntro';
import {BloqueSqlite} from './BloqueSqlite';
import {BloqueSubagentes} from './BloqueSubagentes';

/**
 * Trailer Sesión 02 — Práctica MCP (45s, 60fps, plantilla).
 * Bloques: Intro 0-8 · Subagentes(robots) 8-18 · SQLite(DB) 18-28
 * · Docs(datacenter) 28-38 · Cierre 38-45.
 * Audio: reutiliza base S01 hasta tener pista S02 propia.
 */
export const TrailerSesion02: React.FC = () => {
  return (
    <TrailerPlantilla
      audioSrc="audio/sesion-01-base.mp3"
      nombres={['Intro02', 'Subagentes', 'SQLite', 'Docs', 'Cierre02']}
      bloques={[BloqueIntro, BloqueSubagentes, BloqueSqlite, BloqueDocs, BloqueCierre02]}
    />
  );
};
