"use client";

import { useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { Dialog } from "./Dialog";
import { CloseIcon, LockIcon, WarningIcon } from "./icons";

// Filas de la mini maqueta de teléfono: 0 normal, 1 resaltada, 2 botón de acción.
const ROWS: Record<"es" | "en", [string, 0 | 1 | 2][][]> = {
  es: [
    [["Configuración y actividad", 0], ["Centro de cuentas", 1], ["Guardado", 0], ["Tu actividad", 0]],
    [["Datos personales", 0], ["Contraseña y seguridad", 0], ["Tu información y permisos", 1], ["Descargar tu información", 1]],
    [["Publicaciones", 0], ["Mensajes", 0], ["Seguidores y seguidos  ✓", 1], ["Comentarios", 0]],
    [["Formato: JSON", 1], ["Intervalo: desde el principio", 1], ["Calidad: baja", 0], ["Crear archivos", 2]],
  ],
  en: [
    [["Settings and activity", 0], ["Accounts Center", 1], ["Saved", 0], ["Your activity", 0]],
    [["Personal details", 0], ["Password and security", 0], ["Your information and permissions", 1], ["Download your information", 1]],
    [["Posts", 0], ["Messages", 0], ["Followers and following  ✓", 1], ["Comments", 0]],
    [["Format: JSON", 1], ["Date range: all time", 1], ["Quality: low", 0], ["Create files", 2]],
  ],
};

interface Props {
  initialStep: number;
  onClose: () => void;
  onDone: () => void;
}

export function GuideModal({ initialStep, onClose, onDone }: Props) {
  const { t, f, locale } = useLocale();
  const [active, setActive] = useState(initialStep);
  const steps = t.guide.steps;
  const last = steps.length - 1;

  return (
    <Dialog
      labelledBy="guide-title"
      onClose={onClose}
      className="flex w-full max-w-[1160px] flex-col border-3 border-chalk bg-ink shadow-[8px_8px_0_#BADA55] md:shadow-[14px_14px_0_#BADA55]"
    >
      <div className="flex items-start justify-between gap-4 border-b-3 border-chalk px-4 py-5 md:items-center md:px-8 md:py-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs tracking-[0.08em] text-acid uppercase md:text-[13px]">{t.guide.eyebrow}</span>
          <h2 id="guide-title" className="font-display text-[26px] leading-[1.05] font-extrabold tracking-[-0.03em] md:text-[40px]">
            {t.guide.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.guide.close}
          className="flex size-[52px] shrink-0 cursor-pointer items-center justify-center border-3 border-chalk text-chalk hover:bg-chalk hover:text-ink"
        >
          <CloseIcon size={22} />
        </button>
      </div>

      <ol className="grid gap-4 px-4 py-5 md:grid-cols-2 md:gap-5 md:px-8 md:py-7 lg:grid-cols-4">
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.title} className={on ? "" : "hidden md:block"}>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${f(t.guide.stepLabel, { n: i + 1 })}: ${s.title}`}
                onClick={() => setActive(i)}
                className={`flex h-full w-full cursor-pointer flex-col gap-3.5 border-3 p-4 text-left text-chalk ${
                  on ? "border-acid bg-surface-2 shadow-[6px_6px_0_#BADA55]" : "border-line-muted bg-ink hover:border-ash"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-[26px] font-bold ${on ? "text-acid" : "text-ash"}`}>0{i + 1}</span>
                  <span className="font-mono text-[11px] text-ash uppercase">{s.where}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-[250px] flex-col gap-2 rounded-[18px] border-2 border-line-muted bg-[#151515] px-3 py-3.5"
                >
                  <span className="mb-1.5 h-1.5 w-12 self-center rounded-[3px] bg-line-muted" />
                  <span className="text-[13px] font-bold text-chalk">{s.screen}</span>
                  {ROWS[locale][i]!.map(([label, hi]) => (
                    <span
                      key={label}
                      className={`rounded-lg px-2.5 py-[9px] text-xs ${
                        hi === 2
                          ? "bg-neon text-center font-bold text-ink"
                          : hi && on
                            ? "bg-acid font-bold text-ink"
                            : hi
                              ? "bg-[#2A2A2A] font-bold text-chalk"
                              : "bg-[#1E1E1E] text-ash"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </span>
                <span className="text-lg leading-tight font-bold">{s.title}</span>
                <span className="text-sm leading-[1.45] text-[#C9C5BB]">{s.body}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mx-4 flex items-center gap-3.5 border-3 border-chalk bg-neon px-5 py-4 text-ink md:mx-8">
        <WarningIcon size={26} className="shrink-0" />
        <p className="text-[15px] leading-[1.4] md:text-base">{t.guide.warning}</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t-3 border-chalk px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
        <p className="flex items-center gap-3 font-mono text-xs text-acid md:text-[13px]">
          <LockIcon size={20} className="shrink-0" />
          {t.trust.full}
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            disabled={active === 0}
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            className="h-[52px] cursor-pointer border-3 border-chalk px-[22px] font-bold text-chalk disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.guide.prev}
          </button>
          {active < last && (
            <button
              type="button"
              onClick={() => setActive((a) => Math.min(last, a + 1))}
              className="h-[52px] cursor-pointer border-3 border-chalk px-[22px] font-bold text-chalk md:hidden"
            >
              {t.guide.next}
            </button>
          )}
          <button
            type="button"
            onClick={onDone}
            className={`h-[52px] cursor-pointer items-center border-3 border-chalk bg-acid px-6 font-bold text-ink ${
              active < last ? "hidden md:flex" : "flex"
            }`}
          >
            {t.guide.done}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
