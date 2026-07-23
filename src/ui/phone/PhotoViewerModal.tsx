import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { createPortal } from "react-dom";
import { PhotoAsset } from "./Bits";
import { useLocale } from "../../i18n/LocaleContext";

type Photo = {
  id: string;
  file: string;
  alt: string;
  takenAt: string;
  album: string;
};

type Props = {
  photo: Photo;
  onClose: () => void;
  onExplore: () => void;
};

const clamp = (value: number) => Math.min(5, Math.max(1, value));

export default function PhotoViewerModal({ photo, onClose, onExplore }: Props) {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDivElement>(null);
  const exploredRef = useRef(false);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | undefined>(undefined);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>();
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), [tabindex='0']"),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  function registerExplore(next: number) {
    if (next <= 1 || exploredRef.current) return;
    exploredRef.current = true;
    onExplore();
  }

  function applyScale(nextValue: number) {
    const next = clamp(nextValue);
    setScale(next);
    if (next === 1) setOffset({ x: 0, y: 0 });
    registerExplore(next);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const next = clamp(scale * (event.deltaY < 0 ? 1.15 : 0.87));
    if (next === scale) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const cursor = { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
    const ratio = next / scale;
    setOffset((current) =>
      next === 1
        ? { x: 0, y: 0 }
        : {
            x: cursor.x - (cursor.x - current.x) * ratio,
            y: cursor.y - (cursor.y - current.y) * ratio,
          },
    );
    setScale(next);
    registerExplore(next);
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (scale <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, left: offset.x, top: offset.y };
  }

  function drag(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = dragRef.current;
    if (!origin) return;
    setOffset({ x: origin.left + event.clientX - origin.x, y: origin.top + event.clientY - origin.y });
  }

  function stopDrag(event: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const fittedSize = (() => {
    if (!naturalSize) return undefined;
    const maxWidth = Math.min(viewport.width * 0.92, 1180);
    const maxHeight = Math.max(220, viewport.height * 0.92 - 116);
    const ratio = Math.min(1, maxWidth / naturalSize.width, maxHeight / naturalSize.height);
    return {
      width: Math.round(naturalSize.width * ratio),
      height: Math.round(naturalSize.height * ratio),
    };
  })();

  return createPortal(
    <div
      className="photo-viewer"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="photo-viewer__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("photo.viewerLabel", { file: photo.file })}
        tabIndex={-1}
      >
        <header className="photo-viewer__head">
          <span><Maximize2 size={17} aria-hidden /> {photo.file}</span>
          <span className="photo-viewer__scale">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={onClose} aria-label={t("photo.closeViewer")}><X size={20} aria-hidden /></button>
        </header>
        <div
          className={`photo-viewer__canvas${scale > 1 ? " is-zoomed" : ""}`}
          style={fittedSize}
          onWheel={handleWheel}
          onPointerDown={startDrag}
          onPointerMove={drag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onDoubleClick={() => applyScale(scale === 1 ? 2 : 1)}
        >
          <div className="photo-viewer__image" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}>
            <PhotoAsset
              photoId={photo.id}
              file={photo.file}
              alt={photo.alt}
              takenAt={photo.takenAt}
              album={photo.album}
              onLoad={setNaturalSize}
            />
          </div>
        </div>
        <footer className="photo-viewer__controls" aria-label={t("photo.zoomControls")}>
          <button type="button" onClick={() => applyScale(scale / 1.25)} disabled={scale <= 1} aria-label={t("photo.zoomOut")}><Minus size={18} aria-hidden /></button>
          <button type="button" onClick={() => applyScale(1)} disabled={scale === 1} aria-label={t("photo.zoomReset")}><RotateCcw size={17} aria-hidden /></button>
          <button type="button" onClick={() => applyScale(scale * 1.25)} disabled={scale >= 5} aria-label={t("photo.zoomIn")}><Plus size={18} aria-hidden /></button>
          <p>{t("photo.zoomHelp")}</p>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
