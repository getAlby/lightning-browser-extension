# AGENTS.md

This file provides guidance for AI coding agents working on the Alby Lightning Browser Extension repository.

## Project Overview

Alby Lightning Browser Extension — a WebExtension (Chrome MV3, Firefox/Opera MV2) that brings Bitcoin Lightning Network payments and Nostr signing to the browser. It implements the **WebLN**, **Nostr (NIP-07)**, **WebBTC**, and **Liquid** provider APIs by injecting them into web pages and routing requests through a background script that talks to a configurable Lightning backend (LND, LNbits, LNC, LNDhub, NWC, Alby account, Eclair, Galoy, Citadel, Kollider, LaWallet, plus native-companion variants for Tor).

## Tech Stack

- **Build:** Webpack 5 + SWC, separate builds per target browser (`dist/<env>/<browser>`)
- **Frontend (UI surfaces):** React 19, React Router v6, TypeScript (strict), Tailwind CSS 3, i18next, Zustand, axios
- **Storage:** `browser.storage` (settings/state) + Dexie/IndexedDB (allowances, payments, permissions, blocklist) via `db.ts`
- **Crypto:** `@noble/*`, `@scure/*`, `bitcoinjs-lib`, `liquidjs-lib`, `nostr-tools`, `crypto-js` (legacy)
- **Testing:** Jest (unit, via `@swc/jest`) + Playwright (e2e)
- **Manifest:** Single `src/manifest.json` with `__chrome__` / `__firefox__` / `__opera__` prefixes resolved by `wext-manifest-loader` at build time

## Common Commands

### Development

```bash
yarn install
yarn dev:chrome     # watch build → dist/development/chrome
yarn dev:firefox    # watch build → dist/development/firefox
yarn dev:opera
```

Load `dist/development/<browser>` as an unpacked / temporary extension. See `doc/SETUP.md` for browser-specific load instructions and `doc/SETUP_ANDROID.md` for Firefox Android.

### Build / Package

```bash
yarn build:chrome              # single-browser production build
yarn build                     # chrome + firefox + opera
yarn package                   # builds all + zips into dist/production via create-packages.sh
```

`manifest.json` ships with version `0.0.0`; the webpack loader rewrites it from `package.json` at build time.

### Lint, Format, Type-check

```bash
yarn lint            # eslint + tsc --noEmit + prettier --write (the canonical pre-commit check)
yarn lint:js         # eslint src --max-warnings 0
yarn lint:js:fix
yarn tsc:compile     # tsc --noEmit
yarn format          # prettier --check
yarn format:fix
```

ESLint, Prettier, and `tsc --noEmit` are enforced on staged files via Husky + lint-staged. Commit messages are validated by commitlint (Conventional Commits).

### Testing

```bash
yarn test:unit                                   # all jest tests
yarn test:unit path/to/file.test.ts              # single file
yarn test:unit -t "fragment of test name"        # by test name
yarn test:coverage
yarn test:e2e                                    # Playwright (clears puppeteer-user-data-dir first)
yarn test                                        # unit + e2e
```

## Architecture

### Three execution contexts

The extension code is split across three runtime contexts that **cannot share modules or memory directly** — they communicate only via `browser.runtime.sendMessage` and `window.postMessage`.

1. **Background script** (`src/extension/background-script/`) — long-lived (MV2) / service-worker-like (MV3) singleton. Owns the unlocked wallet state, IndexedDB, the connector instance, and is the **only** place that touches the Lightning backend or private keys.
2. **Content scripts** (`src/extension/content-script/*.js`) — injected into every page. They inject the corresponding inpage script (`inpage-script/`) into the page's main world and proxy messages between page ↔ background. There is one content script per provider (`webln.js`, `alby.js`, `nostr.js`, `liquid.js`, `webbtc.js`) plus `onstart.ts` and `context-menu.ts`.
3. **UI surfaces** (`src/app/router/`) — separate React apps bundled as different webpack entries:
   - `popup` — the toolbar popup
   - `prompt` — modal window opened by the background script for user confirmation (payment, signMessage, permission, etc.)
   - `options` — full-page settings
   - `welcome` — onboarding flow

Each surface lives under `src/app/router/<Name>/index.tsx` and is referenced from `webpack.config.js` `entry:` and from `static/views/*.html`.

### Request flow (the critical path)

