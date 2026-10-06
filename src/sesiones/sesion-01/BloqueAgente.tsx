import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createPortatilModel} from '../../threejs/createPortatilModel';

const CAPAS = ['Planear', 'Actuar', 'Observar'];

/** Bloque 2 (8-18s): Anatomía del Agente & Harness. */
export const BloqueAgente: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const explosion = spring({frame, fps, config: {stiffness: 200, damping: 15}});
  const scaleAgente = interpolate(explosion, [0, 1], [2.6, 1]);

  return (
    <AbsoluteFill>
      {/* 3D img2threejs: portátil de agente (chasis + teclado + pantalla con prompt) */}
      <ThreeSceneLayer
        createModel={createPortatilModel}
        orbit={{radius: 10.5, height: 4.6, from: -1.15, to: -0.3, pushIn: 1.5}}
        target={[0, 1.0, 0]}
        patternVariant={1}
      />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 38, padding: '40px 230px'}}>
        <div style={{transform: `scale(${scaleAgente})`, opacity: interpolate(explosion, [0, 0.3], [0, 1]), padding: '12px 24px', marginBottom: 10 }}>
          <KineticText fontSize={190} delay={0} pushIn={false}>
            AGENTE
          </KineticText>
        </div>

        <div style={{display: 'flex', gap: 32, marginTop: 22, marginBottom: 10, perspective: 900, padding: '8px 16px'}}>
          {CAPAS.map((c, i) => {
            const d = 40 + i * 35;
            const s = spring({frame: Math.max(0, frame - d), fps, config: {stiffness: 200, damping: 15}});
            const z = interpolate(s, [0, 1], [-140, 0]);
            return (
              <div
                key={c}
                style={{
                  opacity: s,
                  transform: `translateZ(${z}px) translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                  border: '1px solid rgba(11,99,229,0.35)',
                  background: 'rgba(255,255,255,0.88)',
                  padding: '18px 36px',
                  borderRadius: 16,
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#0A1628',
                  WebkitTextStroke: '1px #FFFFFF',
                  boxShadow: '0 12px 40px rgba(11,99,229,0.18)',
                }}
              >
                [{c}]
              </div>
            );
          })}
        </div>

        <KineticText fontSize={34} delay={180} color="#000000" fontWeight={700} style={{marginTop: 28, padding: '12px 32px'}}>
          El agente es el trabajador. El Harness es la ciudad.
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
