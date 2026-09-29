/// <reference lib="webworker" />
import JSZip from "jszip";
import { candidateKind, parseLooseFiles, parseZipEntries, type FileEntry } from "./instagram/parse";
import type { WorkerRequest, WorkerResponse } from "./zip-protocol";

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const post = (msg: WorkerResponse) => ctx.postMessage(msg);

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { files } = event.data;
  try {
    const zips = files.filter((f) => /\.zip$/i.test(f.name));
    let result;
    if (zips.length > 0) {
      post({ type: "progress", step: "unzip" });
      const entries: FileEntry[] = [];
      for (const file of zips) {
        let zip: JSZip;
        try {
          zip = await JSZip.loadAsync(file);
        } catch {
          post({ type: "result", result: { ok: false, error: "not-instagram" } });
          return;
        }
        const names = Object.keys(zip.files).filter((n) => !zip.files[n]!.dir);
        for (const name of names) {
          // Solo leemos el contenido de los candidatos; del resto basta el nombre.
          const text = candidateKind(name) ? await zip.files[name]!.async("string") : "";
          entries.push({ name, text });
        }
      }
      result = parseZipEntries(entries);
    } else {
      const entries = await Promise.all(files.map(async (f) => ({ name: f.name, text: await f.text() })));
      result = parseLooseFiles(entries);
    }
    if (result.ok) {
      for (const file of result.lists.files) post({ type: "progress", step: "found", file });
      post({ type: "progress", step: "compare" });
    }
    post({ type: "result", result });
  } catch {
    post({ type: "result", result: { ok: false, error: "not-instagram" } });
  }
};
