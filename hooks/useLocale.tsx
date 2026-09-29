"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import es from "@/i18n/es.json";
import en from "@/i18n/en.json";
import { storage } from "@/lib/storage";

export type Locale = "es" | "en";
export type Dict = typeof es;

const DICTS: Record<Locale, Dict> = { es, en };
const KEY = "nstf:locale";

type Vars = Record<string, string | number>;

/** Simple `{var}` interpolation. */
export function format(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  f: typeof format;
}

const Ctx = createContext<LocaleCtx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Spanish is the default; English only applies once the user picks it (restored after hydration).
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved choice after hydration
    if (storage.get(KEY) === "en") setLocaleState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    storage.set(KEY, l);
  }, []);

  const value = useMemo(() => ({ locale, setLocale, t: DICTS[locale], f: format }), [locale, setLocale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale fuera de LocaleProvider");
  return ctx;
}
