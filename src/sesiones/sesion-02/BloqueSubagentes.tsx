import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createRobotsModel} from '../../threejs/createRobotsModel';

const AGENTES = ['Fintech', 'Datos Públicos', 'Frameworks'];

/** S02 Bloque 1 (8-18s): Ejemplo subagentes economía. 3D robots LIGHT. */
export const BloqueSubagentes: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrada = spring({frame, fps, config: {stiffness: 200, damping: 15}});
  const scaleIn = interpolate(entrada, [0, 1], [2.4, 1]);

  return (
    <AbsoluteFill>
      <ThreeSceneLayer
        createModel={createRobotsModel}
        orbit={{radius: 14.5, height: 7.0, from: -0.5, to: 0.5, pushIn: 1.0}}
        target={[0, -0.2, 0]}
        patternVariant={1}
      />
      {/* guion económico fondo */}
      <AbsoluteFill
        style={{
          opacity: 0.13,
          fontFamily: 'monospace',
          fontSize: 21,
          color: '#0B63E5',
          padding: 80,
          whiteSpace: 'pre',
          lineHeight: 1.6,
        }}
      >
        {`AGENTE 1 · Fintech: rebalanceo / anomalías / asesor\nAGENTE 2 · Datos públicos: BM / OECD / bancos centrales\nAGENTE 3 · Frameworks: CrewAI / AutoGen / FRED MCP`}
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30, padding: '40px 230px'}}>
        <div style={{transform: `scale(${scaleIn})`, opacity: interpolate(entrada, [0, 0.3], [0, 1]), padding: '12px 24px'}}>
          <KineticText fontSize={44} delay={0} color="#0B63E5" fontWeight={700}>
            EJEMPLO · SUBAGENTES
          </KineticText>
        </div>
        <KineticText fontSize={96} delay={30}>
          3 ROBOTS
          <br />
          INVESTIGAN
        </KineticText>
        <div style={{display: 'flex', gap: 28, marginTop: 18, padding: '8px 16px'}}>
          {AGENTES.map((c, i) => {
            const s = spring({frame: Math.max(0, frame - (60 + i * 35)), fps, config: {stiffness: 200, damping: 15}});
            return (
              <div
                key={c}
                style={{
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                  border: '1px solid rgba(11,99,229,0.35)',
                  background: 'rgba(255,255,255,0.88)',
                  padding: '16px 30px',
                  borderRadius: 16,
                  fontSize: 30,
                  fontWeight: 700,
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
        <KineticText fontSize={28} delay={200} color="#000000" fontWeight={700} style={{marginTop: 20, padding: '10px 28px'}}>
          Casos de agentes que automaticen análisis económico
        </KineticText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
