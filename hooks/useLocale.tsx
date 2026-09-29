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

/** Interpolación simple de `{var}`. */
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
  // El HTML estático se genera en español; el idioma real se decide tras hidratar.
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const saved = storage.get(KEY);
    const next: Locale =
      saved === "es" || saved === "en" ? saved : navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detección tras hidratar, a propósito
    setLocaleState(next);
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
