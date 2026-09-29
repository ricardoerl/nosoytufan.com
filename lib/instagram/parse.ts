// Username extraction from an Instagram data export. Pure, no DOM dependencies.

export type ListKind = "followers" | "following";

export type ParseErrorCode = "not-instagram" | "schema-changed";

export interface FileEntry {
  /** Path inside the zip, or the loose file name. */
  name: string;
  text: string;
}

export interface ParsedLists {
  followers: string[] | null;
  following: string[] | null;
  /** Basenames of the files that yielded usernames. */
  files: string[];
}

export type ParseResult =
  | { ok: true; lists: ParsedLists }
  | { ok: false; error: ParseErrorCode; html?: boolean };

const USERNAME_RE = /^[a-z0-9._]{1,30}$/;
const EXCLUDED = ["pending", "recent", "hashtag", "close_friends", "restricted"];

export function basename(path: string): string {
  const parts = path.split(/[\\/]/);
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

/** Normalizes and validates. Returns null if it is not a valid username. */
export function normalizeUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const u = raw.trim().toLowerCase().replace(/^@+/, "");
  return USERNAME_RE.test(u) ? u : null;
}

function usernameFromHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  try {
    const url = new URL(href, "https://www.instagram.com");
    if (!/(^|\.)instagram\.com$/.test(url.hostname)) return null;
    const segments = url.pathname.split("/").filter(Boolean);
    return normalizeUsername(segments[segments.length - 1]);
  } catch {
    return null;
  }
}

/** Kind suggested by the file name, or null if it is not a candidate. */
export function candidateKind(path: string): ListKind | null {
  const name = basename(path);
  if (!name.endsWith(".json")) return null;
  if (EXCLUDED.some((w) => name.includes(w))) return null;
  if (name.includes("following")) return "following";
  if (name.includes("followers")) return "followers";
  return null;
}

function isHtmlCandidate(path: string): boolean {
  const name = basename(path);
  return (
    /\.html?$/.test(name) &&
    (name.includes("followers") || name.includes("following")) &&
    !EXCLUDED.some((w) => name.includes(w))
  );
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function usernameFromItem(item: unknown): string | null {
  if (!isRecord(item)) return null;
  const sld = Array.isArray(item.string_list_data) ? item.string_list_data[0] : undefined;
  const first = isRecord(sld) ? sld : undefined;
  return (
    normalizeUsername(first?.value) ??
    normalizeUsername(item.title) ??
    usernameFromHref(first?.href) ??
    usernameFromHref(item.href)
  );
}

function looksLikeItem(item: unknown): boolean {
  return isRecord(item) && ("string_list_data" in item || "title" in item);
}

/**
 * Extracts usernames from an array of entries. Returns null if the array is not in a known
 * format (which tells "empty list" apart from "schema changed").
 */
function extractFromArray(arr: unknown[]): string[] | null {
  if (arr.length === 0) return [];
  if (!arr.some(looksLikeItem)) return null;
  const out: string[] = [];
  for (const item of arr) {
    const u = usernameFromItem(item);
    if (u) out.push(u);
  }
  return out.length > 0 ? out : null;
}

/** Finds the list inside an object, preferring relationships_{kind} keys. */
function findArray(obj: Record<string, unknown>, kind: ListKind | null): { arr: unknown[]; kind: ListKind | null } | null {
  const keys = Object.keys(obj);
  const pick = (k: ListKind) => keys.find((key) => key.startsWith(`relationships_${k}`) && Array.isArray(obj[key]));
  const order: ListKind[] = kind === "followers" ? ["followers", "following"] : ["following", "followers"];
  for (const k of order) {
    const key = pick(k);
    if (key) return { arr: obj[key] as unknown[], kind: k };
  }
  return null;
}

export interface ExtractedFile {
  kind: ListKind;
  usernames: string[];
}

/**
 * Interprets already-parsed JSON. `hint` is the kind suggested by the file name.
 * Returns null if the format is not recognized.
 */
export function extractFromJson(data: unknown, hint: ListKind | null): ExtractedFile | null {
  if (Array.isArray(data)) {
    // A root array is the followers format.
    const usernames = extractFromArray(data);
    return usernames ? { kind: hint ?? "followers", usernames } : null;
  }
  if (isRecord(data)) {
    const found = findArray(data, hint);
    if (!found) return null;
    const usernames = extractFromArray(found.arr);
    return usernames ? { kind: found.kind ?? hint ?? "following", usernames } : null;
  }
  return null;
}

function safeJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

/**
 * Processes zip entries. Candidates are picked by name; multiple `followers_N.json`
 * files are merged.
 */
export function parseZipEntries(entries: FileEntry[]): ParseResult {
  try {
    const candidates = entries.filter((e) => candidateKind(e.name) !== null);
    if (candidates.length === 0) {
      return { ok: false, error: "not-instagram", html: entries.some((e) => isHtmlCandidate(e.name)) };
    }
    return collect(candidates.map((e) => ({ entry: e, hint: candidateKind(e.name) })));
  } catch {
    return { ok: false, error: "not-instagram" };
  }
}

/**
 * Processes loose .json files. The kind is detected from content (with the name as a hint),
 * so it works even if the file was renamed.
 */
export function parseLooseFiles(entries: FileEntry[]): ParseResult {
  try {
    const json = entries.filter((e) => basename(e.name).endsWith(".json"));
    if (json.length === 0) {
      return { ok: false, error: "not-instagram", html: entries.some((e) => /\.html?$/.test(basename(e.name))) };
    }
    return collect(json.map((e) => ({ entry: e, hint: candidateKind(e.name) })));
  } catch {
    return { ok: false, error: "not-instagram" };
  }
}

function collect(items: { entry: FileEntry; hint: ListKind | null }[]): ParseResult {
  const followers = new Set<string>();
  const following = new Set<string>();
  let hasFollowers = false;
  let hasFollowing = false;
  let parsedAny = false;
  const files: string[] = [];

  for (const { entry, hint } of items) {
    const parsed = safeJson(entry.text);
    if (!parsed.ok) continue;
    parsedAny = true;
    const extracted = extractFromJson(parsed.value, hint);
    if (!extracted) continue;
    files.push(basename(entry.name));
    const target = extracted.kind === "followers" ? followers : following;
    if (extracted.kind === "followers") hasFollowers = true;
    else hasFollowing = true;
    for (const u of extracted.usernames) target.add(u);
  }

  if (!hasFollowers && !hasFollowing) {
    return { ok: false, error: parsedAny ? "schema-changed" : "not-instagram" };
  }
  return {
    ok: true,
    lists: {
      followers: hasFollowers ? [...followers] : null,
      following: hasFollowing ? [...following] : null,
      files,
    },
  };
}
