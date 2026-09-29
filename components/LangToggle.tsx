"use client";

import { useLocale, type Locale } from "@/hooks/useLocale";

export function LangToggle() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div role="group" aria-label={t.header.language} className="flex shrink-0 border-3 border-chalk">
      {(["es", "en"] as Locale[]).map((l) => {
        const on = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={on}
            onClick={() => setLocale(l)}
            className={`h-11 min-w-11 cursor-pointer font-mono text-sm font-bold uppercase ${
              on ? "bg-chalk text-ink" : "bg-transparent text-chalk hover:bg-surface-2"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
