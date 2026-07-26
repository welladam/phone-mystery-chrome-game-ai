import { useEffect, useId, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { audioSrc, placeholderTone, photoSrc, videoSrc } from "../../content/assets";
import { useLocale } from "../../i18n/LocaleContext";
import type { TranscriptLine } from "../../engine/types";
import type { LocaleId } from "../../locales/types";

/* ------------------------------------------------------------------ */
/* Marcador de pista                                                   */
/* ------------------------------------------------------------------ */

type ClueMarkProps = {
  clueId: string;
  found: boolean;
  examined: boolean;
  onExamine: (clueId: string) => void;
};

export function ClueMark({ clueId, found, examined, onExamine }: ClueMarkProps) {
  useEffect(() => {
    if (!examined) onExamine(clueId);
  }, [clueId, examined, onExamine]);

  // A descoberta acontece ao visualizar o conteúdo. O jogador não precisa
  // mais apertar um botão artificial para dizer que algo é uma pista.
  void found;
  return null;
}

/* ------------------------------------------------------------------ */
/* Foto com placeholder substituível                                   */
/* ------------------------------------------------------------------ */

type PhotoAssetProps = {
  photoId: string;
  file: string;
  alt: string;
  takenAt: string;
  album: string;
  className?: string;
  onLoad?: (size: { width: number; height: number }) => void;
};

/**
 * Tenta carregar `public/assets/photos/<file>` (o nome real da foto na
 * história). Se o arquivo ainda não existir, desenha um placeholder com os
 * metadados corretos. Trocar a imagem é soltar o arquivo na pasta — nenhuma
 * linha de código muda.
 */
export function PhotoAsset({ photoId, file, alt, takenAt, album, className, onLoad }: PhotoAssetProps) {
  const [failed, setFailed] = useState(false);
  const tone = placeholderTone(photoId);

  if (failed) {
    return (
      <div
        className={`photo-placeholder ${className ?? ""}`}
        role="img"
        aria-label={alt}
        style={{
          background: `linear-gradient(135deg, hsl(${tone.hue} 22% 18%), hsl(${tone.hue2} 26% 12%))`,
        }}
      >
        <span className="photo-placeholder__id">{photoId}</span>
        <span className="photo-placeholder__meta">
          {takenAt} · {album}
        </span>
        <span className="photo-placeholder__alt">{alt}</span>
      </div>
    );
  }

  return (
    <img
      className={`photo-asset ${className ?? ""}`}
      src={photoSrc(file)}
      alt={alt}
      loading="lazy"
      onLoad={(event) =>
        onLoad?.({
          width: event.currentTarget.naturalWidth,
          height: event.currentTarget.naturalHeight,
        })
      }
      onError={() => setFailed(true)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Vídeo com placeholder substituível                                  */
/* ------------------------------------------------------------------ */

type VideoAssetProps = {
  videoId: string;
  file: string;
  alt: string;
  takenAt: string;
  album: string;
  duration: string;
  /** Foto da galeria usada como pôster. */
  posterPhoto?: string;
  silent?: boolean;
  onPlay?: () => void;
};

/**
 * Mesmo contrato do `PhotoAsset`: tenta `public/assets/videos/<file>` e, se o
 * arquivo não existir, desenha o placeholder com os metadados. A descrição fica
 * sempre visível abaixo do player — num vídeo sem áudio ela é a própria pista, e
 * é o que substitui a transcrição de uma gravação de voz.
 */
export function VideoAsset({
  videoId,
  file,
  alt,
  takenAt,
  album,
  duration,
  posterPhoto,
  silent,
  onPlay,
}: VideoAssetProps) {
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);
  const tone = placeholderTone(videoId);
  const altId = useId();

  return (
    <div className="video-asset">
      {failed ? (
        <div
          className="video-placeholder"
          role="img"
          aria-label={alt}
          style={{
            background: `linear-gradient(135deg, hsl(${tone.hue} 22% 18%), hsl(${tone.hue2} 26% 12%))`,
          }}
        >
          <span className="video-placeholder__id">{videoId}</span>
          <span className="video-placeholder__meta">
            {takenAt} · {album} · {duration}
          </span>
          <span className="video-placeholder__alt">{t("video.fileMissing")}</span>
        </div>
      ) : (
        <video
          className="video-asset__player"
          controls
          muted={silent}
          playsInline
          preload="none"
          poster={posterPhoto ? photoSrc(posterPhoto) : undefined}
          src={videoSrc(file)}
          aria-describedby={altId}
          onPlay={onPlay}
          onError={() => setFailed(true)}
        >
          {t("video.unsupported")}
        </video>
      )}
      {silent && <p className="muted video-asset__note">{t("video.silentNote")}</p>}
      <p className="video-asset__alt" id={altId}>
        {alt}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Áudio com transcrição                                               */
/* ------------------------------------------------------------------ */

/**
 * Player usado no Gravador e na Lixeira. A transcrição é sempre a autoridade:
 * ela aparece mesmo quando o arquivo de som não existe.
 */
export function VoicePlayer({
  localeId,
  voiceId,
  transcript,
}: {
  localeId: LocaleId;
  voiceId: string;
  transcript: TranscriptLine[];
}) {
  const { t } = useLocale();
  return (
    <>
      <audio controls preload="none" src={audioSrc(localeId, voiceId)} className="voice__player">
        {t("recorder.unsupported")}
      </audio>
      <p className="muted voice__note">{t("recorder.transcriptAuthority")}</p>
      <ol className="transcript">
        {transcript.map((line, index) => (
          <li key={index}>
            <span className="transcript__t">{line.t}</span>
            <span className="transcript__text">
              {line.who && <strong>{line.who}: </strong>}
              {line.text}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Bloco de zoom                                                       */
/* ------------------------------------------------------------------ */

type ZoomProps = {
  label: string;
  text: string;
  revealed: boolean;
  onZoom: () => void;
};

export function ZoomBlock({ label, text, revealed, onZoom }: ZoomProps) {
  const { t } = useLocale();
  if (!revealed) {
    return (
      <button type="button" className="zoom-btn" onClick={onZoom}>
        <Sparkles size={15} aria-hidden />
        {t("image.enhance")}
      </button>
    );
  }
  return (
    <div className="zoom-result">
      <p className="zoom-result__label">{label}</p>
      <p>{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lista genérica                                                      */
/* ------------------------------------------------------------------ */

export function Row({
  title,
  meta,
  children,
  flag,
}: {
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  flag?: boolean;
}) {
  return (
    <article className={`row${flag ? " row--flag" : ""}`}>
      <div className="row__head">
        <h4>{title}</h4>
        {meta && <span className="row__meta">{meta}</span>}
      </div>
      {children && <div className="row__body">{children}</div>}
    </article>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}
