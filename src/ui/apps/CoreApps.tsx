/**
 * Apps with dedicated screens.
 * These carry structural clues and require specialized presentation.
 */

import { useState } from "react";
import { AlertTriangle, Ghost, Lock, Play } from "lucide-react";
import { ClueMark, Empty, PhotoAsset, Row, VideoAsset, VoicePlayer, ZoomBlock } from "../phone/Bits";
import PhotoViewerModal from "../phone/PhotoViewerModal";
import type { AppApi } from "./types";
import { useLocale } from "../../i18n/LocaleContext";
import { getLocaleContent } from "../../locales/contentRegistry";

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
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function NotificationsApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const { NOTIFICATIONS } = getLocaleContent(api.localeId).shared;
  const mark = marker(api);
  const [onlyOrphans, setOnlyOrphans] = useState(false);
  const list = onlyOrphans ? NOTIFICATIONS.filter((item) => item.orphan) : NOTIFICATIONS;

  return (
    <div className="list">
      <section className="panel">
        <p className="muted">{t("notifications.retention")}</p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyOrphans}
            onChange={(event) => setOnlyOrphans(event.target.checked)}
          />
          {t("notifications.onlyOrphans")}
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
            <p className="muted">{t("notifications.orphan")}</p>
          )}
          {mark(item.clueId)}
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export function PhotosApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const { PHOTOS } = getLocaleContent(api.localeId).shared;
  const mark = marker(api);
  const [album, setAlbum] = useState("recent");
  const [selected, setSelected] = useState<string>();
  const [viewer, setViewer] = useState<string>();

  const hiddenUnlocked = api.state.solvedLocks.includes("LOCK_006");
  const albums = [
    { id: "recent", label: t("photo.album.recent") },
    { id: "camera", label: t("photo.album.camera") },
    { id: "screenshots", label: t("photo.album.screenshots") },
    { id: "favorites", label: t("photo.album.favorites") },
    { id: "hidden", label: t("photo.album.hidden") },
    { id: "deleted", label: t("photo.album.deleted") },
  ];

  const visible = PHOTOS.filter((photo) => {
    if (photo.hidden && !hiddenUnlocked) return false;
    if (album === "recent") return !photo.hidden && !photo.deleted;
    if (album === "hidden") return photo.hidden === true;
    if (album === "deleted") return photo.deleted === true;
    const albumLabel = albums.find((item) => item.id === album)?.label;
    return photo.album === albumLabel;
  });

  const current = PHOTOS.find((photo) => photo.id === selected);
  // The motion clip lives in the act package because its description is narrative.
  const motion = current?.motionVideo
    ? api.packs.act2?.VIDEOS?.find((video) => video.id === current.motionVideo)
    : undefined;

  return (
    <div className="photos">
      <div className="tabs tabs--scroll">
        {albums.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={album === id ? "is-active" : ""}
            onClick={() => {
              setAlbum(id);
              setSelected(undefined);
              if (id === "hidden" && !hiddenUnlocked) api.requestLock("LOCK_006");
            }}
          >
            {label}
            {id === "hidden" && !hiddenUnlocked ? " 🔒" : ""}
          </button>
        ))}
      </div>

      {album === "hidden" && !hiddenUnlocked && (
        <Empty>
          {api.state.difficulty === "hard"
            ? t("photo.hiddenProtected")
            : t("photo.hiddenHint")}
        </Empty>
      )}

      {!current ? (
        <div className="photos__grid">
          {visible.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelected(photo.id)}
              aria-label={t("photo.openDetails", { file: photo.file })}
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
          {visible.length === 0 && album !== "hidden" && <Empty>{t("photo.none")}</Empty>}
        </div>
      ) : (
        <article className="photo-detail">
          <button type="button" className="btn btn--ghost" onClick={() => setSelected(undefined)}>
            {t("photo.backAlbum")}
          </button>
          <button type="button" className="photo-detail__open" onClick={() => setViewer(current.id)}>
            <PhotoAsset
              photoId={current.id}
              file={current.file}
              alt={current.alt}
              takenAt={current.takenAt}
              album={current.album}
            />
            <span>{t("photo.tapExpand")}</span>
          </button>
          {current.caption && <p className="photo-detail__caption">“{current.caption}”</p>}
          <p className="photo-detail__alt">{current.alt}</p>

          <dl className="meta-grid">
            <div>
              <dt>{t("photo.dateTime")}</dt>
              <dd>{current.takenAt}</dd>
            </div>
            <div>
              <dt>{t("photo.album")}</dt>
              <dd>{current.album}</dd>
            </div>
            <div>
              <dt>{t("photo.file")}</dt>
              <dd>{current.file}</dd>
            </div>
            <div>
              <dt>{t("photo.source")}</dt>
              <dd>{current.device ?? t("photo.camera")}</dd>
            </div>
            {current.gps && <div className="meta-grid__wide"><dt>{t("photo.location")}</dt><dd>{current.gps}</dd></div>}
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

          {/* Motion photo. This is content, not a hint, and appears at both difficulty levels. */}
          {motion && (
            <section className="motion-block">
              <h4>
                <Play size={14} aria-hidden /> {t("photo.motionLabel")}
              </h4>
              <VideoAsset
                videoId={motion.id}
                file={motion.file}
                alt={motion.alt}
                takenAt={motion.takenAt}
                album={motion.album}
                duration={motion.duration}
                posterPhoto={motion.posterPhoto}
                silent={motion.silent}
                onPlay={() => {
                  api.playVideo(motion.id);
                  if (motion.clueId) api.find(motion.clueId);
                }}
              />
              {motion.systemNote && <p className="muted">{motion.systemNote}</p>}
              {api.state.playedVideos.includes(motion.id) && mark(motion.clueId)}
            </section>
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
/* Notes                                                               */
/* ------------------------------------------------------------------ */

export function NotesApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
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
          <AlertTriangle size={14} aria-hidden /> {t("notes.failedAttempts")}
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
              {note.body ? <pre>{note.body}</pre> : <p className="muted">{t("notes.empty")}</p>}
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
          <span className="muted">{unlocked ? locked?.editedAt : t("notes.protected")}</span>
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
/* Recorder                                                            */
/* ------------------------------------------------------------------ */

export function RecorderApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
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
            <Lock size={16} aria-hidden /> {t("app.protected")}
          </h3>
          {api.state.difficulty === "normal" && (
            <p className="muted">{t("recorder.ownerHint")}</p>
          )}
          <p className="muted">{t("recorder.failedAttempts")}</p>
          {mark("CLUE_051")}
          <button type="button" className="btn btn--primary" onClick={() => api.requestLock("LOCK_004")}>
            {t("app.enterCode")}
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
              {played && <span className="voice__done">{t("recorder.listened")}</span>}
            </button>

            {open === voice.id && (
              <div className="voice__body">
                <VoicePlayer localeId={api.localeId} voiceId={voice.id} transcript={voice.transcript} />

                {mark(voice.clueId)}

                {voice.id === "VOICE_004" && excerpt && (
                  <div className="voice__action">
                    <p className="muted">{t("recorder.shareExcerptHelp")}</p>
                    <button type="button" className="btn btn--danger" onClick={api.sendExcerptToFriend}>
                      {t("recorder.shareExcerpt", { label: excerpt.label })}
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
                        ? t("recorder.sentBrother")
                        : t("recorder.sendBrother")}
                    </button>
                    <p className="muted">
                      {t("recorder.sendBrotherHelp")}
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
/* Health                                                              */
/* ------------------------------------------------------------------ */

export function HealthApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const { HEALTH_DAY, HEALTH_TREND, HEART_SERIES } = getLocaleContent(api.localeId).shared;
  const mark = marker(api);
  const max = 130;

  return (
    <div className="list">
      <section className="panel">
        <h3>{HEALTH_DAY.device}</h3>
        <p className="muted">{t("health.lastSync", { date: HEALTH_DAY.lastSync })}</p>
      </section>

      <section className="panel">
        <h3>{t("health.day")}</h3>
        <div className="chart" role="img" aria-label={t("health.chartLabel")}>
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
            <dt>{t("health.steps")}</dt>
            <dd>{HEALTH_DAY.steps}</dd>
          </div>
          <div>
            <dt>{t("health.lastReading")}</dt>
            <dd>{HEALTH_DAY.lastHeartRate}</dd>
          </div>
          <div>
            <dt>{t("health.readingsAfter")}</dt>
            <dd>{HEALTH_DAY.readingsAfter}</dd>
          </div>
          <div>
            <dt>{t("health.sleep")}</dt>
            <dd>{HEALTH_DAY.sleepNextNight}</dd>
          </div>
        </dl>
        <p className="callout callout--danger">{HEALTH_DAY.fallAlert}</p>
        {mark("CLUE_004")}
        {mark("CLUE_004B")}
      </section>

      <section className="panel">
        <h3>{t("health.twelveMonths")}</h3>
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
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export function SettingsApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const { SCREEN_TIME, SETTINGS_ABOUT, SETTINGS_SECURITY, WIFI_NETWORKS } = getLocaleContent(api.localeId).shared;
  const mark = marker(api);

  return (
    <div className="list">
      <section className="panel">
        <h3>{t("device.screenTime")}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>{t("device.period")}</th>
              <th>{t("device.state")}</th>
              <th>{t("device.app")}</th>
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
        <h3>{t("device.about")}</h3>
        {SETTINGS_ABOUT.map((item) => (
          <Row key={item.label} title={item.label} meta={item.value} />
        ))}
        {mark("CLUE_060")}
      </section>

      <section className="panel">
        <h3>{t("device.networks")}</h3>
        {WIFI_NETWORKS.map((net) => {
          // The network name with a surname becomes a clue only when someone can be linked to it.
          const registrable = Boolean(net.clueId);
          return (
            <Row key={net.ssid} title={net.ssid} meta={net.note} flag={registrable}>
              {registrable ? mark(net.clueId) : null}
            </Row>
          );
        })}
      </section>

      <section className="panel">
        <h3>{t("device.security")}</h3>
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
/* Maps                                                                */
/* ------------------------------------------------------------------ */

export function MapsApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const mark = marker(api);
  const pack = api.packs.act2;
  if (!pack) return <Empty>{t("maps.loading")}</Empty>;

  return (
    <div className="list">
      <section className="panel">
        <h3>{t("maps.route")}</h3>
        <ol className="timeline">
          {pack.LOCATION_DAY.map((entry) => (
            <li key={entry.period} className={"flag" in entry && entry.flag ? "is-flag" : ""}>
              <span className="timeline__when">{entry.period}</span>
              <span className="timeline__what">{entry.place}</span>
              <span className="muted">{entry.precision}</span>
            </li>
          ))}
        </ol>
        <p className="callout">{t("maps.routeSummary")}</p>
        {mark("CLUE_006")}
      </section>

      <section className="panel">
        <h3>{t("maps.frequent")}</h3>
        {pack.FREQUENT_PLACES.map((place) => (
          <Row
            key={place.place}
            title={place.place}
            meta={`${t(place.visits === 1 ? "maps.visit" : "maps.visits", { count: place.visits })} · ${place.last}`}
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
/* Cloud storage                                                       */
/* ------------------------------------------------------------------ */

export function FilesApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const mark = marker(api);
  // Open-folder and open-file are independent states: opening a file must not
  // close the folder that contains it.
  const [openFolder, setOpenFolder] = useState<string>();
  const [openFile, setOpenFile] = useState<string>();
  const pack2 = api.packs.act2;
  const pack3 = api.packs.act3;
  if (!pack2) return <Empty>{t("maps.loading")}</Empty>;

  const vaultOpen = api.state.solvedLocks.includes("LOCK_003");
  const zipOpen = api.state.solvedLocks.includes("LOCK_008");
  // Material collected later by forensics appears only in its corresponding act.
  // Inside the locked folder, LOCK_003 filters content, so those nodes belong to Act 2.
  const nodes = pack2.DRIVE.filter((node) => node.act <= api.state.act);

  const docs: Record<string, string | undefined> = {
    DR_CASO_1: pack2.DOC_DESPACHO,
    DR_CASO_2: pack2.DOC_TERMO,
    DR_CASO_3: pack2.DOC_OFICIO_HOSPITAL,
    DR_P22_1: pack3?.DOC_DECLARACAO,
  };

  return (
    <div className="list">
      <div className="drive__storage">
        <p className="muted">{t("files.storage")}</p>
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
                                <h4>{t("files.contradicted")}</h4>
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
                                <p>{t("files.backupIntro")}</p>
                                <ul className="backup">
                                  <li>{t("files.backup.line1")}</li>
                                  <li>{t("files.backup.line2")}</li>
                                  <li>{t("files.backup.line3")}</li>
                                </ul>
                              </>
                            ) : (
                              <p className="muted">{t("files.noPreview")}</p>
                            )}
                            {mark(file.clueId)}
                          </div>
                        )}
                      </article>
                    );
                  })}
                  {children.length === 0 && <p className="muted">{t("files.emptyFolder")}</p>}
                </div>
              )}
            </section>
          );
        })}
    </div>
  );
}
