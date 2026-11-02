import type { Action, GameState } from "./types";
import { initialState, reduceGame } from "./engine";
import { reconcile, validate } from "./validation";
import { CONTENT_VERSION } from "./content";
export const STORAGE_KEY = "game";
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("Dein Browser stellt keinen lokalen Speicher bereit."));
      return;
    }
    const req = indexedDB.open("lernquest", 1);
    const timer = setTimeout(
      () =>
        reject(
          new Error(
            "Der Speicher antwortet nicht. Bitte andere App-Tabs schließen.",
          ),
        ),
      5000,
    );
    req.onupgradeneeded = () => {
      req.result.createObjectStore("state");
    };
    req.onerror = () => {
      clearTimeout(timer);
      reject(req.error);
    };
    req.onblocked = () => {
      clearTimeout(timer);
      reject(new Error("Der Speicher ist durch einen anderen Tab blockiert."));
    };
    req.onsuccess = () => {
      clearTimeout(timer);
      resolve(req.result);
    };
  });
}
async function transaction(
  transform?: (state: GameState) => GameState,
  onRecovery?: (recovered: boolean) => void,
): Promise<GameState> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let result: GameState;
    const tx = db.transaction("state", transform ? "readwrite" : "readonly");
    const request = tx.objectStore("state").get(STORAGE_KEY);
    request.onsuccess = () => {
      try {
        const original = request.result
          ? validate(request.result)
          : initialState();
        onRecovery?.(
          original.contentVersion !== CONTENT_VERSION ||
            (!!original.session &&
              original.session.version !== CONTENT_VERSION),
        );
        const state = reconcile(original);
        result = transform ? validate(transform(state)) : state;
        if (transform) tx.objectStore("state").put(result, STORAGE_KEY);
      } catch (error) {
        tx.abort();
        reject(error);
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Speichern fehlgeschlagen."));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Speichern abgebrochen."));
    };
  });
}
export const loadGame = () => transaction();
export async function loadGameWithRecovery(): Promise<{
  state: GameState;
  recovered: boolean;
}> {
  let recovered = false;
  const state = await transaction(
    (s) => s,
    (value) => {
      recovered = value;
    },
  );
  return { state, recovered };
}
export const mutateGame = (action: Action) =>
  transaction((s) => reduceGame(s, action));
export async function saveGame(s: GameState): Promise<void> {
  const state = validate(s),
    db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("state", "readwrite");
    tx.objectStore("state").put(state, STORAGE_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Import nicht gespeichert."));
    };
  });
}
