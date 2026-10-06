import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
  children: React.ReactNode;
  /** frame local donde empieza la entrada */
  delay?: number;
  /** tamaño tipográfico */
  fontSize?: number;
  /** color */
  color?: string;
  /** peso */
  fontWeight?: number;
  /** tracking */
  letterSpacing?: string;
  /** blur de entrada */
  blurIn?: boolean;
  /** escala continua tipo push-in después de entrar */
  pushIn?: boolean;
  style?: React.CSSProperties;
};

/**
 * Borde de contraste según luminancia del color:
 * texto oscuro y gris medio → borde blanco, texto claro → borde negro.
 * Devuelve el valor para `WebkitTextStroke` o undefined si no aplica.
 */
export function contrastStroke(color: string, fontSize: number): string | undefined {
  const m = color.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return undefined;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const w = Math.max(1, Math.min(4, Math.round(fontSize / 60)));
  if (lum < 0.6) return `${w}px #FFFFFF`;
  if (lum > 0.75) return `${w}px #000000`;
  return `${w}px #FFFFFF`;
}

/**
 * KineticText — tipografía gigante estilo Keynote.
 * Entrada con spring (stiffness 200, damping 15) + escala continua.
 */
export const KineticText: React.FC<Props> = ({
  children,
  delay = 0,
  fontSize = 120,
  color = '#0A1628',
  fontWeight = 800,
  letterSpacing = '-0.04em',
  blurIn = true,
  pushIn = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const entrada = spring({
    frame: local,
    fps,
    config: {stiffness: 200, damping: 15, mass: 0.9},
  });
  const opacity = interpolate(entrada, [0, 0.35], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const y = interpolate(entrada, [0, 1], [90, 0]);
  const scaleIn = interpolate(entrada, [0, 1], [0.86, 1]);
  const scalePush = pushIn
    ? interpolate(local, [0, 90], [1, 1.06], {extrapolateRight: 'clamp'})
    : 1;
  const blur = blurIn ? interpolate(entrada, [0, 0.6], [14, 0]) : 0;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scaleIn * scalePush})`,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        fontSize,
        fontWeight,
        letterSpacing,
        color,
        lineHeight: 1.18,
        textAlign: 'center',
        fontFamily: 'Inter, SF Pro Display, Helvetica Neue, Arial, sans-serif',
        padding: '0.12em 0.3em',
        margin: '0.18em 0',
        WebkitTextStroke: contrastStroke(color, fontSize),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
