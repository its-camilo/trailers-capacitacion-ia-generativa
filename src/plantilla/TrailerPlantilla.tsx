import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SoundTrack} from '../components/SoundTrack';
import {COLORES} from '../constants';
import {TIMINGS_PLANTILLA} from './tipos';

type Props = {
  /** Audio de la sesión. Si no existe aún, usa el de S01 como placeholder rítmico. */
  audioSrc?: string;
  /** Exactamente 5 bloques en orden plantilla (0=intro … 4=cierre). */
  bloques: [React.FC, React.FC, React.FC, React.FC, React.FC];
  /** Nombres para Remotion Studio. */
  nombres?: [string, string, string, string, string];
};

/**
 * TrailerPlantilla — shell de 45s extraído de TrailerPrincipal (S01).
 * Cada sesión aporta 5 bloques + audio; la plantilla pone fondo,
 * SoundTrack y las 5 Sequences con timings oficiales.
 *
 * Uso:
 * ```tsx
 * <TrailerPlantilla audioSrc="audio/sesion-02-base.mp3"
 *   bloques={[Intro, Subagentes, Sqlite, Docs, Cierre]} />
 * ```
 */
export const TrailerPlantilla: React.FC<Props> = ({
  audioSrc = 'audio/sesion-01-base.mp3',
  bloques,
  nombres = ['Intro', 'Bloque1', 'Bloque2', 'Bloque3', 'Cierre'],
}) => {
  const [B0, B1, B2, B3, B4] = bloques;
  const comps = [B0, B1, B2, B3, B4];
  return (
    <AbsoluteFill style={{backgroundColor: COLORES.fondo}}>
      <SoundTrack src={audioSrc} />
      {TIMINGS_PLANTILLA.map((t, i) => {
        const Comp = comps[i];
        return (
          <Sequence key={nombres[i]} from={t.from} durationInFrames={t.dur} name={nombres[i]}>
            <Comp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
