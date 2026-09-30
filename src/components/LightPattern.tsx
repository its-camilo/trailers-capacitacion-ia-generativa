import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

type Props = {
  /** 0..3: desplaza la composición para dar variedad entre bloques */
  variant?: number;
  /** opacidad global del patrón */
  opacity?: number;
};

/**
 * LightPattern — textura procedural para fondos claros Keynote.
 * 100% CSS/SVG determinista (sin assets): dots + cruces + hatch diagonal
 * + blobs suaves, con deriva lenta por frame. Vive encima del fondo
 * 3D o del degradado y debajo de la viñeta y los textos.
 */
export const LightPattern: React.FC<Props> = ({variant = 0, opacity = 1}) => {
  const frame = useCurrentFrame();
  const dx = interpolate(frame, [0, 600], [0, -26], {extrapolateRight: 'clamp'});
  const dy = interpolate(frame, [0, 600], [0, 16], {extrapolateRight: 'clamp'});
  const v = variant % 4;
  const blobA = ['30% 18%', '70% 22%', '25% 75%', '75% 70%'][v];
  const blobB = ['80% 85%', '20% 80%', '75% 20%', '22% 25%'][v];

  const plusSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cpath d='M96 84h8v-16a4 4 0 0 1 8 0v16h16a4 4 0 0 1 0 8h-16v16a4 4 0 0 1-8 0V92h-8z' fill='%230B63E5' fill-opacity='0.20'/%3E%3Ccircle cx='160' cy='150' r='3' fill='%235B4FD6' fill-opacity='0.22'/%3E%3C/svg%3E")`;

  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      {/* blobs suaves azul / violeta */}
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(560px 380px at ${blobA}, rgba(11,99,229,0.13), transparent 65%),` +
            `radial-gradient(640px 420px at ${blobB}, rgba(91,79,214,0.11), transparent 65%)`,
        }}
      />
      {/* hatch diagonal muy sutil */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(11,99,229,0.055) 0 2px, transparent 2px 26px)',
          transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(1.06)`,
        }}
      />
      {/* dots con deriva */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(11,99,229,0.20) 1.6px, transparent 1.7px)',
          backgroundSize: '32px 32px',
          transform: `translate(${dx}px, ${dy}px) scale(1.06)`,
          maskImage:
            'radial-gradient(1000px 620px at 50% 45%, black 25%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(1000px 620px at 50% 45%, black 25%, transparent 78%)',
        }}
      />
      {/* cruces decorativas */}
      <AbsoluteFill
        style={{
          backgroundImage: plusSvg,
          backgroundSize: '200px 200px',
          transform: `translate(${dx * 1.6}px, ${dy * 1.6}px) scale(1.06)`,
          maskImage:
            'radial-gradient(900px 560px at 50% 50%, black 20%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(900px 560px at 50% 50%, black 20%, transparent 75%)',
        }}
      />
    </AbsoluteFill>
  );
};
