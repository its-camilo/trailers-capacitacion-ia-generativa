import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {SceneLayer} from '../../components/SceneLayer';
import {FPS} from '../../constants';

/** Bloque 5 (38-45s): Cierre / CTA. */
export const BloqueCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const destello = interpolate(frame, [30, 70], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <SceneLayer kind="gradient" scaleRange={[1.0, 1.08]} dur={7 * FPS} patternVariant={2} />
      {/* anillos concéntricos */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.35}}>
        {[420, 320, 230].map((r) => (
          <div
            key={r}
            style={{
              position: 'absolute',
              width: r + frame * 0.25,
              height: r + frame * 0.25,
              borderRadius: '50%',
              border: '1px solid rgba(11,99,229,0.35)',
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '40px 230px', gap: 30}}>
        <KineticText fontSize={52} delay={10} style={{marginBottom: 18, padding: '12px 32px'}}>
          SESIÓN 01: FUNDAMENTOS
        </KineticText>
        <div style={{opacity: destello, fontSize: 22, letterSpacing: '0.5em', color: '#0B63E5', fontWeight: 700, marginTop: 18, marginBottom: 18, padding: '8px 16px'}}>
          ━━━━━━━ ✦ ━━━━━━━
        </div>
        <KineticText fontSize={40} delay={50} color="#0B63E5" style={{marginTop: 18, padding: '12px 32px'}}>
          INICIAMOS AHORA
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
