import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {LightPattern} from './LightPattern';

type Props = {
  /** ruta en public/, ej. blender-renders/sesion-01/escena2_0001.png o .mp4 */
  src?: string;
  /** 'image' | 'video' | 'gradient' (fallback procedural si aún no hay render) */
  kind?: 'image' | 'video' | 'gradient';
  /** opacidad base */
  opacity?: number;
  /** escala cámara virtual */
  scaleRange?: [number, number];
  /** rotación sutil */
  rotateRange?: [number, number];
  /** frame local para el movimiento */
  dur?: number;
  /** variante del patrón claro de fondo (0..3) */
  patternVariant?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * SceneLayer — capa trasera 3D con cámara virtual.
 * Aplica scale + rotateX/Y + perspective para dar profundidad
 * a imágenes PNG transparentes o MP4 renderizados en Blender.
 */
export const SceneLayer: React.FC<Props> = ({
  src,
  kind = 'gradient',
  opacity = 1,
  scaleRange = [1.12, 1.0],
  rotateRange = [-2, 2],
  dur = 600,
  patternVariant = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(t, [0, 1], scaleRange);
  const rotate = interpolate(t, [0, 1], rotateRange);

  return (
    <AbsoluteFill
      style={{
        perspective: 1200,
        overflow: 'hidden',
        backgroundColor: '#F2F5FA',
        ...style,
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) rotateX(${rotate * 0.4}deg) rotateY(${rotate}deg)`,
          transformOrigin: 'center center',
          opacity,
        }}
      >
        {kind === 'gradient' || !src ? (
          <AbsoluteFill
            style={{
              background:
                'radial-gradient(1200px 700px at 50% 20%, rgba(11,99,229,0.14), transparent 60%), radial-gradient(900px 600px at 80% 90%, rgba(91,79,214,0.12), transparent 60%), linear-gradient(180deg, #F2F5FA 0%, #E4EAF3 55%, #F2F5FA 100%)',
            }}
          >
            {/* textura clara procedural (dots + cruces + hatch + blobs) */}
            <LightPattern variant={patternVariant} />
          </AbsoluteFill>
        ) : kind === 'image' ? (
          <Img
            src={staticFile(src)}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : (
          <OffthreadVideo
            src={staticFile(src)}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        )}
      </AbsoluteFill>
      {/* viñeta cinematográfica clara */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(10,22,40,0.16) 100%)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
