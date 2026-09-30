import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SoundTrack} from '../../components/SoundTrack';
import {BLOQUES, COLORES} from '../../constants';
import {BloqueAgente} from './BloqueAgente';
import {BloqueCierre} from './BloqueCierre';
import {BloqueHistoria} from './BloqueHistoria';
import {BloqueMcpRag} from './BloqueMcpRag';
import {BloqueTransformer} from './BloqueTransformer';

/**
 * TrailerPrincipal — Sesión 01: Fundamentos de IA Generativa (45s, 60fps).
 * Composición por capas, kinetic typography, cámara virtual.
 * Fondos 3D procedurales img2threejs (src/threejs/, code-only, sin Blender):
 * cada Bloque monta su factory via ThreeSceneLayer con órbita determinista.
 * Legado Blender en blender/sesion-01/ solo como referencia visual.
 */
export const TrailerPrincipal: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORES.fondo}}>
      <SoundTrack />

      <Sequence from={BLOQUES.historia.from} durationInFrames={BLOQUES.historia.dur} name="Historia">
        <BloqueHistoria />
      </Sequence>

      <Sequence from={BLOQUES.agente.from} durationInFrames={BLOQUES.agente.dur} name="Agente">
        <BloqueAgente />
      </Sequence>

      <Sequence from={BLOQUES.transformer.from} durationInFrames={BLOQUES.transformer.dur} name="Transformer">
        <BloqueTransformer />
      </Sequence>

      <Sequence from={BLOQUES.mcpRag.from} durationInFrames={BLOQUES.mcpRag.dur} name="MCP-RAG">
        <BloqueMcpRag />
      </Sequence>

      <Sequence from={BLOQUES.cierre.from} durationInFrames={BLOQUES.cierre.dur} name="Cierre">
        <BloqueCierre />
      </Sequence>
    </AbsoluteFill>
  );
};
