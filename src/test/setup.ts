import '@testing-library/jest-dom/vitest';

// Node 22+ ships an experimental `localStorage` global that only works when the
// process is started with --localstorage-file; Vitest's jsdom environment does
// not replace an existing global, so zustand's persist middleware fails with
// "storage.setItem is not a function". Prefer jsdom's storage, else keep a
// tiny in-memory one, so tests behave the same on every Node version.
function isWorkingStorage(candidate: unknown): candidate is Storage {
  return typeof (candidate as Storage | undefined)?.setItem === 'function';
}

if (!isWorkingStorage(globalThis.localStorage)) {
  const jsdomStorage = (globalThis as { window?: Window }).window?.localStorage;
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: isWorkingStorage(jsdomStorage) ? jsdomStorage : memoryStorage,
    configurable: true,
    writable: true,
  });
}
