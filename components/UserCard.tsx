"use client";

import { memo } from "react";
import { useLocale } from "@/hooks/useLocale";
import { ExternalIcon, GhostIcon } from "./icons";

const AVATAR_BG = ["bg-acid", "bg-neon", "bg-chalk"];

// FNV-1a: color estable por username y bien repartido entre los tres tonos.
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

interface Props {
  username: string;
  mode: "pending" | "ignored";
  leaving: boolean;
  onAction: (u: string) => void;
  onLeft: (u: string) => void;
}

export const UserCard = memo(function UserCard({ username, mode, leaving, onAction, onLeft }: Props) {
  const { t, f } = useLocale();
  const initial = (username.replace(/[^a-z]/g, "").charAt(0) || username.charAt(0)).toUpperCase();
  const href = `https://www.instagram.com/${encodeURIComponent(username)}/`;

  return (
    <li
      className={`flex items-center gap-2.5 border-b-2 border-[#2A2A2A] px-4 py-2.5 md:flex-col md:items-stretch md:gap-3.5 md:border-3 md:border-chalk md:bg-[#111111] md:p-4 ${
        leaving ? "animate-ghost-out pointer-events-none" : ""
      }`}
      onAnimationEnd={(e) => {
        if (leaving && e.target === e.currentTarget) onLeft(username);
      }}
    >
      <div className="flex min-w-0 grow items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center font-display text-lg font-extrabold text-ink md:size-12 md:border-3 md:border-chalk md:text-[22px] ${
            AVATAR_BG[hash(username) % 3]
          }`}
        >
          {initial}
        </span>
        <span className="min-w-0 truncate text-[15px] font-bold md:text-[17px]">@{username}</span>
      </div>
      <div className="flex shrink-0 gap-2.5">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 bg-chalk px-3 text-[13px] font-bold text-ink no-underline hover:bg-acid md:grow md:text-[15px]"
        >
          {t.results.viewProfile}
          <ExternalIcon size={14} className="hidden md:block" />
        </a>
        {mode === "pending" ? (
          <button
            type="button"
            onClick={() => onAction(username)}
            aria-label={f(t.results.ignore, { user: username })}
            title={t.results.ignoreTitle}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center border-3 border-acid text-acid hover:bg-acid hover:text-ink"
          >
            <GhostIcon size={22} className="size-5 md:size-[22px]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAction(username)}
            className="h-11 cursor-pointer border-3 border-acid px-3 text-sm font-bold text-acid hover:bg-acid hover:text-ink"
          >
            {t.results.restore}
          </button>
        )}
      </div>
    </li>
  );
});
