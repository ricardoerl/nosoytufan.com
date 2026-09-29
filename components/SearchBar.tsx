"use client";

import { useLocale } from "@/hooks/useLocale";
import { SearchIcon } from "./icons";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useLocale();
  return (
    <label className="flex h-[50px] min-w-0 grow items-center gap-3 border-3 border-chalk bg-surface px-3.5 focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-acid md:h-[60px] md:gap-3.5 md:px-[18px]">
      <SearchIcon size={22} className="size-[18px] shrink-0 md:size-[22px]" />
      <span className="sr-only">{t.results.searchLabel}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.results.searchPlaceholder}
        autoComplete="off"
        spellCheck={false}
        className="h-full min-w-0 grow bg-transparent text-base text-chalk outline-none focus-visible:outline-none md:text-lg"
      />
    </label>
  );
}
