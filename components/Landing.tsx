"use client";

import { useLocale } from "@/hooks/useLocale";
import { Dropzone } from "./Dropzone";
import { HelpIcon } from "./icons";
import type { UploadStatus } from "./UploadStates";

interface Props {
  status: UploadStatus;
  onFiles: (files: File[]) => void;
  onActivity: () => void;
  onGuide: (step?: number) => void;
  onReset: () => void;
}

export function Landing({ status, onFiles, onActivity, onGuide, onReset }: Props) {
  const { t } = useLocale();
  return (
    <>
      <main className="flex flex-col gap-[18px] px-4 pt-6 md:gap-14 md:px-12 md:pt-14 lg:flex-row">
        <div className="flex flex-col gap-[18px] md:gap-7 md:pt-3 lg:w-[600px] lg:shrink-0">
          <p className="hidden font-mono text-sm tracking-[0.08em] text-acid uppercase md:block">{t.landing.eyebrow}</p>
          <h1 className="font-display text-[44px] leading-[0.98] font-extrabold tracking-[-0.04em] md:text-[84px] md:leading-[0.95] md:tracking-tightest">
            {t.landing.titleBefore}
            <span className="text-neon">{t.landing.titleNo}</span>
            {t.landing.titleAfter}
          </h1>
          <p className="max-w-[520px] text-base leading-normal text-chalk-dim md:text-xl">
            <span className="md:hidden">{t.landing.subtitleMobile}</span>
            <span className="hidden md:inline">{t.landing.subtitle}</span>
          </p>
          <ul className="hidden flex-wrap gap-2.5 md:flex">
            {t.landing.pills.map((p) => (
              <li key={p} className="border-2 border-ash px-3 py-2 font-mono text-[13px] text-chalk-dim">
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 grow flex-col gap-5">
          <Dropzone status={status} onFiles={onFiles} onActivity={onActivity} onGuide={onGuide} onReset={onReset} />
          <div className="hidden items-center justify-between gap-4 pr-3.5 md:flex">
            <span className="text-chalk-dim">{t.landing.noFile}</span>
            <button type="button" onClick={() => onGuide()} className="cursor-pointer font-bold text-acid underline hover:text-neon">
              {t.landing.seeGuide}
            </button>
          </div>
        </div>
      </main>

      <section className="mt-10 grid border-t-3 border-chalk pb-28 md:grid-cols-3 md:pb-0">
        {t.landing.steps.map((s, i) => (
          <div
            key={s.title}
            className={`flex items-start gap-5 px-4 py-6 md:px-12 md:py-7 ${
              i < 2 ? "border-b-3 border-chalk md:border-r-3 md:border-b-0" : ""
            }`}
          >
            <span className={`font-mono text-[32px] font-bold ${i === 2 ? "text-neon" : "text-acid"}`}>0{i + 1}</span>
            <div>
              <h2 className="text-[19px] font-bold">{s.title}</h2>
              <p className="mt-1.5 text-[15px] text-ash">{s.body}</p>
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={() => onGuide()}
        className="fixed right-4 bottom-6 left-4 z-30 flex h-14 cursor-pointer items-center justify-center gap-2.5 border-3 border-ink bg-chalk text-[17px] font-bold text-ink shadow-[6px_6px_0_#BADA55] md:hidden"
      >
        <HelpIcon size={22} />
        {t.header.howTo}
      </button>
    </>
  );
}
