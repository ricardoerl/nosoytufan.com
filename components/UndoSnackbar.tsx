"use client";

import { useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";

interface Props {
  username: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoSnackbar({ username, onUndo, onDismiss }: Props) {
  const { t } = useLocale();

  useEffect(() => {
    const id = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(id);
  }, [username, onDismiss]);

  const [before, after] = t.results.undoMsg.split("@{user}");

  return (
    <div
      role="status"
      className="animate-toast-in fixed bottom-6 left-1/2 z-40 flex w-[calc(100%-32px)] max-w-[640px] -translate-x-1/2 items-center gap-4 border-3 border-ink bg-chalk py-2.5 pr-2.5 pl-4 text-[15px] text-ink shadow-[6px_6px_0_#BADA55] md:bottom-10 md:w-auto md:pl-[22px] md:text-base"
    >
      <span className="min-w-0 grow">
        {before}
        <b className="break-all">@{username}</b>
        {after}
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="h-11 shrink-0 cursor-pointer bg-ink px-[18px] text-[15px] font-bold text-chalk hover:bg-neon hover:text-ink"
      >
        {t.results.undo}
      </button>
    </div>
  );
}
