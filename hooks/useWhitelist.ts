"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage";
import { normalizeUsername } from "@/lib/instagram/parse";

const KEY = "nstf:whitelist";

function read(): string[] {
  try {
    const raw = storage.get(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeUsername).filter((u): u is string => u !== null);
  } catch {
    return [];
  }
}

export function useWhitelist() {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists after hydration
    setList(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) setList(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (prev: string[]) => string[]) => {
    setList((prev) => {
      const next = fn(prev);
      storage.set(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const ignore = useCallback((u: string) => update((prev) => (prev.includes(u) ? prev : [...prev, u])), [update]);
  const restore = useCallback((u: string) => update((prev) => prev.filter((x) => x !== u)), [update]);
  const set = useMemo(() => new Set(list), [list]);
  const has = useCallback((u: string) => set.has(u), [set]);

  return { list, ignore, restore, has };
}
