import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {SceneLayer} from '../../components/SceneLayer';
import {FPS} from '../../constants';

/** S02 Bloque 4 (38-45s): Cierre + quitar Docs MCP. */
export const BloqueCierre02: React.FC = () => {
  const frame = useCurrentFrame();
  const destello = interpolate(frame, [30, 70], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <SceneLayer kind="gradient" scaleRange={[1.0, 1.08]} dur={7 * FPS} patternVariant={1} />
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
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '40px 230px', gap: 24}}>
        <KineticText fontSize={52} delay={10}>
          SESIÓN 02: PRÁCTICA MCP
        </KineticText>
        <KineticText fontSize={30} delay={60} color="#000000" fontWeight={700}>
          CIERRE: quitar el MCP de Google Docs
        </KineticText>
        <div style={{opacity: destello, fontSize: 22, letterSpacing: '0.5em', color: '#0B63E5', fontWeight: 700, padding: '8px 16px'}}>
          ━━━━━━━ ✦ ━━━━━━━
        </div>
        <KineticText fontSize={40} delay={100} color="#0B63E5">
          NOS VEMOS EN PRÁCTICA
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
