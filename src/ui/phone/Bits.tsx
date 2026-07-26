import { useEffect, useId, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { audioSrc, placeholderTone, photoSrc, videoSrc } from "../../content/assets";
import { useLocale } from "../../i18n/LocaleContext";
import type { TranscriptLine } from "../../engine/types";
import type { LocaleId } from "../../locales/types";

/* ------------------------------------------------------------------ */
/* Clue marker                                                         */
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

  // Discovery happens when content is viewed. The player no longer needs to
  // press an artificial button to declare that something is a clue.
  void found;
  return null;
}

/* ------------------------------------------------------------------ */
/* Photo with replaceable placeholder                                 */
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
 * Tries to load `public/assets/photos/<file>` using the photo's real story name.
 * If the file does not exist yet, draws a placeholder with the correct metadata.
 * Replacing the image means dropping the file into the folder; no code changes.
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
/* Video with replaceable placeholder                                 */
/* ------------------------------------------------------------------ */

type VideoAssetProps = {
  videoId: string;
  file: string;
  alt: string;
  takenAt: string;
  album: string;
  duration: string;
  /** Gallery photo used as the poster. */
  posterPhoto?: string;
  silent?: boolean;
  onPlay?: () => void;
};

/**
 * Same contract as `PhotoAsset`: tries `public/assets/videos/<file>` and draws
 * the metadata placeholder when the file is absent. The description always
 * remains visible below the player; in a silent video it is the clue itself and
 * replaces a voice recording transcript.
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
/* Audio with transcript                                               */
/* ------------------------------------------------------------------ */

/**
 * Player used in the Recorder and Trash. The transcript is always authoritative
 * and appears even when the audio file does not exist.
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
/* Zoom block                                                          */
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
/* Generic list                                                        */
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
