# AGENTS.md

This file provides guidance for AI coding agents working on the Alby Lightning Browser Extension repository.

## Project Overview

Alby Lightning Browser Extension — a WebExtension (Chrome MV3, Firefox/Opera MV2) that brings Bitcoin Lightning Network payments and Nostr signing to the browser. It implements the **WebLN**, **Nostr (NIP-07)**, **WebBTC**, and **Liquid** provider APIs by injecting them into web pages and routing requests through a background script that talks to a configurable Lightning backend (LND, LNbits, LNC, LNDhub, NWC, Alby account, Eclair, Galoy, plus native-companion variants for Tor).

## Tech Stack

- **Build:** Webpack 5 + SWC, separate builds per target browser (`dist/<env>/<browser>`)
- **Frontend (UI surfaces):** React 19, React Router v6, TypeScript (strict), Tailwind CSS 3, i18next, Zustand, axios
- **Storage:** `browser.storage` (settings/state) + Dexie/IndexedDB (allowances, payments, permissions, blocklist) via `db.ts`
- **Crypto:** `@noble/*`, `@scure/*`, `bitcoinjs-lib`, `liquidjs-lib`, `nostr-tools`, `crypto-js` (legacy)
- **Testing:** Jest (unit, via `@swc/jest`). The Playwright e2e suite under `tests/e2e/` is currently broken and unmaintained — rely on Jest only.
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
```

The Playwright `yarn test:e2e` / `yarn test` scripts still exist in `package.json` but the e2e suite is broken and not maintained — do not rely on them. Add new tests as Jest unit tests (colocated `*.test.ts` next to source, or under `tests/unit/`).

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

### Provider APIs (injected into web pages)

Inpage providers live in `src/extension/providers/<api>/index.ts`. Each method calls `this.execute(actionName, args)` which `postMessage`s to its content-script bridge; the bridge forwards to `router.ts` and the response comes back the same way (see [postMessage.ts](src/extension/providers/postMessage.ts) and [providerBase.ts](src/extension/providers/providerBase.ts)). All methods require `enable()` to have resolved first; `providerBase` enforces this. Public docs: <https://guides.getalby.com/developer-guide/developer-guide/alby-browser-extension-apis>.

**`window.webln`** — [providers/webln/index.ts](src/extension/providers/webln/index.ts) (WebLN spec)

| Method                                             | Purpose                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `enable()`                                         | Request user permission for the site; must be called before any other method. |
| `getInfo()`                                        | Returns connected node info (alias, pubkey, color, network).                  |
| `sendPayment(paymentRequest)`                      | Pay a BOLT11 invoice. Opens a prompt unless an allowance covers it.           |
| `sendPaymentAsync(paymentRequest)`                 | Fire-and-forget payment (no waiting for preimage).                            |
| `keysend({ destination, amount, customRecords? })` | Spontaneous (keysend) payment to a pubkey.                                    |
| `makeInvoice(amountOrArgs)`                        | Create a BOLT11 invoice on the active account.                                |
| `signMessage(message)`                             | Sign an arbitrary message with the wallet's message-signing key.              |
| `verifyMessage(signature, message)`                | Verify a previously signed message.                                           |
| `getBalance()`                                     | Return the current spendable balance.                                         |
| `request(method, params)`                          | Escape hatch — forward an arbitrary RPC to the active connector.              |
| `on(event, handler)` / `off(...)`                  | Subscribe to provider events (e.g. `accountChanged`).                         |

**`window.nostr`** — [providers/nostr/index.ts](src/extension/providers/nostr/index.ts) (NIP-07)

| Method                                                                                 | Purpose                                                                                |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `getPublicKey()`                                                                       | Return the user's Nostr pubkey (hex).                                                  |
| `signEvent(event)`                                                                     | Sign a Nostr event; fills `pubkey`, `id`, and `sig`.                                   |
| `signSchnorr(sigHash)` / `hashAndSignSchnorr(message)`                                 | Raw schnorr signature over a 32-byte hash, or over `sha256(message)`.                  |
| `nip04.encrypt(peerHexPubkey, plaintext)` / `nip04.decrypt(peerHexPubkey, ciphertext)` | NIP-04 (legacy) DM encryption.                                                         |
| `nip44.encrypt(peerHexPubkey, plaintext)` / `nip44.decrypt(peerHexPubkey, ciphertext)` | NIP-44 v2 encryption. `peer` must be a 32-byte **hex** pubkey, not bech32 (`npub...`). |
| `on(event, handler)` / `off(...)`                                                      | Subscribe to provider events.                                                          |

**`window.webbtc`** — [providers/webbtc/index.ts](src/extension/providers/webbtc/index.ts) (on-chain BTC, taproot account only)

| Method                             | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| `getInfo()`                        | Connected-wallet info for the BTC side.             |
| `getAddress()`                     | Return the user's on-chain taproot address.         |
| `signPsbt(psbtHex)`                | Sign a PSBT with the taproot key.                   |
| `sendTransaction(address, amount)` | Construct, sign, and broadcast an on-chain payment. |
| `request(method, params)`          | Generic RPC passthrough.                            |

**`window.liquid`** — [providers/liquid/index.ts](src/extension/providers/liquid/index.ts) (Liquid Network, taproot account only)

| Method                 | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `getAddress()`         | Return a confidential Liquid taproot address. |
| `signPset(psetBase64)` | Sign a Liquid PSET.                           |

**`window.alby`** — [providers/alby/index.ts](src/extension/providers/alby/index.ts) (vendor-specific)

| Method                                    | Purpose                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| `addAccount({ name, connector, config })` | Programmatically create a new account in the extension (e.g. onboarding flows). |

All providers also inherit `enable()` / `isEnabled()` / `on()` / `off()` from [providerBase.ts](src/extension/providers/providerBase.ts). To add a new method: add it to the inpage provider, register a corresponding action in [router.ts](src/extension/background-script/router.ts), implement the handler under [actions/](src/extension/background-script/actions/), define the message type in [src/types.ts](src/types.ts), and (for WebLN-like flows) extend [connector.interface.ts](src/extension/background-script/connectors/connector.interface.ts) on every connector.

### Request flow (the critical path)

```text
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

