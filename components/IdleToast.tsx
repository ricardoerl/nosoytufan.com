"use client";

import { useLocale } from "@/hooks/useLocale";
import { CoffeeIcon } from "./icons";

export function IdleToast({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  return (
    <div
      role="status"
      className="animate-toast-in fixed right-4 bottom-[104px] left-4 z-40 flex items-start gap-3.5 border-3 border-ink bg-chalk py-[18px] pr-2.5 pl-5 text-ink shadow-[8px_8px_0_#BADA55] md:right-12 md:bottom-12 md:left-auto md:w-[380px]"
    >
      <CoffeeIcon size={28} className="shrink-0" />
      <p className="grow text-[15px] leading-[1.45]">
        <b>{t.landing.idleToastTitle}</b> {t.landing.idleToastBody}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label={t.landing.closeToast}
        className="-mt-2.5 size-11 shrink-0 cursor-pointer text-[22px] font-bold text-ink"
      >
        ×
      </button>
    </div>
  );
}
