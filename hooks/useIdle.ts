"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** `true` tras `ms` sin llamar a `reset`. Solo cuenta mientras `enabled`. */
export function useIdle(ms: number, enabled: boolean) {
  const [idle, setIdle] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const reset = useCallback(() => {
    setIdle(false);
    window.clearTimeout(timer.current);
    if (enabled) timer.current = window.setTimeout(() => setIdle(true), ms);
  }, [ms, enabled]);

  useEffect(() => {
    if (enabled) timer.current = window.setTimeout(() => setIdle(true), ms);
    return () => window.clearTimeout(timer.current);
  }, [ms, enabled]);

  return { idle: idle && enabled, reset };
}
