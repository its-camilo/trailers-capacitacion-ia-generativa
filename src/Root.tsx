import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {BLOQUES, DURACION_TOTAL, FPS, H, W} from './constants';
import {TrailerPrincipal} from './sesiones/sesion-01/TrailerPrincipal';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TrailerSesion01"
        component={TrailerPrincipal}
        durationInFrames={DURACION_TOTAL}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{}}
      />
      {/* Vista previa vertical 1080x1920 (re-encuadre con scale, sin duplicar lógica) */}
      <Composition
        id="TrailerSesion01Vertical"
        component={() => (
          <AbsoluteFill style={{backgroundColor: '#F2F5FA'}}>
            <AbsoluteFill
              style={{
                width: W,
                height: H,
                scale: '0.5625',
                transformOrigin: 'center center',
              }}
            >
              <TrailerPrincipal />
            </AbsoluteFill>
          </AbsoluteFill>
        )}
        durationInFrames={DURACION_TOTAL}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};

// Re-export para tests / studio
export {BLOQUES};
