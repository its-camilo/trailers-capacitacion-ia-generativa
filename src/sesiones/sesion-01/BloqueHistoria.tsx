import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {LightSweep} from '../../components/LightSweep';
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createTarjetasModel} from '../../threejs/createTarjetasModel';

/** Bloque 1 (0-8s): El Salto Histórico. */
export const BloqueHistoria: React.FC = () => {
  const frame = useCurrentFrame();
  // crossfade entre las dos frases en el mismo bloque local (0-480)
  const fase2 = interpolate(frame, [200, 260], [0, 1], {extrapolateRight: 'clamp'});
  const fase1Out = 1 - interpolate(frame, [170, 230], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      {/* 3D img2threejs: tarjeta perforada IBM 80 col con slots reales + 2 ecos */}
      <ThreeSceneLayer
        createModel={createTarjetasModel}
        orbit={{radius: 8.5, height: 2.8, from: -0.25, to: 0.25, pushIn: 2.4}}
        target={[0, 0, 1.0]}
        patternVariant={0}
      />
      {/* código fondo */}
      <AbsoluteFill
        style={{
          opacity: 0.14,
          fontFamily: 'monospace',
          fontSize: 22,
          color: '#0B63E5',
          padding: 80,
          whiteSpace: 'pre',
          lineHeight: 1.6,
        }}
      >
        {`// 1950 → tarjetas perforadas\n// 1970 → C++  ·  transistors\nfor (token of prompt) model.predict(token);\n// 2017 → attention_is_all_you_need()\n// 2025 → describir lo inimaginable`}
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 230px', gap: 34}}>
        <div style={{opacity: fase1Out, position: fase2 > 0.5 ? 'absolute' : 'relative', padding: '12px 24px', marginBottom: 12}}>
          <KineticText fontSize={110} delay={10}>
            DE TARJETAS
            <br />
            PERFORADAS…
          </KineticText>
        </div>
        {fase2 > 0 && (
          <div style={{opacity: fase2, position: 'relative', overflow: 'hidden', padding: '16px 48px', marginBottom: 12}}>
            <KineticText fontSize={96} delay={210} color="#0A1628">
              …A DESCRIBIR
              <br />
              LO INIMAGINABLE
            </KineticText>
            <LightSweep delay={230} />
          </div>
        )}
        <KineticText fontSize={30} delay={300} color="#5A6B8C" fontWeight={500} style={{marginTop: 26, padding: '10px 28px'}}>
          De C++ a Prompting
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
