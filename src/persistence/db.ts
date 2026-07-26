/**
 * IndexedDB layer.
 *
 * Storage errors are common in private browsing, with a full quota, or under
 * corporate policies. They become predictable error-catalog codes here instead
 * of leaking raw exceptions.
 */

const DB_NAME = "clara-caso-0447";
const DB_VERSION = 1;

export type StoreName = "saves" | "diagnostics";

export type StorageErrorCode = "STORAGE_BLOCKED" | "STORAGE_FULL" | "SAVE_CORRUPT" | "UNKNOWN";

export class StorageError extends Error {
  code: StorageErrorCode;

  constructor(code: StorageErrorCode, message?: string) {
    super(message ?? code);
    this.name = "StorageError";
    this.code = code;
  }
}

function classify(error: unknown): StorageErrorCode {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    if (error.name === "QuotaExceededError") return "STORAGE_FULL";
    if (error.name === "SecurityError" || error.name === "InvalidStateError") return "STORAGE_BLOCKED";
  }
  return "UNKNOWN";
}

let dbPromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new StorageError("STORAGE_BLOCKED", "IndexedDB indisponível"));
  }

  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      reject(new StorageError(classify(error)));
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("saves")) db.createObjectStore("saves");
      if (!db.objectStoreNames.contains("diagnostics")) {
        db.createObjectStore("diagnostics", { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = undefined;
      };
      resolve(db);
    };
    request.onerror = () => reject(new StorageError(classify(request.error), request.error?.message));
    request.onblocked = () => reject(new StorageError("STORAGE_BLOCKED", "Outra aba está bloqueando o banco"));
  });

  return dbPromise;
}

export async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction(storeName, mode);
    } catch (error) {
      reject(new StorageError(classify(error)));
      return;
    }

    let request: IDBRequest<T>;
    try {
      request = run(transaction.objectStore(storeName));
    } catch (error) {
      reject(new StorageError(classify(error)));
      return;
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new StorageError(classify(request.error), request.error?.message));
    transaction.onabort = () => reject(new StorageError(classify(transaction.error)));
  });
}

export async function storageAvailable() {
  try {
    await openDatabase();
    return true;
  } catch {
    return false;
  }
}
