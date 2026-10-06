import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText, contrastStroke} from '../../components/KineticText';
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createDatacenterModel} from '../../threejs/createDatacenterModel';

/** S02 Bloque 3 (28-38s): Bonus Google Docs + entregables. 3D datacenter LIGHT. */
export const BloqueDocs: React.FC = () => {
  const frame = useCurrentFrame();
  const impacto = interpolate(frame, [0, 12], [1.3, 1], {extrapolateRight: 'clamp'});
  const flash = interpolate(frame, [0, 10], [0.7, 0], {extrapolateRight: 'clamp'});
  const fase = Math.floor(frame / 90) % 2; // 0 Docs, 1 Entregables

  return (
    <AbsoluteFill>
      <ThreeSceneLayer
        createModel={createDatacenterModel}
        orbit={{radius: 15.0, height: 6.8, from: -0.5, to: 0.5, pushIn: 1.2}}
        target={[0, 0.0, -0.5]}
        patternVariant={3}
      />
      <AbsoluteFill style={{backgroundColor: `rgba(11,99,229,${flash * 0.2})`}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${impacto})`, padding: '40px 230px', gap: 26}}>
        <KineticText fontSize={44} delay={5} color="#0B63E5" fontWeight={700}>
          PASO 4–6 · BONUS GOOGLE DOCS
        </KineticText>
        <KineticText fontSize={88} delay={30} style={{padding: '12px 24px'}}>
          INFORME EN DRIVE
        </KineticText>
        <div style={{display: 'flex', gap: 30, fontSize: 28, fontWeight: 700, padding: '10px 16px'}}>
          <div
            style={{
              padding: '18px 32px',
              borderRadius: 14,
              border: '1px solid rgba(11,99,229,0.4)',
              background: fase === 0 ? '#0B63E5' : 'rgba(255,255,255,0.88)',
              color: fase === 0 ? '#FFFFFF' : '#0A1628',
              WebkitTextStroke: contrastStroke(fase === 0 ? '#FFFFFF' : '#0A1628', 28),
            }}
          >
            Crear Doc → Probar
          </div>
          <div
            style={{
              padding: '18px 32px',
              borderRadius: 14,
              border: '1px solid rgba(91,79,214,0.4)',
              background: fase === 1 ? '#5B4FD6' : 'rgba(255,255,255,0.88)',
              color: fase === 1 ? '#FFFFFF' : '#0A1628',
              WebkitTextStroke: contrastStroke(fase === 1 ? '#FFFFFF' : '#0A1628', 28),
            }}
          >
            Entregables del equipo
          </div>
        </div>
        <KineticText fontSize={26} delay={120} color="#000000" fontWeight={700} style={{marginTop: 24, padding: '12px 30px'}}>
          {fase === 0 ? '@a-bonus/google-docs-mcp → el modelo escribe en Drive' : 'Informe + tools usadas + sustentación'}
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
