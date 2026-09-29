"use client";

import { useLocale } from "@/hooks/useLocale";
import { GITHUB_URL } from "@/lib/storage";
import { LangToggle } from "./LangToggle";
import { LogoMark } from "./LogoMark";
import { Wordmark } from "./Wordmark";

interface Props {
  view: "landing" | "results";
  onHome: () => void;
  onGuide: () => void;
  onShare: () => void;
}

export function Header({ view, onHome, onGuide, onShare }: Props) {
  const { t } = useLocale();
  return (
    <header className="flex items-center justify-between gap-2 border-b-3 border-chalk px-4 py-3 md:px-12 md:py-5">
      <a
        href="./"
        aria-label={t.header.homeLabel}
        onClick={(e) => {
          e.preventDefault();
          onHome();
        }}
        className="flex min-w-0 items-center gap-1.5 text-chalk no-underline min-[400px]:gap-2 md:gap-3"
      >
        <LogoMark width={42} className="h-6 w-7 shrink-0 md:h-9 md:w-[42px]" />
        <Wordmark className="text-[16px] whitespace-nowrap min-[400px]:text-[19px] md:text-[26px]" />
      </a>
      <nav className="flex shrink-0 items-center gap-1.5 min-[400px]:gap-2 md:gap-4">
        {view === "landing" ? (
          <>
            <button
              type="button"
              onClick={onGuide}
              className="hidden h-[50px] cursor-pointer border-3 border-chalk px-[18px] font-bold whitespace-nowrap text-chalk hover:bg-chalk hover:text-ink md:block"
            >
              {t.header.howTo}
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden px-1 py-3 font-medium whitespace-nowrap text-chalk underline hover:text-neon lg:block"
            >
              {t.header.github}
            </a>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onHome}
              className="hidden h-[50px] cursor-pointer border-3 border-chalk px-[18px] font-bold whitespace-nowrap text-chalk hover:bg-chalk hover:text-ink md:block"
            >
              {t.header.uploadAnother}
            </button>
            <button
              type="button"
              onClick={onShare}
              className="flex h-11 cursor-pointer items-center border-3 border-chalk bg-neon px-2.5 text-sm font-bold text-ink min-[400px]:px-3.5 md:hidden"
            >
              {t.results.shareShort}
            </button>
          </>
        )}
        <LangToggle />
      </nav>
    </header>
  );
}
