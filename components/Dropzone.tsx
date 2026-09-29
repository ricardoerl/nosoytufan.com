"use client";

import { useRef, useState, type DragEvent } from "react";
import { useLocale } from "@/hooks/useLocale";
import { UploadIcon } from "./icons";
import { LogoMark } from "./LogoMark";
import { UploadStates, type UploadStatus } from "./UploadStates";

interface Props {
  status: UploadStatus;
  onFiles: (files: File[]) => void;
  onActivity: () => void;
  onGuide: (step?: number) => void;
  onReset: () => void;
}

export function Dropzone({ status, onFiles, onActivity, onGuide, onReset }: Props) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const busy = status.kind === "processing";

  const pick = () => inputRef.current?.click();

  const onDragEnter = (e: DragEvent) => {
    if (busy || !e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    depth.current += 1;
    setDragging(true);
    onActivity();
  };
  const onDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    if (busy) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  const box = "relative flex h-[290px] flex-col md:h-[440px]";

  return (
    <div
      className="mr-2 md:mr-0"
      onDragEnter={onDragEnter}
      onDragOver={(e) => {
        if (!busy) e.preventDefault();
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        id="zip-input"
        type="file"
        accept=".zip,.json,application/zip,application/json"
        multiple
        className="peer sr-only"
        tabIndex={status.kind === "idle" ? 0 : -1}
        onClick={onActivity}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
      {dragging ? (
        <div
          className={`${box} items-center justify-center gap-[18px] border-4 border-acid bg-acid p-7 text-center text-ink shadow-[10px_10px_0_#F4F1EA]`}
        >
          <LogoMark width={72} fill="#0A0A0A" />
          <p className="font-display text-[26px] leading-[1.05] font-extrabold tracking-[-0.02em] md:text-[34px]">
            {t.states.dragTitle}
          </p>
          <p className="text-[15px]">{t.states.dragBody}</p>
        </div>
      ) : status.kind === "idle" ? (
        <label
          htmlFor="zip-input"
          className={`${box} cursor-pointer items-center justify-center gap-4 border-4 border-dashed border-chalk bg-surface p-5 text-center shadow-[8px_8px_0_#FF007F] transition-colors hover:bg-surface-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-acid peer-focus-visible:outline-solid md:gap-[22px] md:p-8 md:shadow-[14px_14px_0_#FF007F]`}
        >
          <span className="flex size-[72px] items-center justify-center border-3 border-chalk bg-acid text-ink md:size-24">
            <UploadIcon size={48} className="size-9 md:size-12" />
          </span>
          <span className="font-display text-[26px] leading-[1.05] font-extrabold tracking-[-0.02em] md:text-[40px] md:tracking-[-0.03em]">
            <span className="md:hidden">{t.landing.dropTitleMobile}</span>
            <span className="hidden md:inline">{t.landing.dropTitle}</span>
          </span>
          <span className="hidden text-[17px] text-chalk-dim md:block">
            {t.landing.dropOr}{" "}
            <span className="font-bold text-acid underline">{t.landing.dropPick}</span> {t.landing.dropFromDevice}
          </span>
          <span className="font-mono text-xs text-ash md:text-[13px]">
            <span className="md:hidden">{t.landing.dropMetaMobile}</span>
            <span className="hidden md:inline">{t.landing.dropMeta}</span>
          </span>
        </label>
      ) : (
        <UploadStates
          status={status}
          className={box}
          onPick={pick}
          onGuide={onGuide}
          onReset={onReset}
        />
      )}
    </div>
  );
}
