import { useEffect, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { placeholderTone, photoSrc } from "../../content/assets";

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
  alt: string;
  takenAt: string;
  album: string;
  className?: string;
};

/**
 * Tenta carregar `public/assets/photos/<ID>.jpg`. Se o arquivo ainda não
 * existir, desenha um placeholder com os metadados corretos. Trocar a imagem
 * é soltar o arquivo na pasta — nenhuma linha de código muda.
 */
export function PhotoAsset({ photoId, alt, takenAt, album, className }: PhotoAssetProps) {
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
      src={photoSrc(photoId)}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
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
  if (!revealed) {
    return (
      <button type="button" className="zoom-btn" onClick={onZoom}>
        <Sparkles size={15} aria-hidden />
        Aprimorar imagem
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
