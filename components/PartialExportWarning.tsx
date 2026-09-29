"use client";

import { useLocale } from "@/hooks/useLocale";
import { WarningIcon } from "./icons";

/** Shown when the export only includes recent followers, so the results over-count. */
export function PartialExportWarning({ since, onGuide }: { since: number; onGuide: () => void }) {
  const { t, f, locale } = useLocale();
  const date = new Date(since * 1000).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  return (
    <div
      role="alert"
      className="mx-4 mt-4 flex flex-col gap-4 border-3 border-chalk bg-neon p-4 text-ink md:mx-12 md:mt-7 md:flex-row md:items-center md:gap-5 md:p-5"
    >
      <WarningIcon size={28} className="hidden shrink-0 md:block" />
      <div className="grow">
        <p className="text-lg leading-tight font-bold">{t.partial.title}</p>
        <p className="mt-1 text-[15px] leading-[1.45]">{f(t.partial.body, { date })}</p>
      </div>
      <button
        type="button"
        onClick={onGuide}
        className="h-11 shrink-0 cursor-pointer border-3 border-ink bg-ink px-4 font-bold text-chalk hover:bg-chalk hover:text-ink"
      >
        {t.partial.cta}
      </button>
    </div>
  );
}
