"use client";

import { useLocale } from "@/hooks/useLocale";
import { GITHUB_URL } from "@/lib/storage";
import { ExternalIcon, LockIcon, WarningIcon } from "./icons";

/** Landing section about the risks of handing your Instagram login to third-party apps. */
export function ThirdPartyRisks() {
  const { t } = useLocale();
  return (
    <section
      id="riesgos"
      aria-labelledby="risks-title"
      className="scroll-mt-12 border-t-3 border-chalk px-4 pt-10 pb-32 md:px-12 md:py-16"
    >
      <p className="font-mono text-xs tracking-[0.08em] text-neon uppercase md:text-sm">{t.risks.eyebrow}</p>
      <h2
        id="risks-title"
        className="mt-2 max-w-[820px] font-display text-[32px] leading-none font-extrabold tracking-[-0.03em] md:text-[52px] md:tracking-[-0.035em]"
      >
        {t.risks.title}
      </h2>
      <p className="mt-4 max-w-[680px] text-base leading-normal text-chalk-dim md:text-lg">{t.risks.intro}</p>

      <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
        <ul className="grid gap-4 md:grid-cols-2">
          {t.risks.items.map((item) => (
            <li key={item.title} className="flex gap-4 border-3 border-neon bg-surface p-5">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center bg-neon text-ink"
              >
                <WarningIcon size={22} />
              </span>
              <div>
                <h3 className="text-lg leading-tight font-bold">{item.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.5] text-chalk-dim">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <aside
          aria-labelledby="protect-title"
          className="flex flex-col gap-4 self-start border-3 border-chalk bg-acid p-5 text-ink shadow-[8px_8px_0_#FF007F] md:p-6"
        >
          <h3 id="protect-title" className="font-display text-2xl leading-none font-extrabold tracking-[-0.02em]">
            {t.risks.protectTitle}
          </h3>
          <ul className="flex flex-col gap-3">
            {t.risks.tips.map((tip) => (
              <li key={tip} className="flex gap-3 text-[15px] leading-[1.45] font-medium">
                <span aria-hidden="true" className="font-mono font-bold">
                  ✓
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t-3 border-ink pt-4">
            <p className="flex gap-3 text-[15px] leading-[1.45]">
              <LockIcon size={20} className="mt-0.5 shrink-0" />
              <span>
                <b>{t.risks.oursTitle}</b> {t.risks.ours}
              </span>
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-bold text-ink underline hover:text-neon"
            >
              {t.risks.github}
              <ExternalIcon size={14} />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
