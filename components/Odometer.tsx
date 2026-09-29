"use client";

import { useEffect, useState } from "react";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Counter whose digits roll up from 0. At least 3 digits. */
export function Odometer({ value, label }: { value: number; label: string }) {
  const target = String(Math.max(0, value)).padStart(3, "0");
  const [shown, setShown] = useState(() => "0".repeat(target.length));

  useEffect(() => {
    // One frame at 0 so the transition starts from the bottom on first render.
    const id = requestAnimationFrame(() => setShown(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const chars = shown.padStart(target.length, "0").slice(-target.length).split("");

  return (
    <div role="img" aria-label={label} className="flex gap-2 md:gap-2.5">
      {chars.map((_, i) => {
        const d = Number(chars[i]);
        return (
          <div
            key={target.length - i}
            className="relative h-[92px] w-[70px] overflow-hidden bg-chalk text-ink shadow-[5px_5px_0_#FF007F] md:h-[150px] md:w-28 md:border-3 md:border-chalk md:shadow-[8px_8px_0_#FF007F]"
          >
            <div
              className="flex flex-col transition-transform duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ transform: `translateY(-${d * 10}%)`, transitionDelay: `${i * 90}ms` }}
            >
              {DIGITS.map((n) => (
                <span
                  key={n}
                  className="flex h-[92px] items-center justify-center font-mono text-[76px] leading-none font-bold md:h-[144px] md:text-[124px]"
                >
                  {n}
                </span>
              ))}
            </div>
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-ink opacity-85 md:h-[3px]" />
          </div>
        );
      })}
    </div>
  );
}
