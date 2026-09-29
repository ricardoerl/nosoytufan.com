"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import type { Comparison } from "@/lib/instagram/compare";
import { ShareIcon } from "./icons";
import { Odometer } from "./Odometer";
import { PartialExportWarning } from "./PartialExportWarning";
import { ResultTabs, type Tab } from "./ResultTabs";
import { SearchBar } from "./SearchBar";
import { Stats } from "./Stats";
import { UndoSnackbar } from "./UndoSnackbar";
import { UserCard } from "./UserCard";

const PAGE = 60;

interface Props {
  data: Comparison;
  /** Start date (Unix seconds) of a date-limited followers list, or null if complete. */
  partialSince: number | null;
  ignore: (u: string) => void;
  restore: (u: string) => void;
  onShare: () => void;
  onGuide: (step?: number) => void;
}

export function Results({ data, partialSince, ignore, restore, onShare, onGuide }: Props) {
  const { t, f, locale } = useLocale();
  const [tab, setTab] = useState<Tab>("pending");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set());
  const [lastIgnored, setLastIgnored] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const listTopRef = useRef<HTMLDivElement>(null);

  const pool = tab === "pending" ? data.notFollowingBack : data.ignored;
  const q = deferredQuery.trim().toLowerCase().replace(/^@+/, "");
  const filtered = useMemo(() => (q ? pool.filter((u) => u.includes(q)) : pool), [pool, q]);
  const visible = filtered.slice(0, limit);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pagination resets when the filter or tab changes
    setLimit(PAGE);
  }, [q, tab]);

  // Users whose exit animation is running. Confirmed on `animationend` or, if the tab is
  // hidden and nothing animates, by a fallback timeout.
  const pendingLeave = useRef(new Set<string>());

  const onLeft = useCallback(
    (u: string) => {
      if (!pendingLeave.current.delete(u)) return;
      ignore(u);
      setLastIgnored(u);
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(u);
        return next;
      });
    },
    [ignore],
  );

  const onAction = useCallback(
    (u: string) => {
      if (tab === "ignored") {
        restore(u);
        return;
      }
      if (pendingLeave.current.has(u)) return;
      pendingLeave.current.add(u);
      setLeaving((prev) => new Set(prev).add(u));
      window.setTimeout(() => onLeft(u), 400);
    },
    [tab, restore, onLeft],
  );

  const dismissUndo = useCallback(() => setLastIgnored(null), []);
  const undo = () => {
    if (lastIgnored) restore(lastIgnored);
    setLastIgnored(null);
  };

  const count = data.notFollowingBack.length;
  const countLabel = f(t.results.countLabel, { count });

  let empty: string | null = null;
  if (filtered.length === 0) {
    if (q) empty = t.results.empty;
    else empty = tab === "pending" ? t.results.zero : t.results.noIgnored;
  }

  return (
    <main>
      <section className="flex flex-col gap-3 border-b-3 border-chalk px-4 pt-[22px] pb-[18px] md:flex-row md:items-end md:justify-between md:gap-8 md:px-12 md:pt-11 md:pb-9">
        <div className="flex flex-col gap-3 md:gap-[18px]">
          <Odometer value={count} label={countLabel} />
          <h1 className="font-display text-[30px] leading-none font-extrabold tracking-[-0.03em] md:text-[52px] md:tracking-[-0.035em]">
            <span className="sr-only">{count.toLocaleString(locale)} </span>
            {t.results.titleBefore}
            <span className="text-neon">{t.results.titleAccent}</span>.
          </h1>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <Stats following={data.followingCount} followers={data.followersCount} ignored={data.ignored.length} />
          <button
            type="button"
            onClick={onShare}
            className="hidden h-14 cursor-pointer items-center gap-2.5 border-3 border-chalk bg-neon px-[26px] text-[17px] font-bold text-ink shadow-[6px_6px_0_#F4F1EA] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_#F4F1EA] md:flex"
          >
            <ShareIcon size={20} />
            {t.results.share}
          </button>
        </div>
      </section>

      {partialSince !== null && <PartialExportWarning since={partialSince} onGuide={() => onGuide(3)} />}

      <div ref={listTopRef} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:gap-5 md:px-12 md:py-7">
        <SearchBar value={query} onChange={setQuery} />
        <ResultTabs tab={tab} onChange={setTab} pending={count} ignored={data.ignored.length} />
      </div>

      <div id="results-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {empty ? (
          <p className="mx-4 border-3 border-dashed border-ash p-8 text-center text-base text-chalk-dim md:mx-12 md:p-12 md:text-lg">
            {empty}
          </p>
        ) : (
          <ul className="border-t-2 border-[#2A2A2A] md:grid md:grid-cols-2 md:gap-5 md:border-0 md:px-12 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((u) => (
              <UserCard
                key={u}
                username={u}
                mode={tab}
                leaving={leaving.has(u)}
                onAction={onAction}
                onLeft={onLeft}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 py-7 pb-28 font-mono text-xs text-ash md:flex-row md:items-center md:justify-between md:px-12 md:pb-10 md:text-[13px]">
        <span aria-live="polite">
          {f(t.results.showing, {
            shown: visible.length.toLocaleString(locale),
            total: filtered.length.toLocaleString(locale),
          })}
        </span>
        {filtered.length > limit && (
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="h-11 shrink-0 cursor-pointer border-3 border-chalk px-5 font-sans text-[15px] font-bold text-chalk hover:bg-chalk hover:text-ink"
          >
            {t.results.loadMore}
          </button>
        )}
      </div>

      {lastIgnored && <UndoSnackbar username={lastIgnored} onUndo={undo} onDismiss={dismissUndo} />}
    </main>
  );
}
