import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

/** Barrido de luz tipo Keynote sobre texto gigante. */
export const LightSweep: React.FC<{delay?: number; dur?: number}> = ({
  delay = 0,
  dur = 90,
}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [delay, delay + dur], [-30, 130], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: '-20%',
        bottom: '-20%',
        left: `${x}%`,
        width: '18%',
        background:
          'linear-gradient(100deg, transparent, rgba(255,255,255,0.22), transparent)',
        filter: 'blur(6px)',
        transform: 'skewX(-12deg)',
        pointerEvents: 'none',
      }}
    />
  );
};
