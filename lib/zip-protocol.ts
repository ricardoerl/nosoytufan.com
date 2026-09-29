import type { ParseResult } from "./instagram/parse";

export interface WorkerRequest {
  files: File[];
}

export type ProgressStep = { step: "unzip" } | { step: "found"; file: string } | { step: "compare" };

export type WorkerResponse = ({ type: "progress" } & ProgressStep) | { type: "result"; result: ParseResult };

/** Lanza el worker, reenvía el progreso y resuelve con el resultado. */
export function readExport(files: File[], onProgress: (p: ProgressStep) => void): Promise<ParseResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./zip.worker.ts", import.meta.url));
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === "progress") {
        onProgress(msg.step === "found" ? { step: "found", file: msg.file } : { step: msg.step });
      } else {
        worker.terminate();
        resolve(msg.result);
      }
    };
    worker.onerror = () => {
      worker.terminate();
      resolve({ ok: false, error: "not-instagram" });
    };
    worker.postMessage({ files } satisfies WorkerRequest);
  });
}
