import React from 'react';
import {AbsoluteFill} from 'remotion';
import {KineticText} from '../components/KineticText';
import {LightSweep} from '../components/LightSweep';
import {ThreeSceneLayer} from '../components/ThreeSceneLayer';

type ThreeProps = React.ComponentProps<typeof ThreeSceneLayer>;

type Props = {
  /** Eyebrow superior (ej. 'SESIÓN 02 · PRÁCTICA MCP'). */
  kicker?: string;
  /** Título gigante (puede llevar <br/>). */
  titulo: React.ReactNode;
  tituloSize?: number;
  /** Subtítulo / frase de apoyo. */
  subtitulo?: React.ReactNode;
  /** Chips estilo [Planear][Actuar][Observar]. */
  chips?: string[];
  /** Nota inferior pequeña (pasos, entregables…). */
  pie?: React.ReactNode;
  /** Fondo 3D img2threejs (opcional; si se omite, solo gradiente claro). */
  fondo3D?: {
    createModel: ThreeProps['createModel'];
    orbit?: ThreeProps['orbit'];
    target?: ThreeProps['target'];
    patternVariant?: number;
  };
  /** Código / textura de fondo (opcional, ej. SQL, pasos). */
  codigoFondo?: string;
  delayBase?: number;
};

/**
 * BloquePlantilla — overlay Keynote LIGHT estándar:
 * kicker → título gigante con LightSweep → chips → subtítulo → pie.
 * Extraído de BloqueHistoria/BloqueAgente/BloqueMcpRag (S01).
 */
export const BloquePlantilla: React.FC<Props> = ({
  kicker,
  titulo,
  tituloSize = 96,
  subtitulo,
  chips,
  pie,
  fondo3D,
  codigoFondo,
  delayBase = 10,
}) => {
  return (
    <AbsoluteFill>
      {fondo3D && (
        <ThreeSceneLayer
          createModel={fondo3D.createModel}
          orbit={fondo3D.orbit}
          target={fondo3D.target}
          patternVariant={fondo3D.patternVariant ?? 0}
        />
      )}
      {codigoFondo && (
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
          {codigoFondo}
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{justifyContent: 'center', alignItems: 'center', padding: '0 230px', gap: 26}}
      >
        {kicker && (
          <KineticText fontSize={34} delay={delayBase} color="#0B63E5" fontWeight={700}>
            {kicker}
          </KineticText>
        )}
        <div style={{position: 'relative', overflow: 'hidden', padding: '16px 48px'}}>
          <KineticText fontSize={tituloSize} delay={delayBase + 40}>
            {titulo}
          </KineticText>
          <LightSweep delay={delayBase + 60} />
        </div>
        {chips && chips.length > 0 && (
          <div style={{display: 'flex', gap: 28, marginTop: 18, padding: '8px 16px'}}>
            {chips.map((c) => (
              <div
                key={c}
                style={{
                  border: '1px solid rgba(11,99,229,0.35)',
                  background: 'rgba(255,255,255,0.88)',
                  padding: '16px 32px',
                  borderRadius: 16,
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#0A1628',
                  WebkitTextStroke: '1px #FFFFFF',
                  boxShadow: '0 12px 40px rgba(11,99,229,0.18)',
                }}
              >
                [{c}]
              </div>
            ))}
          </div>
        )}
        {subtitulo && (
          <KineticText
            fontSize={30}
            delay={delayBase + 160}
            color="#000000"
            fontWeight={700}
            style={{marginTop: 22, padding: '10px 28px'}}
          >
            {subtitulo}
          </KineticText>
        )}
        {pie && (
          <div
            style={{
              marginTop: 14,
              fontSize: 24,
              fontFamily: 'monospace',
              color: '#5A6B8C',
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(11,99,229,0.22)',
              padding: '10px 22px',
              borderRadius: 12,
            }}
          >
            {pie}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