```
Web page
  → injected provider (src/extension/providers/<api>/index.ts, run in MAIN world)
  → window.postMessage to content script
  → content script (src/extension/content-script/<api>.js) → browser.runtime.sendMessage
  → background-script router (src/extension/background-script/router.ts)
  → action handler (src/extension/background-script/actions/<area>/<verb>.ts)
  → either: returns directly, OR opens a Prompt window for user confirmation
  → connector (src/extension/background-script/connectors/<backend>.ts) implements connector.interface.ts
  → response propagates back the same path
```

`router.ts` is the central map from string action name → handler. Adding a new RPC means registering it there and exposing it via `src/common/lib/api.ts` (the typed client used by React UI and content scripts).

### Connectors

`src/extension/background-script/connectors/connector.interface.ts` is the abstraction every Lightning backend implements (`getInfo`, `sendPayment`, `keysend`, `makeInvoice`, `signMessage`, etc.). Adding/modifying a method here means updating **every** connector implementation (`alby`, `lnd`, `lnc`, `lnbits`, `lndhub`, `nwc`, `eclair`, `galoy`, `citadel`, `kollider`, `lawallet`, and the `native*` companion-app variants). The `Native.ts` base class handles the native-messaging transport used for Tor proxying via the [alby-companion-rs](https://github.com/getAlby/alby-companion-rs) host app.

### State & persistence

- **`state.ts`** (Zustand-style store in background) — unlocked wallet state, current account, current connector instance, password. Rehydrated from `browser.storage` on startup; the password lives in memory only.
- **`db.ts`** (Dexie / IndexedDB) — allowances, payments, permissions, blocklist. The UI reads via the typed `request()` API and never imports `db.ts` directly.
- **`browser.storage.local`** — settings, account metadata (with the connector config encrypted by the unlock password).
- **Migrations:** `background-script/migrations/` — run on startup from `index.ts`. Add a new file, never modify existing ones.

### Path aliases

`tsconfig.json` defines `~/* → src/*`, `@components/* → src/app/components/*`, `@screens/* → src/app/screens/*`. Prefer these over deep relative imports.

### Manifest variants

`src/manifest.json` uses `__chrome__`, `__firefox__`, `__opera__`, and `__chrome|firefox__` key prefixes. `wext-manifest-loader` strips the prefixes for the active `TARGET_BROWSER` at build time. Chrome ships as MV3 (service worker, `host_permissions`); Firefox/Opera ship as MV2 (background page, combined `permissions`). When adding a permission or background entry, set both variants.

## Coding Conventions

- **TypeScript strict mode** — no `any`. New code is `.ts/.tsx`; pre-existing `.js` content scripts and inpage scripts may stay JS.
- **i18n:** All user-facing strings go through `react-i18next`. Translations live in `src/i18n/locales/<lang>/translation.json`. Use `snake_case` keys, nest by screen/component, only indent when there's more than one attribute (`title` / `label`). See `doc/CONTRIBUTION.md` for full rules — translations are managed via Weblate, so structure matters.
- **HTTP:** Use `axios` (not `fetch`) — this is an explicit project preference.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`) — enforced by commitlint. Same prefixes for branch names (`feat/...`).
- **No sensitive data in logs.** The background script's console is shared; never log seeds, mnemonics, macaroons, NWC URLs, or unlock passwords.
- **Prompt windows are user-facing.** Any new action that requires confirmation should open a Prompt route under `src/app/router/Prompt` and resolve via the message returned from it.

## Files Worth Knowing

| File                                                                | Purpose                                                                                        |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `webpack.config.js`                                                 | Build configuration; lists every entry (popup/prompt/options/welcome + content/inpage scripts) |
| `src/manifest.json`                                                 | Multi-browser manifest with `__chrome__` / `__firefox__` / `__opera__` overrides               |
| `src/extension/background-script/index.ts`                          | Background entry: migrations, state hydration, tab listeners, prompt orchestration             |
| `src/extension/background-script/router.ts`                         | Single source of truth for background RPC routes                                               |
| `src/extension/background-script/connectors/connector.interface.ts` | The interface every Lightning backend implements                                               |
| `src/extension/background-script/state.ts`                          | In-memory wallet/session state                                                                 |
| `src/extension/background-script/db.ts`                             | Dexie/IndexedDB schema                                                                         |
| `src/common/lib/api.ts`                                             | Typed RPC client used by UI and content scripts                                                |
| `src/app/router/{Popup,Prompt,Options,Welcome}/index.tsx`           | The four React app entry points                                                                |
| `src/i18n/locales/en/translation.json`                              | Source-of-truth English strings                                                                |
