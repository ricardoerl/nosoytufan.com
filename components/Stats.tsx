"use client";

import { useLocale } from "@/hooks/useLocale";

export function Stats({ following, followers, ignored }: { following: number; followers: number; ignored: number }) {
  const { t, locale } = useLocale();
  const n = (v: number) => v.toLocaleString(locale);
  const cells = [
    { label: t.results.following, value: n(following), accent: false },
    { label: t.results.followers, value: n(followers), accent: false },
    { label: t.results.ignored, value: n(ignored), accent: true },
  ];
  return (
    <dl className="flex border-3 border-chalk">
      {cells.map((c, i) => (
        <div key={c.label} className={`flex flex-1 flex-col-reverse px-3 py-2.5 md:flex-none md:px-[22px] md:py-3.5 ${i < 2 ? "border-r-3 border-chalk" : ""}`}>
          <dt className="text-xs text-ash md:text-[13px]">{c.label}</dt>
          <dd className={`font-mono text-xl font-bold md:text-[28px] ${c.accent ? "text-acid" : ""}`}>{c.value}</dd>
        </div>
      ))}
    </dl>
  );
}
