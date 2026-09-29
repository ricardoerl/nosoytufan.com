# nosoytufan.com

Aplicación web **100% client-side** que compara los seguidores y seguidos de un export de datos de Instagram
(`.zip` o `.json`) y lista las cuentas que no te siguen de vuelta. No hay backend: el archivo se lee y procesa
íntegramente en el navegador y ningún dato del usuario sale del dispositivo.

- Requisitos de producto: [`docs/PRD.md`](docs/PRD.md)
- Especificación visual, tokens y componentes: [`docs/DESIGN.md`](docs/DESIGN.md)
- Maquetas de referencia: [`design/screens/`](design/screens)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router), `output: "export"` (sitio estático, sin API routes, server actions ni middleware) |
| UI | React 19 + TypeScript 6 (`strict`, `noUncheckedIndexedAccess`) |
| Estilos | Tailwind CSS 4 (tokens en `@theme` dentro de `app/globals.css`); solo tema oscuro (`.dark` en `<html>`) |
| Descompresión | `jszip` ejecutado en un Web Worker dedicado |
| Fuentes | `next/font/google` (Syne, Space Grotesk, Space Mono), autohospedadas en build y expuestas como variables CSS |
| i18n | Provider React propio sobre diccionarios JSON (`es`, `en`) con interpolación `{var}` |
| Imagen para compartir | Canvas 2D (1080×1920) + Web Share API con fallback a descarga |
| Tests | Vitest (entorno `node`) |
| Lint | ESLint 9 (flat config) + `eslint-config-next` (core-web-vitals + typescript) |

## Puesta en marcha

Requisitos: Node.js ≥ 20.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:3000
npm test           # Vitest: parser y motor de comparación
npm run lint       # ESLint
npm run build      # export estático en ./out
```

`out/` es un sitio estático autocontenido: se puede servir desde cualquier hosting estático
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3…). `trailingSlash: true` genera `index.html` por ruta.

## Estructura

```
app/
  layout.tsx            fuentes, metadata, CSP (meta), LocaleProvider
  page.tsx              máquina de estados de la app (landing ↔ resultados, modales)
  globals.css           tokens Tailwind (@theme), keyframes, foco visible, reduced-motion
  icon.svg              favicon
  apple-icon.png        icono 180×180 generado desde design/assets/app-icon.svg
components/
  TrustBanner  Header  LangToggle  Wordmark  LogoMark
  Landing  Dropzone  UploadStates  IdleToast
  Dialog  GuideModal
  Results  Odometer  Stats  SearchBar  ResultTabs  UserCard  UndoSnackbar
  ShareModal  StoryPreview
  icons/                iconos de línea (design/assets/icons.svg) como componentes
lib/
  instagram/parse.ts    extracción de usernames (pura, sin DOM)
  instagram/compare.ts  Following − Followers − Whitelist
  zip.worker.ts         Web Worker: lectura del zip / json y parseo
  zip-protocol.ts       tipos de mensajes worker ↔ main thread y helper readExport()
  story/render.ts       render de la story en Canvas 2D
  storage.ts            wrapper de localStorage tolerante a fallos, constantes
hooks/
  useLocale.tsx         LocaleProvider, detección de idioma, format()
  useWhitelist.ts       whitelist persistente con sincronización entre pestañas
  useIdle.ts            temporizador de inactividad
i18n/                   diccionarios es.json / en.json (derivados de design/i18n)
design/                 fuentes de diseño (maquetas, tokens, assets); no se compilan
docs/                   PRD y especificación de diseño
```

## Arquitectura

### Flujo de datos

```
<input type=file> / drop
        │
        ▼
 page.tsx::handleFiles ── size > 50 MB ──► estado "too-big" (no se lee el archivo)
        │
        ▼
 readExport(files) ──postMessage(File[])──► zip.worker.ts
        ▲                                       │ JSZip.loadAsync (solo .zip)
        │  {type:"progress", step}              │ lee SOLO las entradas candidatas
        │◄──────────────────────────────────────┤ parseZipEntries / parseLooseFiles
        │  {type:"result", ParseResult}         │
        ◄───────────────────────────────────────┘
        │
        ├─ error ──► "not-instagram" | "schema-changed"
        ├─ solo una lista (.json suelto) ──► "need-other" (se guarda la mitad y se espera la otra)
        └─ ok ──► compare(following, followers, whitelist) ──► <Results>
