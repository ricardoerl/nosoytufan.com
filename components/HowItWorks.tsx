"use client";

import { useLocale } from "@/hooks/useLocale";
import { GITHUB_URL } from "@/lib/storage";
import { CodeIcon, DeviceIcon, ExternalIcon, GhostIcon, LockIcon } from "./icons";

const ICONS = [DeviceIcon, LockIcon, CodeIcon, GhostIcon];
const ACCENTS = ["bg-acid", "bg-neon", "bg-chalk", "bg-acid"];

/** Landing section that explains how the app works and why it is safe to use. */
export function HowItWorks() {
  const { t } = useLocale();
  return (
    <section
      id="como-funciona"
      aria-labelledby="how-title"
      className="scroll-mt-12 border-t-3 border-chalk px-4 py-10 md:px-12 md:py-16"
    >
      <p className="font-mono text-xs tracking-[0.08em] text-acid uppercase md:text-sm">{t.about.eyebrow}</p>
      <h2
        id="how-title"
        className="mt-2 max-w-[760px] font-display text-[32px] leading-none font-extrabold tracking-[-0.03em] md:text-[52px] md:tracking-[-0.035em]"
      >
        {t.about.title}
      </h2>
      <p className="mt-4 max-w-[640px] text-base leading-normal text-chalk-dim md:text-lg">{t.about.intro}</p>

      <ul className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 lg:grid-cols-4">
        {t.about.items.map((item, i) => {
          const Icon = ICONS[i] ?? LockIcon;
          return (
            <li key={item.title} className="flex flex-col gap-4 border-3 border-chalk bg-surface p-5 md:p-6">
              <span
                aria-hidden="true"
                className={`flex size-12 items-center justify-center border-3 border-chalk text-ink ${ACCENTS[i] ?? "bg-acid"}`}
              >
                <Icon size={24} />
              </span>
              <h3 className="text-lg leading-tight font-bold md:text-xl">{item.title}</h3>
              <p className="text-[15px] leading-[1.5] text-chalk-dim">{item.body}</p>
              {i === 2 && (
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 font-bold text-acid underline hover:text-neon"
                >
                  {t.about.github}
                  <ExternalIcon size={14} />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
