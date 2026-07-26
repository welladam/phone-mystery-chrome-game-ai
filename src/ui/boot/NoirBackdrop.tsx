/**
 * Texture shared by the entry, loading, and language screens: film grain plus
 * scanline (disabled by `reducedMotion`) and a static vignette. Always absolute,
 * so consumers must use `position: relative`.
 */
export default function NoirBackdrop({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="noir-backdrop" aria-hidden="true">
      {!reducedMotion && <div className="noir-backdrop__grain" />}
      {!reducedMotion && (
        <div className="noir-backdrop__scanline-track">
          <div className="noir-backdrop__scanline" />
        </div>
      )}
      <div className="noir-backdrop__vignette" />
    </div>
  );
}
