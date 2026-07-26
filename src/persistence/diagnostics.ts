/**
 * Technical log.
 *
 * The player never sees these messages during the game. They exist for the
 * development-only diagnostics panel and for the export button shown on error
 * screens.
 */

import { withStore } from "./db";

export type DiagnosticEvent = {
  id: string;
  at: string;
  category: "runtime" | "download" | "chat" | "storage" | "game" | "translate";
  code: string;
  durationMs?: number;
  details?: Record<string, unknown>;
};

const memoryLog: DiagnosticEvent[] = [];

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function logDiagnostic(event: Omit<DiagnosticEvent, "id" | "at">) {
  const entry: DiagnosticEvent = { id: newId(), at: new Date().toISOString(), ...event };
  memoryLog.push(entry);
  if (memoryLog.length > 400) memoryLog.shift();
  try {
    await withStore<IDBValidKey>("diagnostics", "readwrite", (store) => store.put(entry));
  } catch {
    // Without storage, the log remains in memory and can still be exported.
  }
  return entry;
}

export async function listDiagnostics(): Promise<DiagnosticEvent[]> {
  try {
    const stored = await withStore<DiagnosticEvent[]>("diagnostics", "readonly", (store) => store.getAll());
    return stored.length ? stored : [...memoryLog];
  } catch {
    return [...memoryLog];
  }
}

export async function exportDiagnostics() {
  const data = await listDiagnostics();
  const payload = {
    exportadoEm: new Date().toISOString(),
    agente: typeof navigator !== "undefined" ? navigator.userAgent : "desconhecido",
    contextoSeguro: typeof window !== "undefined" ? window.isSecureContext : undefined,
    eventos: data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `diagnostico-caso-0447-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
