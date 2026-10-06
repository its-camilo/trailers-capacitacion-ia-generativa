import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {SceneLayer} from '../../components/SceneLayer';
import {FPS} from '../../constants';

/** S02 Bloque 0 (0-8s): Intro sesión. Gradiente LIGHT + anillos (plantilla, sin 3D pesado). */
export const BloqueIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const destello = interpolate(frame, [20, 60], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <SceneLayer kind="gradient" scaleRange={[1.0, 1.06]} dur={8 * FPS} patternVariant={0} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.3}}>
        {[460, 340, 240].map((r) => (
          <div
            key={r}
            style={{
              position: 'absolute',
              width: r + frame * 0.2,
              height: r + frame * 0.2,
              borderRadius: '50%',
              border: '1px solid rgba(11,99,229,0.35)',
            }}
          />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '40px 230px', gap: 24}}>
        <KineticText fontSize={32} delay={10} color="#0B63E5" fontWeight={700}>
          UIFCE · UNAL — CAPACITACIÓN IA GENERATIVA
        </KineticText>
        <KineticText fontSize={120} delay={50}>
          SESIÓN 02
        </KineticText>
        <KineticText fontSize={84} delay={90} color="#0B63E5">
          PRÁCTICA MCP
        </KineticText>
        <div style={{opacity: destello, fontSize: 22, letterSpacing: '0.5em', color: '#0B63E5', fontWeight: 700, padding: '8px 16px'}}>
          ━━━━━━━ ✦ ━━━━━━━
        </div>
        <KineticText fontSize={30} delay={170} color="#000000" fontWeight={700}>
          Conectores — de Northwind a Google Docs
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