`src/extension/background-script/connectors/connector.interface.ts` is the abstraction every Lightning backend implements (`getInfo`, `sendPayment`, `keysend`, `makeInvoice`, `signMessage`, etc.). Adding/modifying a method here means updating **every** connector implementation (`alby`, `lnd`, `lnc`, `lnbits`, `lndhub`, `nwc`, `eclair`, `galoy`, and the `native*` companion-app variants). The `Native.ts` base class handles the native-messaging transport used for Tor proxying via the [alby-companion-rs](https://github.com/getAlby/alby-companion-rs) host app.

### State & persistence

- **`state.ts`** (Zustand-style store in background) — unlocked wallet state, current account, current connector instance, password. Rehydrated from `browser.storage` on startup; the password lives in memory only.
- **`db.ts`** (Dexie / IndexedDB) — allowances, payments, permissions, blocklist. The UI reads via the typed `request()` API and never imports `db.ts` directly.
- **`browser.storage.local`** — settings, account metadata (with the connector config encrypted by the unlock password).
- **Migrations:** [src/extension/background-script/migrations/index.ts](src/extension/background-script/migrations/index.ts) — a single object keyed by migration name. Each key runs once on startup; the executed names are tracked in `state.migrations`. Add a new key for a new migration; never rename or remove an existing one.

### Domain concepts

These are the user-visible behaviors backed by [`db.ts`](src/extension/background-script/db.ts). An agent touching auth/payment flows must understand which one applies — they are distinct mechanisms, not synonyms.

- **Allowance** (`db.allowances`) — a per-host **payment budget** (`totalBudget` / `remainingBudget`, in sats). When a site has an allowance, `webln.sendPayment` / `keysend` debit it silently up to `remainingBudget`; over-budget or expired allowances fall back to a Prompt. Allowances also flag `lnurlAuth` (auto-login allowed) and `enabledFor` (the WebLN method scopes). Created via the Prompt's "remember" option.
- **Permission** (`db.permissions`) — a per-host, per-method **auto-approve flag** independent of any budget. Keyed by `(accountId, host, method)` where `method` is one of `PermissionMethodNostr` (`nostr/signMessage`, `nostr/signSchnorr`, `nostr/getPublicKey`, `nostr/encrypt`, `nostr/decrypt`), `PermissionMethodBitcoin` (`bitcoin/getAddress`), or `PermissionMethodLiquid` (`liquid/getAddress`). `blocked: true` means "always deny without prompting." Managed via `addPermissionFor` / `hasPermissionFor` / `isPermissionBlocked` in [permissions/](src/extension/background-script/permissions/).
- **Blocklist** (`db.blocklist`) — a site the user has fully suppressed; the inpage providers should not be active there. Distinct from blocked Permission rows (which gate specific methods).
- **Payment** (`db.payments`) — a local audit log of every sent payment (`preimage`, `paymentHash`, `host`, `allowanceId`, fees). Read-only history; the UI lists this in account detail.
- **Account encryption** — every `account.config` (connector creds: macaroons, NWC URIs, mnemonics, …) is encrypted with the user's unlock password before being written to `browser.storage`. The decrypted config is held only on `state.connector` while the wallet is unlocked. **Never persist a connector config in plaintext, and never log it.**
- **Onboarding (Welcome flow)** — each backend has a dedicated connect screen under [src/app/screens/connectors/Connect&lt;Backend&gt;/](src/app/screens/connectors/). Adding a new connector means: (a) implement the class under `background-script/connectors/`, (b) add the `Connect<Name>` screen, (c) register the route in [src/app/router/connectorRoutes.tsx](src/app/router/connectorRoutes.tsx), (d) translate the labels.
- **LNURL flows** — handled in [actions/lnurl/](src/extension/background-script/actions/lnurl/): `auth` (LUD-04 login, optionally via mnemonic-derived linking key per LUD-05), `pay` (LUD-06 pay-to-LN-address), `withdraw` (LUD-03), `channel` (LUD-07). These run in the background script, open a Prompt, then call the active connector.

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
