"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { SITE_URL } from "@/lib/storage";
import { STORY_THEMES, type StoryOptions, type StoryTheme } from "@/lib/story/render";
import { Dialog } from "./Dialog";
import { CloseIcon, ShareIcon } from "./icons";
import { StoryPreview } from "./StoryPreview";

const FILE_NAME = "nosoytufan-story.png";

function download(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ShareModal({ count, onClose }: { count: number; onClose: () => void }) {
  const { t } = useLocale();
  const [theme, setTheme] = useState<StoryTheme>("neon");
  const [showNumber, setShowNumber] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const onBlob = useCallback((b: Blob | null) => {
    blobRef.current = b;
  }, []);

  const options: StoryOptions = useMemo(
    () => ({
      theme,
      count: showNumber ? count : null,
      headline: t.share.storyHeadline,
      countLabel: t.share.storyCount,
      footer: t.share.storyFooter,
      cta: t.share.storyCta,
      year: new Date().getFullYear(),
    }),
    [theme, showNumber, count, t],
  );

  const share = async () => {
    setError(false);
    const blob = blobRef.current;
    if (!blob) return;
    const file = new File([blob], FILE_NAME, { type: "image/png" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: t.share.shareText });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    download(blob);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
    }
  };

  const secondary =
    "h-[52px] cursor-pointer border-3 border-chalk px-2 font-bold text-chalk hover:bg-chalk hover:text-ink";

  return (
    <Dialog
      labelledBy="share-title"
      onClose={onClose}
      className="flex w-full max-w-[1040px] flex-col border-3 border-chalk bg-ink shadow-[8px_8px_0_#FF007F] md:flex-row md:shadow-[14px_14px_0_#FF007F]"
    >
      <div className="order-2 flex shrink-0 items-center justify-center border-t-3 border-chalk bg-surface py-8 md:order-1 md:w-[520px] md:border-t-0 md:border-r-3 md:py-[70px]">
        <StoryPreview options={options} label={t.share.previewLabel} onBlob={onBlob} />
      </div>

      <div className="order-1 flex grow flex-col gap-6 p-4 md:order-2 md:gap-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[13px] tracking-[0.08em] text-acid uppercase">{t.share.eyebrow}</p>
            <h2 id="share-title" className="mt-1.5 font-display text-[30px] leading-none font-extrabold tracking-[-0.03em] md:text-[38px]">
              {t.share.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.share.close}
            className="flex size-12 shrink-0 cursor-pointer items-center justify-center border-3 border-chalk text-chalk hover:bg-chalk hover:text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-bold">{t.share.style}</legend>
          <div className="flex gap-3">
            {(Object.keys(STORY_THEMES) as StoryTheme[]).map((k) => {
              const on = k === theme;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTheme(k)}
                  className={`flex h-[52px] grow cursor-pointer items-center justify-center gap-2.5 border-3 font-bold text-chalk ${
                    on ? "border-acid bg-[#1E1E1E]" : "border-line-muted hover:border-ash"
                  }`}
                >
                  <span aria-hidden="true" className="size-[18px] border-2 border-chalk" style={{ background: STORY_THEMES[k].bg }} />
                  {t.share.themes[k]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-4 border-3 border-line-muted px-[18px] py-4">
          <span>
            <span id="shownum-label" className="block font-bold">
              {t.share.showNumber}
            </span>
            <span className="mt-1 block text-sm text-ash">{t.share.showNumberHint}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showNumber}
            aria-labelledby="shownum-label"
            onClick={() => setShowNumber((v) => !v)}
            className={`flex h-9 w-16 shrink-0 cursor-pointer border-3 border-chalk p-[3px] ${
              showNumber ? "justify-end bg-acid" : "justify-start bg-transparent"
            }`}
          >
            <span className={`block size-6 ${showNumber ? "bg-ink" : "bg-chalk"}`} />
          </button>
        </div>

        <div className="hidden grow md:block" />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={share}
            className="flex h-[60px] cursor-pointer items-center justify-center gap-2.5 border-3 border-chalk bg-neon text-lg font-bold text-ink shadow-[6px_6px_0_#F4F1EA] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_#F4F1EA]"
          >
            <ShareIcon size={20} />
            {t.share.shareStories}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => blobRef.current && download(blobRef.current)} className={secondary}>
              {t.share.download}
            </button>
            <button type="button" onClick={copy} className={secondary}>
              {copied ? t.share.linkCopied : t.share.copyLink}
            </button>
          </div>
          <p aria-live="polite" className="font-mono text-xs text-ash">
            {error ? <span className="text-neon">{t.share.error}</span> : t.share.meta}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