```

Los `File` se transfieren al worker por structured clone (sin copiar el contenido en el main thread).
La descompresión y el `JSON.parse` de exports grandes no bloquean la UI. El worker se crea por
procesamiento y se termina al recibir el resultado.

### Estados de la subida (`UploadStatus`)

`idle` → `processing` → resultado | `too-big` | `not-instagram` (`html?: boolean`) | `schema-changed` | `need-other`.
El estado `processing` tiene una duración mínima de 700 ms para que el feedback sea perceptible.
Los errores se anuncian con `role="alert"` y el progreso con `role="status"` + `role="progressbar"`.

### Parser difuso (`lib/instagram/parse.ts`)

Meta ha cambiado el formato del export varias veces, así que el parser no depende de rutas fijas.

**Selección de candidatos** (entradas del zip): basename en minúsculas que contenga `followers` o `following`,
termine en `.json` y **no** contenga `pending`, `recent`, `hashtag`, `close_friends` ni `restricted`.
Varios `followers_N.json` se fusionan. Para `.json` sueltos el tipo se detecta por contenido, con el nombre
solo como pista, así que funciona aunque el archivo se haya renombrado.

**Formatos soportados:**

| Lista | Estructura |
|---|---|
| followers | array raíz `[{ string_list_data: [{ href, value, timestamp }] }]` |
| followers | objeto con una clave `relationships_followers*` |
| following | `{ relationships_following: [...] }` |

**Resolución del username**, por prioridad: `string_list_data[0].value` → `title` → último segmento del
path de `href` (`instagram.com/_u/x` o `instagram.com/x`, solo si el host es `instagram.com`).

**Normalización y sanitización:** `trim`, minúsculas, quitar `@` inicial y validar con `/^[a-z0-9._]{1,30}$/`.
Lo que no pasa la validación se descarta. Nunca se usa `dangerouslySetInnerHTML`; React escapa todo el texto.

**Errores tipados:**

| Código | Condición |
|---|---|
| `not-instagram` | zip corrupto, sin candidatos o candidatos que no son JSON válido. `html: true` si el export se pidió en HTML (`followers_1.html`) |
| `schema-changed` | hay candidatos con JSON válido pero ninguno encaja en los formatos conocidos |

Un array vacío (`relationships_following: []`) se considera formato válido (lista vacía) y no dispara
`schema-changed`. Todo el parseo va envuelto en `try/catch`.

### Motor de comparación (`lib/instagram/compare.ts`)

```ts
compare(following, followers, whitelist) → {
  notFollowingBack,   // following − followers − whitelist, orden alfabético
  ignored,            // (following − followers) ∩ whitelist, orden alfabético
  followingCount,     // tamaño de following deduplicado
  followersCount,
}
```

Operaciones sobre `Set`: O(n + m). Se recalcula con `useMemo` cuando cambia la whitelist.

### Persistencia (`localStorage`)

| Clave | Contenido |
|---|---|
| `nstf:whitelist` | `string[]` en JSON; se valida y normaliza al leer |
| `nstf:locale` | `"es"` \| `"en"` |
| `nstf:idleToastDismissed` | `"1"` cuando se cierra el aviso de inactividad |
| `nstf:guideSeen` | `"1"` tras abrir la guía |

Todo acceso pasa por `lib/storage.ts`, que captura las excepciones (modo privado, cuota, cookies bloqueadas):
la app funciona sin persistencia. `useWhitelist` escucha el evento `storage` para sincronizar varias pestañas.
Solo se persisten preferencias y la whitelist, nunca las listas de seguidores.

### Whitelist e "Ignorar"

`useWhitelist()` expone `ignore(u)`, `restore(u)`, `has(u)` y `list`. Al ignorar, la tarjeta ejecuta
`animate-ghost-out` (220 ms) y la cuenta pasa a la whitelist en `animationend`, con un `setTimeout` de 400 ms
como respaldo por si la pestaña está oculta y la animación no llega a correr. "Deshacer" equivale a
`restore()` y el snackbar se oculta a los 5 s.

### i18n

`LocaleProvider` carga `i18n/es.json` e `i18n/en.json` de forma estática (tipados con `typeof es`, así que
una clave inexistente es un error de compilación). El HTML exportado se genera en `es`; tras la hidratación se
elige el idioma desde `localStorage` o `navigator.language` para no provocar un mismatch. `<html lang>` se
actualiza dinámicamente. Se evitó `next-intl` porque su routing por locale no encaja con `output: "export"`.

### Story para compartir (`lib/story/render.ts`)

- Canvas 2D a 1080×1920. Las medidas salen de la maqueta (405×720) escaladas ×2,667.
- Antes de dibujar espera a `document.fonts.load()` y `document.fonts.ready`. Las familias se leen de las
  variables CSS de `next/font` para usar exactamente las fuentes autohospedadas.
- El corazón pixelado se dibuja con `Path2D` a partir de los mismos paths del SVG del logo.
- El titular se reduce automáticamente hasta que la palabra más larga cabe en el ancho útil.
- La vista previa es el propio PNG generado (`<img src=blob:>`): lo que se ve es lo que se exporta.
- Compartir: `navigator.canShare({ files })` → `navigator.share()`. Si no está disponible o falla, se descarga el PNG.
  La imagen nunca incluye usernames.

### Rendimiento

- Parseo en Web Worker. Del zip solo se descomprimen las entradas candidatas; del resto basta el nombre.
- Paginación de la lista en lotes de 60 ("Cargar más"); la paginación se reinicia al cambiar búsqueda o pestaña.
- Búsqueda con `useDeferredValue` y `UserCard` memoizado para listas de miles de cuentas.

## Seguridad y privacidad

- **Sin red en runtime:** no hay analytics, llamadas a APIs ni recursos de terceros. Las fuentes se sirven
  desde el propio dominio.
- **CSP** vía `<meta http-equiv>` (solo en producción), porque un export estático no puede fijar cabeceras:
  `default-src 'self'; connect-src 'self'; worker-src 'self' blob:; img-src 'self' data: blob:; object-src 'none'; form-action 'none'; …`.
  `script-src` incluye `'unsafe-inline'` porque el runtime de Next emite scripts inline de hidratación y sin
  servidor no hay nonces. Si el hosting permite cabeceras, conviene mover la CSP ahí y endurecerla.
- **Límite de 50 MB** comprobado con `file.size` antes de leer nada.
- **Sanitización** por lista blanca de caracteres; los enlaces a perfiles usan `encodeURIComponent` y todos los
  enlaces externos llevan `target="_blank" rel="noopener noreferrer"`.

## Accesibilidad

- Diálogos (`components/Dialog.tsx`) con `role="dialog"`, `aria-modal`, foco atrapado, cierre con Esc y clic en
  el fondo, y foco devuelto al elemento que los abrió.
- Regiones `aria-live` para el procesamiento, los errores y el recuento de resultados.
- Tabs con `role="tablist"` / `tab` / `tabpanel` y navegación con flechas.
- Foco visible global: `outline: 3px solid #BADA55; outline-offset: 3px`. El dropzone refleja el foco de su
  `<input type="file">` oculto (`peer-focus-visible`).
- Objetivos táctiles de al menos 44 px. `prefers-reduced-motion` desactiva animaciones y transiciones.
- El odómetro expone el valor real con `role="img"` + `aria-label`.

## Tests

`lib/instagram/__tests__/` cubre con fixtures JSON inventados (sin datos reales):

- normalización y validación de usernames (incluidos intentos de inyección);
- selección y exclusión de candidatos por nombre;
- cada variante de formato: array raíz, `relationships_followers`, `value`, `title` sin `value` y solo `href`;
- fusión de varios `followers_N.json`;
- errores `not-instagram` (sin candidatos, HTML, JSON corrupto) y `schema-changed`;
- detección por contenido de `.json` sueltos;
- comparación: deduplicado, orden, whitelist y la lista de ignorados.

## Pendiente de configurar

- `GITHUB_URL` en `lib/storage.ts` apunta a un repositorio provisional.
- El build copia además el fuente de `zip.worker.ts` a `out/_next/static/media/` (artefacto de Turbopack); el
  worker que se ejecuta es el bundle compilado `turbopack-worker-*.js`.
