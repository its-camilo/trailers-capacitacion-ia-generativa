import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText, contrastStroke} from '../../components/KineticText';
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createLibroModel} from '../../threejs/createLibroModel';

/** Bloque 4 (28-38s): MCP y RAG. Impacto + pases rápidos. */
export const BloqueMcpRag: React.FC = () => {
  const frame = useCurrentFrame();
  // impacto inicial: flash + scale-down
  const impacto = interpolate(frame, [0, 12], [1.35, 1], {extrapolateRight: 'clamp'});
  const flash = interpolate(frame, [0, 10], [0.7, 0], {extrapolateRight: 'clamp'});

  // pases alternados cada 90 frames
  const fase = Math.floor(frame / 90) % 2; // 0 MCP, 1 RAG

  return (
    <AbsoluteFill>
      {/* 3D procedural img2threejs: libro abierto (contexto ilimitado) */}
      <ThreeSceneLayer
        createModel={createLibroModel}
        orbit={{radius: 10.0, height: 5.0, from: -1.2, to: -0.35, pushIn: 1.5}}
        target={[0, 0.6, 0]}
        patternVariant={3}
      />
      <AbsoluteFill style={{backgroundColor: `rgba(11,99,229,${flash * 0.22})`}} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${impacto})`, padding: '40px 230px', gap: 30}}>
        <KineticText fontSize={92} delay={5} style={{marginBottom: 14, padding: '12px 24px'}}>
          NO MÁS LÍMITES
          <br />
          DE CONTEXTO
        </KineticText>

        <div style={{height: 40}} />

        <div
          style={{
            display: 'flex',
            gap: 32,
            fontSize: 30,
            fontWeight: 700,
            padding: '10px 16px',
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              padding: '18px 34px',
              borderRadius: 14,
              border: '1px solid rgba(11,99,229,0.4)',
              background: fase === 0 ? '#0B63E5' : 'rgba(255,255,255,0.88)',
              color: fase === 0 ? '#FFFFFF' : '#0A1628',
              WebkitTextStroke: contrastStroke(fase === 0 ? '#FFFFFF' : '#0A1628', 30),
            }}
          >
            MCP: Reglas y Herramientas
          </div>
          <div
            style={{
              padding: '18px 34px',
              borderRadius: 14,
              border: '1px solid rgba(91,79,214,0.4)',
              background: fase === 1 ? '#5B4FD6' : 'rgba(255,255,255,0.88)',
              color: fase === 1 ? '#FFFFFF' : '#0A1628',
              WebkitTextStroke: contrastStroke(fase === 1 ? '#FFFFFF' : '#0A1628', 30),
            }}
          >
            RAG: Recuperación Vectorial
          </div>
        </div>

        <KineticText fontSize={26} delay={120} color="#5A6B8C" fontWeight={500} style={{marginTop: 32, padding: '12px 30px'}}>
          {fase === 0 ? 'Model Context Protocol → herramientas reales' : 'Embeddings → búsqueda semántica → contexto'}
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
