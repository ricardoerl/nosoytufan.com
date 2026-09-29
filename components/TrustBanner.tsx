"use client";

import { Fragment } from "react";
import { useLocale } from "@/hooks/useLocale";

const Sep = ({ small }: { small?: boolean }) => (
  <span aria-hidden="true" className={small ? "size-1.5 shrink-0 bg-ink" : "size-2 shrink-0 bg-ink"} />
);

export function TrustBanner() {
  const { t } = useLocale();
  const full = [t.trust.openSource, t.trust.inBrowser, t.trust.noServers, t.trust.noTheft];
  return (
    <div className="sticky top-0 z-30 border-b-3 border-chalk bg-acid font-mono font-bold uppercase text-ink">
      <p className="sr-only">{t.trust.full}</p>
      <div aria-hidden="true" className="hidden h-11 items-center justify-center gap-7 text-[13px] tracking-[0.06em] whitespace-nowrap lg:flex">
        {full.map((s, i) => (
          <Fragment key={s}>
            {i > 0 && <Sep />}
            <span>{s}</span>
          </Fragment>
        ))}
      </div>
      <div aria-hidden="true" className="flex h-[34px] items-center justify-center gap-2.5 text-[11px] lg:hidden">
        {t.trust.short.map((s, i) => (
          <Fragment key={s}>
            {i > 0 && <Sep small />}
            <span className="whitespace-nowrap">{s}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
