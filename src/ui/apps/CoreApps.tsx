/**
 * Aplicativos com tela dedicada.
 * São os que carregam as pistas estruturais e precisam de leitura própria.
 */

import { useState } from "react";
import { AlertTriangle, Ghost, Lock, Play } from "lucide-react";
import {
  HEALTH_DAY,
  HEALTH_TREND,
  HEART_SERIES,
  NOTIFICATIONS,
  PHOTOS,
  SCREEN_TIME,
  SETTINGS_ABOUT,
  SETTINGS_SECURITY,
  WIFI_NETWORKS,
} from "../../content/shared";
import { audioSrc } from "../../content/assets";
import { ClueMark, Empty, PhotoAsset, Row, ZoomBlock } from "../phone/Bits";
import PhotoViewerModal from "../phone/PhotoViewerModal";
import type { AppApi } from "./types";

function marker(api: AppApi) {
  return (clueId?: string) =>
    clueId ? (
      <ClueMark
        clueId={clueId}
        found={api.state.cluesFound.includes(clueId)}
        examined={api.state.cluesExamined.includes(clueId)}
        onExamine={api.examine}
      />
    ) : null;
}

/* ------------------------------------------------------------------ */
/* Notificações                                                        */
/* ------------------------------------------------------------------ */

export function NotificationsApp({ api }: { api: AppApi }) {
  const mark = marker(api);
  const [onlyOrphans, setOnlyOrphans] = useState(false);
  const list = onlyOrphans ? NOTIFICATIONS.filter((item) => item.orphan) : NOTIFICATIONS;

  return (
    <div className="list">
      <section className="panel">
        <p className="muted">
          Retenção estendida ativada em 14/10/2025 — 120 dias. É por isso que as prévias de 8 de
          março ainda existem.
        </p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyOrphans}
            onChange={(event) => setOnlyOrphans(event.target.checked)}
          />
          Mostrar só prévias sem mensagem correspondente
        </label>
      </section>

      {list.map((item) => (
        <Row
          key={item.id}
          title={
            <span className="notif">
              {item.orphan && <Ghost size={14} aria-hidden />}
              {item.from}
            </span>
          }
          meta={`${item.at} · ${item.app}`}
          flag={item.orphan}
        >
          <p className="quote">{item.preview}</p>
          {item.orphan && (
            <p className="muted">
              Esta prévia não corresponde a nenhuma mensagem existente na conversa.
            </p>
          )}
          {mark(item.clueId)}
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Galeria                                                             */
/* ------------------------------------------------------------------ */

export function PhotosApp({ api }: { api: AppApi }) {
  const mark = marker(api);
  const [album, setAlbum] = useState("Recentes");
  const [selected, setSelected] = useState<string>();
  const [viewer, setViewer] = useState<string>();

  const hiddenUnlocked = api.state.solvedLocks.includes("LOCK_006");

  const visible = PHOTOS.filter((photo) => {
    if (photo.hidden && !hiddenUnlocked) return false;
    if (album === "Recentes") return !photo.hidden && !photo.deleted;
    if (album === "Oculto") return photo.hidden === true;
    if (album === "Recentemente apagados") return photo.deleted === true;
    return photo.album === album;
  });

  const albums = ["Recentes", "Câmera", "Capturas de tela", "Favoritos", "Oculto", "Recentemente apagados"];
  const current = PHOTOS.find((photo) => photo.id === selected);

  return (
    <div className="photos">
      <div className="tabs tabs--scroll">
        {albums.map((name) => (
          <button
            key={name}
            type="button"
            className={album === name ? "is-active" : ""}
            onClick={() => {
              setAlbum(name);
              setSelected(undefined);
              if (name === "Oculto" && !hiddenUnlocked) api.requestLock("LOCK_006");
            }}
          >
            {name}
            {name === "Oculto" && !hiddenUnlocked ? " 🔒" : ""}
          </button>
        ))}
      </div>

      {album === "Oculto" && !hiddenUnlocked && (
        <Empty>
          {api.state.difficulty === "hard"
            ? "Álbum protegido. Insira o código para acessar."
            : "Álbum protegido. A dica pede “o dia mais importante do ano”."}
        </Empty>
      )}

      {!current ? (
        <div className="photos__grid">
          {visible.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelected(photo.id)}
              aria-label={`Abrir detalhes de ${photo.file}`}
            >
              <PhotoAsset
                photoId={photo.id}
                file={photo.file}
                alt={photo.alt}
                takenAt={photo.takenAt}
                album={photo.album}
                className="photos__thumb"
              />
              <span className="photos__stamp">{photo.takenAt}</span>
            </button>
          ))}
          {visible.length === 0 && album !== "Oculto" && <Empty>Nenhuma foto neste álbum.</Empty>}
        </div>
      ) : (
        <article className="photo-detail">
          <button type="button" className="btn btn--ghost" onClick={() => setSelected(undefined)}>
            ← Voltar para o álbum
          </button>
          <button type="button" className="photo-detail__open" onClick={() => setViewer(current.id)}>
            <PhotoAsset
              photoId={current.id}
              file={current.file}
              alt={current.alt}
              takenAt={current.takenAt}
              album={current.album}
            />
            <span>Toque para ampliar</span>
          </button>
          {current.caption && <p className="photo-detail__caption">“{current.caption}”</p>}
          <p className="photo-detail__alt">{current.alt}</p>

          <dl className="meta-grid">
            <div>
              <dt>Data e hora</dt>
              <dd>{current.takenAt}</dd>
            </div>
            <div>
              <dt>Álbum</dt>
              <dd>{current.album}</dd>
            </div>
            <div>
              <dt>Arquivo</dt>
              <dd>{current.file}</dd>
            </div>
            <div>
              <dt>Origem</dt>
              <dd>{current.device ?? "Câmera do aparelho"}</dd>
            </div>
            {current.gps && <div className="meta-grid__wide"><dt>Localização</dt><dd>{current.gps}</dd></div>}
          </dl>

          {current.zoom && api.state.difficulty === "normal" && (
            <ZoomBlock
              label={current.zoom.label}
              text={current.zoom.text}
              revealed={api.state.zoomed.includes(current.id)}
              onZoom={() => {
                api.zoom(current.id);
                if (current.zoom?.clueId) api.find(current.zoom.clueId);
              }}
            />
          )}

          {mark(current.clueId)}
          {api.state.zoomed.includes(current.id) && current.zoom?.clueId && mark(current.zoom.clueId)}
        </article>
      )}

      {viewer && (() => {
        const photo = PHOTOS.find((item) => item.id === viewer);
        if (!photo) return null;
        return (
          <PhotoViewerModal
            photo={photo}
            onClose={() => setViewer(undefined)}
            onExplore={() => {
              api.zoom(photo.id);
              if (photo.zoom?.clueId) api.find(photo.zoom.clueId);
            }}
          />
        );
      })()}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notas                                                               */
/* ------------------------------------------------------------------ */

export function NotesApp({ api }: { api: AppApi }) {
  const mark = marker(api);
  const [open, setOpen] = useState<string>();
  const notes = api.packs.act1?.NOTES_OPEN ?? [];
  const locked = api.packs.act2?.NOTE_LOCKED;
  const endnote = api.packs.act2?.NOTE_LOCKED_ENDNOTE;
  const unlocked = api.state.solvedLocks.includes("LOCK_002");

  return (
    <div className="list">
      <section className="panel panel--warn">
        <p>
          <AlertTriangle size={14} aria-hidden /> Tentativas registradas: 3 falhas em 08/03/2026,
          20h24.
        </p>
        {mark("CLUE_053")}
      </section>

      {notes.map((note) => (
        <article key={note.id} className="note">
          <button type="button" className="note__head" onClick={() => setOpen(open === note.id ? undefined : note.id)}>
            <span>{note.title}</span>
            <span className="muted">{note.editedAt}</span>
          </button>
          {open === note.id && (
            <div className="note__body">
              {note.body ? <pre>{note.body}</pre> : <p className="muted">Nota sem conteúdo. Só o título.</p>}
              {mark(note.clueId)}
            </div>
          )}
        </article>
      ))}

      <article className="note note--locked">
        <button
          type="button"
          className="note__head"
          onClick={() => (unlocked ? setOpen(open === "NOTE_004" ? undefined : "NOTE_004") : api.requestLock("LOCK_002"))}
        >
          <span>
            {!unlocked && <Lock size={13} aria-hidden />} {locked?.title ?? "22/06"}
          </span>
          <span className="muted">{unlocked ? locked?.editedAt : "protegida"}</span>
        </button>
        {unlocked && open === "NOTE_004" && locked && (
          <div className="note__body">
            <pre>{locked.body}</pre>
            <p className="note__endnote">{endnote}</p>
            {mark(locked.clueId)}
          </div>
        )}
      </article>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gravador                                                            */
/* ------------------------------------------------------------------ */

export function RecorderApp({ api }: { api: AppApi }) {
  const mark = marker(api);
  const [open, setOpen] = useState<string>();
  const unlocked = api.state.solvedLocks.includes("LOCK_004");
  const voices = api.packs.act3?.VOICES ?? [];
  const excerpt = api.packs.act3?.DECISIVE_EXCERPT;

  if (!unlocked) {
    return (
      <div className="list">
        <section className="panel panel--warn">
          <h3>
            <Lock size={16} aria-hidden /> Este aplicativo está protegido
          </h3>
          {api.state.difficulty === "normal" && (
            <p className="muted">Dica definida pela titular: “a data que eu devia ter respeitado”.</p>
          )}
          <p className="muted">Tentativas registradas: 2 falhas em 08/03/2026, 20h29.</p>
          {mark("CLUE_051")}
          <button type="button" className="btn btn--primary" onClick={() => api.requestLock("LOCK_004")}>
            Inserir código
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="list">
      {voices.map((voice) => {
        const played = api.state.playedVoices.includes(voice.id);
        return (
          <article key={voice.id} className="voice">
            <button
              type="button"
              className="voice__head"
              onClick={() => {
                setOpen(open === voice.id ? undefined : voice.id);
                api.playVoice(voice.id);
                if (voice.clueId) api.find(voice.clueId);
              }}
            >
              <span className="voice__play">
                <Play size={16} aria-hidden />
              </span>
              <span className="voice__title">
                <strong>{voice.file}</strong>
                <span className="muted">
                  {voice.at} · {voice.duration}
                </span>
              </span>
              {played && <span className="voice__done">ouvido</span>}
            </button>

            {open === voice.id && (
              <div className="voice__body">
                <audio controls preload="none" src={audioSrc(voice.id)} className="voice__player">
                  Seu navegador não reproduz áudio. A transcrição completa está abaixo.
                </audio>
                <p className="muted voice__note">
                  O arquivo de áudio é opcional. A transcrição abaixo é a fonte oficial do conteúdo.
                </p>
                <ol className="transcript">
                  {voice.transcript.map((line, index) => (
                    <li key={index}>
                      <span className="transcript__t">{line.t}</span>
                      <span className="transcript__text">
                        {line.who && <strong>{line.who}: </strong>}
                        {line.text}
                      </span>
                    </li>
                  ))}
                </ol>

                {mark(voice.clueId)}

                {voice.id === "VOICE_004" && excerpt && (
                  <div className="voice__action">
                    <p className="muted">
                      Você pode enviar um trecho desta gravação para alguém, dentro do aplicativo de
                      conversa.
                    </p>
                    <button type="button" className="btn btn--danger" onClick={api.sendExcerptToFriend}>
                      Enviar {excerpt.label} para Alice
                    </button>
                  </div>
                )}

                {voice.id === "VOICE_003" && (
                  <div className="voice__action">
                    <button
                      type="button"
                      className="btn"
                      onClick={api.sendAudioToDiego}
                      disabled={api.state.sentAudioToDiego}
                    >
                      {api.state.sentAudioToDiego
                        ? "Áudio enviado ao irmão da vítima"
                        : "Enviar este áudio ao irmão da vítima"}
                    </button>
                    <p className="muted">
                      Não altera a investigação. Ela gravou isso para ser ouvido.
                    </p>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Saúde                                                               */
/* ------------------------------------------------------------------ */

export function HealthApp({ api }: { api: AppApi }) {
  const mark = marker(api);
  const max = 130;

  return (
    <div className="list">
      <section className="panel">
        <h3>{HEALTH_DAY.device}</h3>
        <p className="muted">Última sincronização: {HEALTH_DAY.lastSync}</p>
      </section>

      <section className="panel">
        <h3>Domingo, 8 de março</h3>
        <div className="chart" role="img" aria-label="Frequência cardíaca do dia, com interrupção às 19h58">
          {HEART_SERIES.map((point) => (
            <div key={point.time} className="chart__col">
              <div
                className={`chart__bar${point.bpm === null ? " chart__bar--none" : ""}`}
                style={point.bpm === null ? undefined : { height: `${(point.bpm / max) * 100}%` }}
              />
              <span className="chart__label">{point.time}</span>
            </div>
          ))}
        </div>
        <dl className="meta-grid">
          <div>
            <dt>Passos</dt>
            <dd>{HEALTH_DAY.steps}</dd>
          </div>
          <div>
            <dt>Última leitura</dt>
            <dd>{HEALTH_DAY.lastHeartRate}</dd>
          </div>
          <div>
            <dt>Leituras após 19h58</dt>
            <dd>{HEALTH_DAY.readingsAfter}</dd>
          </div>
          <div>
            <dt>Sono na noite seguinte</dt>
            <dd>{HEALTH_DAY.sleepNextNight}</dd>
          </div>
        </dl>
        <p className="callout callout--danger">{HEALTH_DAY.fallAlert}</p>
        {mark("CLUE_004")}
        {mark("CLUE_004B")}
      </section>

      <section className="panel">
        <h3>Doze meses</h3>
        {HEALTH_TREND.map((item) => (
          <Row key={item.metric} title={item.metric} meta={item.window}>
            <p className="muted">
              {item.before} → <strong>{item.after}</strong>
            </p>
            {mark(item.clueId)}
          </Row>
        ))}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ajustes                                                             */
/* ------------------------------------------------------------------ */

export function SettingsApp({ api }: { api: AppApi }) {
  const mark = marker(api);

  return (
    <div className="list">
      <section className="panel">
        <h3>Tempo de uso · 08/03/2026</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Período</th>
              <th>Estado</th>
              <th>Aplicativo</th>
            </tr>
          </thead>
          <tbody>
            {SCREEN_TIME.map((row) => (
              <tr key={row.period} className={"flag" in row && row.flag ? "is-flag" : ""}>
                <td>{row.period}</td>
                <td>{row.state}</td>
                <td>{row.app}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mark("CLUE_005")}
        {mark("CLUE_048")}
      </section>

      <section className="panel">
        <h3>Sobre o aparelho</h3>
        {SETTINGS_ABOUT.map((item) => (
          <Row key={item.label} title={item.label} meta={item.value} />
        ))}
        {mark("CLUE_060")}
      </section>

      <section className="panel">
        <h3>Redes memorizadas</h3>
        {WIFI_NETWORKS.map((net) => {
          // A rede com sobrenome só vira pista quando há a quem associá-la.
          const registrable = Boolean(net.clueId);
          return (
            <Row key={net.ssid} title={net.ssid} meta={net.note} flag={registrable}>
              {registrable ? mark(net.clueId) : null}
            </Row>
          );
        })}
      </section>

      <section className="panel">
        <h3>Segurança e backup</h3>
        {SETTINGS_SECURITY.map((item) => (
          <Row key={item.label} title={item.label} meta={item.value}>
            {item.note && <p className="muted">{item.note}</p>}
          </Row>
        ))}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mapas                                                               */
/* ------------------------------------------------------------------ */

export function MapsApp({ api }: { api: AppApi }) {
  const mark = marker(api);
  const pack = api.packs.act2;
  if (!pack) return <Empty>Carregando…</Empty>;

  return (
    <div className="list">
      <section className="panel">
        <h3>Trajeto de 8 de março</h3>
        <ol className="timeline">
          {pack.LOCATION_DAY.map((entry) => (
            <li key={entry.period} className={"flag" in entry && entry.flag ? "is-flag" : ""}>
              <span className="timeline__when">{entry.period}</span>
              <span className="timeline__what">{entry.place}</span>
              <span className="muted">{entry.precision}</span>
            </li>
          ))}
        </ol>
        <p className="callout">
          Onze horas sem um metro de deslocamento — e, sobreposto a isso, quase quarenta minutos de
          tela ligada.
        </p>
        {mark("CLUE_006")}
      </section>

      <section className="panel">
        <h3>Locais frequentes</h3>
        {pack.FREQUENT_PLACES.map((place) => (
          <Row
            key={place.place}
            title={place.place}
            meta={`${place.visits} ${place.visits === 1 ? "visita" : "visitas"} · ${place.last}`}
            flag={"flag" in place && Boolean(place.flag)}
          >
            {mark(place.clueId)}
          </Row>
        ))}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nuvem                                                               */
/* ------------------------------------------------------------------ */

export function FilesApp({ api }: { api: AppApi }) {
  const mark = marker(api);
  // Pasta aberta e arquivo aberto são estados independentes: abrir um arquivo
  // não pode fechar a pasta que o contém.
  const [openFolder, setOpenFolder] = useState<string>();
  const [openFile, setOpenFile] = useState<string>();
  const pack2 = api.packs.act2;
  const pack3 = api.packs.act3;
  if (!pack2) return <Empty>Carregando…</Empty>;

  const vaultOpen = api.state.solvedLocks.includes("LOCK_003");
  const zipOpen = api.state.solvedLocks.includes("LOCK_008");
  const nodes = pack2.DRIVE;

  const docs: Record<string, string | undefined> = {
    DR_CASO_1: pack2.DOC_DESPACHO,
    DR_CASO_2: pack2.DOC_TERMO,
    DR_P22_1: pack3?.DOC_DECLARACAO,
  };

  return (
    <div className="list">
      <div className="drive__storage">
        <p className="muted">Drive · 14,6 GB de 15 GB</p>
        <div className="drive__bar">
          <span style={{ width: "97%" }} />
        </div>
      </div>

      {nodes
        .filter((node) => !node.parent)
        .map((folder) => {
          const children = nodes.filter((node) => node.parent === folder.id);
          const isVault = folder.lock === "LOCK_003";
          const locked = isVault && !vaultOpen;

          return (
            <section key={folder.id} className="folder">
              <button
                type="button"
                className="folder__head"
                onClick={() =>
                  locked
                    ? api.requestLock("LOCK_003")
                    : setOpenFolder(openFolder === folder.id ? undefined : folder.id)
                }
              >
                {locked && <Lock size={13} aria-hidden />} 📁 {folder.name}
                {folder.meta && <span className="muted"> · {folder.meta}</span>}
              </button>

              {openFolder === folder.id && !locked && (
                <div className="folder__body">
                  {children.map((file) => {
                    const isZip = file.lock === "LOCK_008";
                    const zipLocked = isZip && !zipOpen;
                    const doc = docs[file.id];

                    return (
                      <article key={file.id} className="file">
                        <button
                          type="button"
                          className="file__head"
                          onClick={() =>
                            zipLocked
                              ? api.requestLock("LOCK_008")
                              : setOpenFile(openFile === file.id ? undefined : file.id)
                          }
                        >
                          {zipLocked && <Lock size={12} aria-hidden />} {file.name}
                        </button>

                        {openFile === file.id && doc && (
                          <div className="file__body">
                            <pre>{doc}</pre>
                            {file.id === "DR_CASO_1" && (
                              <div className="flaws">
                                <h4>Afirmações contrariadas pelos dados do aparelho</h4>
                                {pack2.DESPACHO_FLAWS.map((flaw) => (
                                  <Row key={flaw.id} title={flaw.quote}>
                                    <p>{flaw.counter}</p>
                                  </Row>
                                ))}
                                {mark("CLUE_067")}
                              </div>
                            )}
                            {mark(file.clueId)}
                          </div>
                        )}

                        {openFile === file.id && !doc && !zipLocked && (
                          <div className="file__body">
                            {isZip ? (
                              <>
                                <p>
                                  Cópia automática da conversa feita às 19h30 de 8 de março — 28
                                  minutos antes da morte e 41 minutos antes de a conversa ser
                                  apagada. As três mensagens do dia estão íntegras, com carimbo de
                                  recebimento.
                                </p>
                                <ul className="backup">
                                  <li>
                                    <strong>15h48</strong> — preciso te falar hoje. pessoalmente.
                                    pedra lascada 19h30?
                                  </li>
                                  <li>
                                    <strong>16h02</strong> — ai clara…. tá bom. 19h30
                                  </li>
                                  <li>
                                    <strong>18h27</strong> — to saindo daqui a pouco. me espera lá em
                                    cima
                                  </li>
                                </ul>
                              </>
                            ) : (
                              <p className="muted">Arquivo sem visualização direta.</p>
                            )}
                            {mark(file.clueId)}
                          </div>
                        )}
                      </article>
                    );
                  })}
                  {children.length === 0 && <p className="muted">Pasta vazia neste ponto da perícia.</p>}
                </div>
              )}
            </section>
          );
        })}
    </div>
  );
}
