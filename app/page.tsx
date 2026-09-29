"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GuideModal } from "@/components/GuideModal";
import { Header } from "@/components/Header";
import { IdleToast } from "@/components/IdleToast";
import { Landing } from "@/components/Landing";
import { Results } from "@/components/Results";
import { ShareModal } from "@/components/ShareModal";
import { TrustBanner } from "@/components/TrustBanner";
import type { UploadStatus } from "@/components/UploadStates";
import { useIdle } from "@/hooks/useIdle";
import { useWhitelist } from "@/hooks/useWhitelist";
import { compare } from "@/lib/instagram/compare";
import type { ParsedLists } from "@/lib/instagram/parse";
import { storage } from "@/lib/storage";
import { readExport, type ProgressStep } from "@/lib/zip-protocol";

const MAX_BYTES = 50 * 1024 * 1024;
const MIN_PROCESSING_MS = 700;

interface Lists {
  followers: string[];
  following: string[];
}

type HalfLists = Pick<ParsedLists, "followers" | "following">;

export default function Home() {
  const [status, setStatus] = useState<UploadStatus>({ kind: "idle" });
  const [lists, setLists] = useState<Lists | null>(null);
  const [guideStep, setGuideStep] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(true);
  const partial = useRef<HalfLists | null>(null);
  const whitelist = useWhitelist();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe tras hidratar
    setToastDismissed(storage.get("nstf:idleToastDismissed") === "1");
  }, []);

  const onLanding = lists === null;
  const { idle, reset: resetIdle } = useIdle(60_000, onLanding && status.kind === "idle" && !toastDismissed);

  const comparison = useMemo(
    () => (lists ? compare(lists.following, lists.followers, whitelist.list) : null),
    [lists, whitelist.list],
  );

  const goHome = useCallback(() => {
    partial.current = null;
    setLists(null);
    setStatus({ kind: "idle" });
    setSharing(false);
    window.scrollTo({ top: 0 });
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      resetIdle();
      const tooBig = files.find((f) => f.size > MAX_BYTES);
      if (tooBig) {
        setStatus({ kind: "too-big", sizeMB: (tooBig.size / 1024 / 1024).toFixed(1) });
        return;
      }
      const steps: ProgressStep[] = [];
      setStatus({ kind: "processing", steps: [] });
      const started = performance.now();
      const result = await readExport(files, (p) => {
        steps.push(p);
        setStatus({ kind: "processing", steps: [...steps] });
      });
      const wait = MIN_PROCESSING_MS - (performance.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));

      if (!result.ok) {
        setStatus(
          result.error === "schema-changed"
            ? { kind: "schema-changed" }
            : { kind: "not-instagram", html: Boolean(result.html) },
        );
        return;
      }
      // Con .json sueltos, se combina con la mitad que ya teníamos.
      const merged: HalfLists = {
        followers: result.lists.followers ?? partial.current?.followers ?? null,
        following: result.lists.following ?? partial.current?.following ?? null,
      };
      if (merged.followers && merged.following) {
        partial.current = null;
        setLists({ followers: merged.followers, following: merged.following });
        setStatus({ kind: "idle" });
        window.scrollTo({ top: 0 });
      } else {
        partial.current = merged;
        setStatus({ kind: "need-other", have: merged.followers ? "followers" : "following" });
      }
    },
    [resetIdle],
  );

  const dismissToast = () => {
    setToastDismissed(true);
    storage.set("nstf:idleToastDismissed", "1");
  };

  const openGuide = useCallback((step = 0) => {
    setGuideStep(step);
    storage.set("nstf:guideSeen", "1");
  }, []);

  return (
    <>
      <TrustBanner />
      <Header
        view={onLanding ? "landing" : "results"}
        onHome={goHome}
        onGuide={() => openGuide()}
        onShare={() => setSharing(true)}
      />

      {comparison ? (
        <Results data={comparison} ignore={whitelist.ignore} restore={whitelist.restore} onShare={() => setSharing(true)} />
      ) : (
        <Landing
          status={status}
          onFiles={handleFiles}
          onActivity={resetIdle}
          onGuide={openGuide}
          onReset={goHome}
        />
      )}

      {onLanding && idle && !toastDismissed && guideStep === null && <IdleToast onClose={dismissToast} />}

      {guideStep !== null && (
        <GuideModal
          initialStep={guideStep}
          onClose={() => setGuideStep(null)}
          onDone={() => {
            setGuideStep(null);
            if (!onLanding) goHome();
            requestAnimationFrame(() => document.getElementById("zip-input")?.focus());
          }}
        />
      )}

      {sharing && comparison && (
        <ShareModal count={comparison.notFollowingBack.length} onClose={() => setSharing(false)} />
      )}
    </>
  );
}
