# nosoytufan.com

A **100% client-side** web app that compares the followers and following lists from an Instagram data export
(`.zip` or `.json`) and shows the accounts that don't follow you back. There is no backend: the file is read and
processed entirely in the browser, and no user data ever leaves the device.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), `output: "export"` (static site: no API routes, server actions or middleware) |
| UI | React 19 + TypeScript 6 (`strict`, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 4 (tokens in `@theme` inside `app/globals.css`); dark theme only (`.dark` on `<html>`) |
| Decompression | `jszip` running in a dedicated Web Worker |
| Fonts | `next/font/google` (Syne, Space Grotesk, Space Mono), self-hosted at build time and exposed as CSS variables |
| i18n | Custom React provider over JSON dictionaries (`es`, `en`) with `{var}` interpolation |
| Share image | Canvas 2D (1080×1920) + Web Share API, with download fallback |
| Tests | Vitest (`node` environment) |
| Lint | ESLint 9 (flat config) + `eslint-config-next` (core-web-vitals + typescript) |

## Getting started

Requirements: Node.js ≥ 20.

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm test           # Vitest: parser and comparison engine
npm run lint       # ESLint
npm run build      # static export to ./out
```

`out/` is a self-contained static site that can be served from any static host (Netlify, Vercel,
Cloudflare Pages, GitHub Pages, S3…). `trailingSlash: true` emits one `index.html` per route.

## Project layout

```
app/
  layout.tsx            fonts, metadata, CSP (meta tag), LocaleProvider
  page.tsx              app state machine (landing ↔ results, modals)
  globals.css           Tailwind tokens (@theme), keyframes, visible focus, reduced motion
  icon.svg              favicon
  apple-icon.png        180×180 app icon
components/
  TrustBanner  Header  LangToggle  Wordmark  LogoMark
  Landing  Dropzone  UploadStates  IdleToast
  Dialog  GuideModal
  Results  Odometer  Stats  SearchBar  ResultTabs  UserCard  UndoSnackbar
  ShareModal  StoryPreview
  icons/                line icons as SVG components
lib/
  instagram/parse.ts    username extraction (pure, no DOM)
  instagram/compare.ts  Following − Followers − Whitelist
  zip.worker.ts         Web Worker: reads the zip / json and parses it
  zip-protocol.ts       worker ↔ main thread message types and the readExport() helper
  story/render.ts       story rendering with Canvas 2D
  storage.ts            fault-tolerant localStorage wrapper, constants
hooks/
  useLocale.tsx         LocaleProvider, locale detection, format()
  useWhitelist.ts       persistent whitelist with cross-tab sync
  useIdle.ts            inactivity timer
i18n/                   es.json / en.json dictionaries
```

## Architecture

### Data flow

```
<input type=file> / drop
        │
        ▼
 page.tsx::handleFiles ── size > 50 MB ──► "too-big" state (the file is never read)
        │
        ▼
 readExport(files) ──postMessage(File[])──► zip.worker.ts
        ▲                                       │ JSZip.loadAsync (.zip only)
        │  {type:"progress", step}              │ reads ONLY candidate entries
        │◄──────────────────────────────────────┤ parseZipEntries / parseLooseFiles
        │  {type:"result", ParseResult}         │
        ◄───────────────────────────────────────┘
        │
        ├─ error ──► "not-instagram" | "schema-changed"
        ├─ only one list (loose .json) ──► "need-other" (keep this half, wait for the other)
        └─ ok ──► compare(following, followers, whitelist) ──► <Results>
```

`File` objects are handed to the worker via structured clone (their contents are not copied on the main
thread), so decompressing and `JSON.parse`-ing large exports never blocks the UI. A worker is spawned per run
and terminated once it returns a result.

### Upload states (`UploadStatus`)

`idle` → `processing` → result | `too-big` | `not-instagram` (`html?: boolean`) | `schema-changed` | `need-other`.
`processing` lasts at least 700 ms so the feedback is perceptible. Errors are announced with `role="alert"`;
progress uses `role="status"` + `role="progressbar"`.

### Fuzzy parser (`lib/instagram/parse.ts`)

Meta has changed the export format several times, so the parser does not rely on fixed paths.

**Candidate selection** (zip entries): a lowercase basename that contains `followers` or `following`, ends in
`.json` and does **not** contain `pending`, `recent`, `hashtag`, `close_friends` or `restricted`. Multiple
`followers_N.json` files are merged. For loose `.json` files the kind is detected from content, with the name
only as a hint, so renamed files still work.

**Supported formats:**

| List | Shape |
|---|---|
| followers | root array `[{ string_list_data: [{ href, value, timestamp }] }]` |
| followers | object with a `relationships_followers*` key |
| following | `{ relationships_following: [...] }` |

**Username resolution**, in priority order: `string_list_data[0].value` → `title` → last path segment of
`href` (`instagram.com/_u/x` or `instagram.com/x`, only when the host is `instagram.com`).

**Normalization and sanitization:** `trim`, lowercase, strip a leading `@`, then validate against
`/^[a-z0-9._]{1,30}$/`. Anything that fails is dropped. `dangerouslySetInnerHTML` is never used; React escapes
all text.

**Typed errors:**

| Code | Condition |
|---|---|
| `not-instagram` | corrupt zip, no candidates, or candidates that are not valid JSON. `html: true` when the export was requested as HTML (`followers_1.html`) |
| `schema-changed` | candidates contain valid JSON but none matches a known format |

An empty array (`relationships_following: []`) is a valid format (an empty list) and does not trigger
`schema-changed`. All parsing is wrapped in `try/catch`.

### Comparison engine (`lib/instagram/compare.ts`)

```ts
compare(following, followers, whitelist) → {
  notFollowingBack,   // following − followers − whitelist, sorted alphabetically
  ignored,            // (following − followers) ∩ whitelist, sorted alphabetically
  followingCount,     // size of the deduplicated following list
  followersCount,
}
```

`Set`-based, O(n + m). Recomputed with `useMemo` whenever the whitelist changes.

### Persistence (`localStorage`)

| Key | Value |
|---|---|
| `nstf:whitelist` | JSON `string[]`; validated and normalized on read |
| `nstf:locale` | `"es"` \| `"en"` |
| `nstf:idleToastDismissed` | `"1"` once the inactivity toast is dismissed |
| `nstf:guideSeen` | `"1"` after the guide is opened |

Every access goes through `lib/storage.ts`, which swallows exceptions (private mode, quota, blocked cookies),
so the app works without persistence. `useWhitelist` listens to the `storage` event to stay in sync across
tabs. Only preferences and the whitelist are persisted, never the follower lists.

### Whitelist and "Ignore"

`useWhitelist()` exposes `ignore(u)`, `restore(u)`, `has(u)` and `list`. On ignore, the card plays
`animate-ghost-out` (220 ms) and the account is whitelisted on `animationend`, with a 400 ms `setTimeout`
fallback in case the tab is hidden and the animation never runs. "Undo" maps to `restore()`; the snackbar
hides after 5 s.

### i18n

`LocaleProvider` statically imports `i18n/es.json` and `i18n/en.json` (typed as `typeof es`, so a missing key
is a compile error). The exported HTML is rendered in `es`; after hydration the locale is picked from
`localStorage` or `navigator.language`, which avoids a hydration mismatch. `<html lang>` is updated at runtime.
`next-intl` was avoided because its per-locale routing does not fit `output: "export"`.

### Share story (`lib/story/render.ts`)

- Canvas 2D at 1080×1920. Measurements come from the 405×720 mockup scaled by ×2.667.
- Before drawing it awaits `document.fonts.load()` and `document.fonts.ready`. Font families are read from the
  `next/font` CSS variables so the exact self-hosted fonts are used.
- The pixelated heart is drawn with `Path2D` from the same paths as the SVG logo.
- The headline shrinks automatically until its longest word fits the usable width.
- The preview is the generated PNG itself (`<img src=blob:>`): what you see is what gets exported.
- Sharing: `navigator.canShare({ files })` → `navigator.share()`. If unavailable or failing, the PNG is
  downloaded. The image never includes usernames.

### Performance

- Parsing runs in a Web Worker. Only candidate zip entries are decompressed; for the rest the name is enough.
- The list is paginated in batches of 60 ("Load more"); pagination resets when the search or tab changes.
- Search uses `useDeferredValue`, and `UserCard` is memoized for lists with thousands of accounts.

## Security and privacy

- **No runtime network access:** no analytics, API calls or third-party resources. Fonts are served from the
  site's own origin.
- **CSP** via `<meta http-equiv>` (production only), since a static export cannot set headers:
  `default-src 'self'; connect-src 'self'; worker-src 'self' blob:; img-src 'self' data: blob:; object-src 'none'; form-action 'none'; …`.
  `script-src` includes `'unsafe-inline'` because the Next runtime emits inline hydration scripts and, without
  a server, there are no nonces. If the host supports headers, move the CSP there and tighten it.
- **50 MB limit** checked via `file.size` before anything is read.
- **Sanitization** through a character allowlist; profile links use `encodeURIComponent`, and every external
  link has `target="_blank" rel="noopener noreferrer"`.

## Accessibility

- Dialogs (`components/Dialog.tsx`) use `role="dialog"` and `aria-modal`, trap focus, close on Esc and backdrop
  click, and return focus to the element that opened them.
- `aria-live` regions for processing, errors and the result count.
- Tabs with `role="tablist"` / `tab` / `tabpanel` and arrow-key navigation.
- Global visible focus: `outline: 3px solid #BADA55; outline-offset: 3px`. The dropzone mirrors the focus of
  its hidden `<input type="file">` (`peer-focus-visible`).
- Touch targets of at least 44 px. `prefers-reduced-motion` disables animations and transitions.
- The odometer exposes the real value through `role="img"` + `aria-label`.

## Tests

`lib/instagram/__tests__/` covers, with made-up JSON fixtures (no real data):

- username normalization and validation (including injection attempts);
- candidate selection and exclusion by file name;
- every format variant: root array, `relationships_followers`, `value`, `title` without `value`, and `href` only;
- merging multiple `followers_N.json` files;
- `not-instagram` (no candidates, HTML, corrupt JSON) and `schema-changed` errors;
- content-based detection of loose `.json` files;
- comparison: deduplication, ordering, whitelist and the ignored list.

## Notes

- The build also copies the `zip.worker.ts` source into `out/_next/static/media/` (a Turbopack artifact); the
  worker that actually runs is the compiled `turbopack-worker-*.js` bundle.
