"use client";

import { useLocale } from "@/hooks/useLocale";
import type { ListKind } from "@/lib/instagram/parse";
import { GITHUB_URL } from "@/lib/storage";
import type { ProgressStep } from "@/lib/zip-protocol";
import { SadFace } from "./LogoMark";

export type UploadStatus =
  | { kind: "idle" }
  | { kind: "processing"; steps: ProgressStep[] }
  | { kind: "too-big"; sizeMB: string }
  | { kind: "not-instagram"; html: boolean }
  | { kind: "schema-changed" }
  | { kind: "need-other"; have: ListKind };

interface Props {
  status: Exclude<UploadStatus, { kind: "idle" }>;
  className: string;
  onPick: () => void;
  onGuide: (step?: number) => void;
  onReset: () => void;
}

const title = "font-display text-[22px] leading-[1.05] font-extrabold tracking-[-0.02em] md:text-[28px]";
const body = "text-[15px] leading-[1.45] text-chalk-dim";
const btnOutline =
  "flex h-12 flex-1 cursor-pointer items-center justify-center border-3 px-3 text-center text-[15px] font-bold";

export function UploadStates({ status, className, onPick, onGuide, onReset }: Props) {
  const { t, f } = useLocale();

  if (status.kind === "processing") {
    const found = status.steps.filter((s): s is Extract<ProgressStep, { step: "found" }> => s.step === "found");
    const comparing = status.steps.some((s) => s.step === "compare");
    const pct = comparing ? 90 : found.length ? 60 : 30;
    return (
      <div
        role="status"
        aria-live="polite"
        className={`${className} justify-center gap-5 overflow-hidden border-4 border-chalk bg-surface p-5 shadow-[8px_8px_0_#BADA55] md:p-10 md:shadow-[14px_14px_0_#BADA55]`}
      >
        <p className={title}>{t.states.processingTitle}</p>
        <div
          role="progressbar"
          aria-label={t.states.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-7 border-3 border-chalk p-[3px]"
        >
          <div className="progress-stripes h-full transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <ul className="font-mono text-[13px] leading-[1.7] text-chalk-dim">
          <li>
            <span className={found.length || comparing ? "text-acid" : "text-neon"} aria-hidden="true">
              {found.length || comparing ? "✓" : "›"}
            </span>{" "}
            {t.states.processingUnzip}
          </li>
          {found.map((s) => (
            <li key={s.file} className="truncate">
              <span className="text-acid" aria-hidden="true">
                ✓
              </span>{" "}
              {f(t.states.processingFound, { file: s.file })}
            </li>
          ))}
          {comparing && (
            <li>
              <span className="text-neon" aria-hidden="true">
                ›
              </span>{" "}
              {t.states.processingCompare}
            </li>
          )}
        </ul>
      </div>
    );
  }

  const frame = `${className} justify-center gap-3 overflow-y-auto border-4 bg-surface p-5 shadow-[8px_8px_0_#FF007F] md:gap-4 md:p-10 md:shadow-[14px_14px_0_#FF007F]`;

  if (status.kind === "too-big") {
    return (
      <div role="alert" className={`${frame} border-neon`}>
        <p className="font-mono text-[34px] leading-none font-bold text-neon md:text-[44px]">{status.sizeMB} MB</p>
        <p className={title}>{t.states.tooBigTitle}</p>
        <p className={body}>{f(t.states.tooBigBody, { size: status.sizeMB })}</p>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => onGuide(2)} className={`${btnOutline} border-chalk bg-chalk text-ink`}>
            {t.states.tooBigCta}
          </button>
          <button type="button" onClick={onPick} className={`${btnOutline} border-chalk text-chalk`}>
            {t.states.tryAnother}
          </button>
        </div>
      </div>
    );
  }

  if (status.kind === "need-other") {
    const missing: ListKind = status.have === "followers" ? "following" : "followers";
    return (
      <div role="alert" className={`${frame} border-acid shadow-[8px_8px_0_#BADA55] md:shadow-[14px_14px_0_#BADA55]`}>
        <p className={title}>{t.states.needOtherTitle}</p>
        <p className={body}>
          {f(t.states.needOtherBody, { have: t.states.kinds[status.have], missing: t.states.kinds[missing] })}
        </p>
        <div className="flex gap-2.5">
          <button type="button" onClick={onPick} className={`${btnOutline} border-acid bg-acid text-ink`}>
            {t.states.pickOther}
          </button>
          <button type="button" onClick={onReset} className={`${btnOutline} border-chalk text-chalk`}>
            {t.states.cancel}
          </button>
        </div>
      </div>
    );
  }

  const html = status.kind === "not-instagram" && status.html;
  const heading =
    status.kind === "schema-changed" ? t.states.schemaChangedTitle : html ? t.states.htmlTitle : t.states.wrongFileTitle;
  const text =
    status.kind === "schema-changed" ? t.states.schemaChangedBody : html ? t.states.htmlBody : t.states.wrongFileBody;

  return (
    <div role="alert" className={`${frame} border-chalk`}>
      <span className="hidden md:block">
        <SadFace size={72} />
      </span>
      <span className="md:hidden">
        <SadFace size={48} />
      </span>
      <p className={title}>{heading}</p>
      <p className={body}>{text}</p>
      <div className="flex gap-2.5">
        <button type="button" onClick={onPick} className={`${btnOutline} border-chalk text-chalk hover:bg-chalk hover:text-ink`}>
          {t.states.tryAnother}
        </button>
        {html ? (
          <button type="button" onClick={() => onGuide(3)} className={`${btnOutline} border-acid text-acid`}>
            {t.states.htmlCta}
          </button>
        ) : (
          <a href={GITHUB_URL + "/issues"} target="_blank" rel="noopener noreferrer" className={`${btnOutline} border-acid text-acid no-underline`}>
            {t.states.reportGithub}
          </a>
        )}
      </div>
    </div>
  );
}
