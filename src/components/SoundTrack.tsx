import React from 'react';
import {Audio, staticFile} from 'remotion';

type Props = {
  /** archivo en public/audio/. Si no existe aún, no rompe el render. */
  src?: string;
  volume?: number;
};

/**
 * SoundTrack — música + SFX sincronizados a cortes.
 * Uso: <SoundTrack src="audio/sesion-01-base.mp3" />
 * Los golpes (whoosh/impact/glitch) se disparan en cada Bloque
 * con <Audio startFrom={frame} /> adicional si se tienen los stems.
 */
export const SoundTrack: React.FC<Props> = ({
  src = 'audio/sesion-01-base.mp3',
  volume = 0.85,
}) => {
  return (
    <>
      {/* Pista base. Remotion ignora silenciosamente si el archivo falta en preview,
          pero fallará en render — ver public/audio/README. */}
      <Audio src={staticFile(src)} volume={volume} />
    </>
  );
};
