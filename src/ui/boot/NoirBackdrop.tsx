/**
 * Textura compartilhada pelas telas de entrada, carregamento e idioma:
 * grão de filme + scanline (desligados com `reducedMotion`) e uma vinheta
 * estática. Sempre absoluto — quem usa precisa ter `position: relative`.
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
