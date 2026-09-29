"use client";

import { useRef, type KeyboardEvent } from "react";
import { useLocale } from "@/hooks/useLocale";

export type Tab = "pending" | "ignored";

interface Props {
  tab: Tab;
  onChange: (t: Tab) => void;
  pending: number;
  ignored: number;
}

export function ResultTabs({ tab, onChange, pending, ignored }: Props) {
  const { t, f } = useLocale();
  const refs = useRef<Record<Tab, HTMLButtonElement | null>>({ pending: null, ignored: null });
  const tabs: { id: Tab; label: string }[] = [
    { id: "pending", label: f(t.results.tabPending, { count: pending }) },
    { id: "ignored", label: f(t.results.tabIgnored, { count: ignored }) },
  ];

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next: Tab = tab === "pending" ? "ignored" : "pending";
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" onKeyDown={onKey} className="flex shrink-0 border-3 border-chalk">
      {tabs.map(({ id, label }) => {
        const on = id === tab;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[id] = el;
            }}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls="results-panel"
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(id)}
            className={`h-11 flex-1 cursor-pointer px-3 text-sm font-bold whitespace-nowrap md:h-[54px] md:flex-none md:px-5 md:text-base ${
              on ? "bg-chalk text-ink" : "bg-transparent text-chalk hover:bg-surface-2"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
