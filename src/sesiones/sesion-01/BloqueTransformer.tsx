import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createGpuModel} from '../../threejs/createGpuModel';
import {FPS} from '../../constants';

/** Bloque 3 (18-28s): La Revolución del Transformer. */
export const BloqueTransformer: React.FC = () => {
  const frame = useCurrentFrame();

  const tokens = ['query', 'atención', 'Q·K·V', 'softmax', 'paralelo', 'tokens'];

  return (
    <AbsoluteFill>
      {/* 3D img2threejs: GPU doble ventilador (paralelismo literal) + tokens flotantes */}
      <ThreeSceneLayer
        createModel={createGpuModel}
        orbit={{radius: 11.0, height: 5.2, from: -0.5, to: 0.5, pushIn: 3.0}}
        target={[0, 0, 1.6]}
        patternVariant={2}
      />
      {/* matriz de tokens flotantes */}
      <AbsoluteFill style={{opacity: 0.5}}>
        {tokens.map((t, i) => {
          const y = ((frame * (0.6 + i * 0.14) + i * 220) % 1200) - 100;
          return (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: `${8 + i * 15}%`,
                top: y,
                fontSize: 26,
                fontFamily: 'monospace',
                color: 'rgba(11,99,229,0.85)',
                border: '1px solid rgba(11,99,229,0.25)',
                padding: '6px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.75)',
              }}
            >
              {t}
            </div>
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 1,
          padding: '40px 230px',
          gap: 26,
        }}
      >
        <KineticText fontSize={44} delay={10} color="#0B63E5" fontWeight={700} style={{marginBottom: 18, padding: '10px 24px'}}>
          2017: ATTENTION IS ALL YOU NEED
        </KineticText>
        <div style={{height: 28}} />
        <KineticText fontSize={76} delay={50} style={{padding: '12px 24px'}}>
          PROCESAMIENTO PARALELO
        </KineticText>
        <KineticText fontSize={32} delay={130} color="#000000" fontWeight={700} style={{marginTop: 30, padding: '12px 32px'}}>
          Procesamiento en paralelo / Búsqueda por clave-valor
        </KineticText>
      </AbsoluteFill>

      {/* línea de progreso del bloque */}
      <AbsoluteFill style={{justifyContent: 'flex-end', padding: '40px 150px'}}>
        <div style={{height: 4, background: 'rgba(10,22,40,0.12)', borderRadius: 4}}>
          <div
            style={{
              width: `${interpolate(frame, [0, 10 * FPS], [0, 100])}%`,
              height: '100%',
              background: '#0B63E5',
              borderRadius: 4,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
