import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

const STORAGE_PREFIX = 'unidb.tableState.';

const readStorage = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

// Like useState, but persists the value to localStorage under `key` so it
// survives navigation between pages and full page reloads. Pass `null` as the
// key to opt out of persistence (behaves exactly like useState).
const usePersistentState = <T,>(key: string | null, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stored = key ? readStorage<T>(key) : null;
    if (stored !== null) return stored;
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  // Skip writing on the initial mount so an unchanged value isn't re-saved.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!key) return;
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable; keep in-memory state only
    }
  }, [key, value]);

  return [value, setValue];
};

export default usePersistentState;
