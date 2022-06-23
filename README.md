# Lightning Browser Extension

### A browser extension to bring the Bitcoin Lightning Network to the browser

The extension provides deep Lightning Network integration for websites (for payments and authentication flows).

The goal is to write a minimal web extension to allow browsers to interact with the Lightning Network programmatically. It focuses on the web-payments process and does not try to be a full node UI with advanced channel-management or similar features.

The extension implements the WebLN standard as the interface that allows websites to connect to Lightning Network nodes (to request payments, invoices, signatures, login, etc.) and enable seamless UX of web payments and authentications.

The extension can connect to different node implementations and supports custodial and non-custodial setups.

## Some Features

- [x] Custom budgets/allowances for websites to allow payment streams/auto-payments
- [x] Multiple accounts and support for different node backends (lnd, etc.)
- [x] Full WebLN send and receive payment flows (getInfo, sendPayment, fixed makeInvoice support)
- [x] [LNURL-pay](https://xn--57h.bigsun.xyz/lnurl-pay-flow.txt) support
- [x] [LNURL-auth](https://xn--57h.bigsun.xyz/lnurl-auth.html) support
- [x] Payment history with additional website metadata
- [x] [LNURL-withdraw](https://xn--57h.bigsun.xyz/lnurl-withdraw-flow.txt) support
- [x] WebLN signMessage, verifyMessage support
- [x] WebLN dynamic makeInvoice support
- [x] Keysend
- [ ] [Lsat](https://lsat.tech/) support

### STATUS: 🚀

## Join the conversation

We have a channel on the [bitcoin.design](https://bitcoin.design/) Slack community [#lightning-browser-extension](https://bitcoindesign.slack.com/archives/C02591ADXM2) and a [Telegram group](https://t.me/getAlby). Come and join us!

We also do a weekly call on Thursday at [13:00 UTC](https://everytimezone.com/s/436cf0d2) on [Jitsi](https://meet.fulmo.org/AlbyCommunityCall)

## Browser Support

Alby supports

- All [Chromium based browsers](<https://en.wikipedia.org/wiki/Chromium_(web_browser)#Browsers_based_on_Chromium>) - Chrome Opera, Brave etc.
- Firefox
- more coming soon...

## Installation

Add Alby to your browser

- [Add to Chrome, Opera, Brave, and all Chromium based browsers](https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe)
- [Add to Firefox](https://addons.mozilla.org/en-US/firefox/addon/alby/)

### Try out the most recent version of Alby (Nightly Releases)

- [Firefox Nightly](https://alby-releases-public.s3.eu-central-1.amazonaws.com/alby-firefox-nightly-master.xpi) - best to install it as a temporary add-on as discussed in the "Load extension into browser" section
- [Chrome Nightly](https://alby-releases-public.s3.eu-central-1.amazonaws.com/alby-chrome-nightly-master.zip) - go to `chrome://extensions/`, enable "Developer mode" (top right) and drag & drop the file in the browser

(Note: You might need to reconfigure your wallet after installing new versions)

## Architecture Idea

![architecture](/doc/ln-browser-architecture.png)

## Project Structure

```bash
./lightning-browser-extension
├── src                     # Source Code
│   ├── app                     # React UI App
│   ├── extension               # Browser Extension
│   ├── common                  # Helpers and utilities used by both the React App and the Browser Extension
├── static                  # Static Resources
│   ├── assets                  # Images, logos, etc
│   └── views                   # Static HTML files
├── doc                     # Documentation (guidelines, architecture docs, etc)
├── dist                    # Build
│   └── development             # Developer Builds (not to be shared)
│   └── production              # Production Builds
├── tests                   # E2E tests and related helpers
└
```

## 🚀 Quick Start

Ensure you have

- [Node.js](https://nodejs.org) 14 or later installed
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Suppported but not required

- [nodenv](https://github.com/nodenv/nodenv)
- [nvm](https://github.com/nvm-sh/nvm#intro)

Then run the following

1. Install dependencies\
   `yarn install`
1. Start the development server for the extension
   - `yarn run dev:chrome`
   - `yarn run dev:firefox`
   - `yarn run dev:opera`
1. To build the extension
   - `yarn run build:chrome`
   - `yarn run build:firefox`
   - `yarn run build:opera`
1. Build and pack extensions all at once to the `dist/production` directory\
   `yarn run build`
1. Build the production packages in the `dist/production` directory\
   `yarn run package`

### 🛠 Development

- Install dependencies\
  `yarn install`
- To watch file changes in development
  - Chrome\
    `yarn run dev:chrome`
  - Firefox\
    `yarn run dev:firefox`
  - Opera\
    `yarn run dev:opera`

#### Testnet/testing-accounts for development

We set up our own internal testnet, which can be used for your development.  
If this is not reachable please let us know.

- [Test-setup](https://github.com/getAlby/lightning-browser-extension/wiki/Test-setup) for different connectors (i.e. LND)
- [RTL](https://rtl.regtest.getalby.com) for testing nodes (PW: `getalby`)
  Currently only lists LND nodes
- [LNDhub.go API Swagger](https://lndhub.regtest.getalby.com/swagger/index.html)

#### Storybook.js

We have a working [Storybook](https://storybook.js.org)-setup and some components have stories.  
You can find the deployed Storybook here: https://lbe-stories.netlify.app

### :white_check_mark: Tests

#### E2E tests via [playwright](https://playwright.dev) ([using testing-library](https://testing-library.com/docs/pptr-testing-library/intro/))

```bash
yarn run dev:chrome
yarn test:e2e
```

:tipping_hand_woman: For now we only do E2E tests for Chrome

#### Unit tests tests via [Jest](https://jestjs.io)

```bash
yarn test:unit
```

#### Run all tests

```bash
yarn test
```

### 💻 Load extension into browser

- **Chrome**

  - Go to the browser address bar and type `chrome://extensions`
  - Check the `Developer Mode` button to enable it.
  - Click on the `Load Unpacked Extension…` button.
  - Select the extension’s dist directory: `dist/development/chrome`
  - To see the debug console check the `inspect views` in the extension details

- **Firefox**

  - Load the Add-on via `about:debugging` => `This Firefox` as temporary Add-on. (`about:debugging#/runtime/this-firefox`)
  - Choose a .xpi file or the `manifest.json` file in the extension's dist directory: `dist/development/firefox`
  - [debugging details](https://extensionworkshop.com/documentation/develop/debugging/#debugging_popups)
  - To see the debug console click "inspect" on the list of temporary extensions (`about:debugging#/runtime/this-firefox`)

- **Opera**

  - Load the extension via `opera:extensions`
  - Check the `Developer Mode` and load as unpacked from extension’s extracted directory.

To connect to a remote development LND node you can use a [test account](https://github.com/bumi/lightning-browser-extension/wiki/Test-setup)

### Debugging

Most logs are written to the background script. Make sure to "inspect" the background script to see the console. Help for [Chrome](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/), [Firefox](https://extensionworkshop.com/documentation/develop/debugging/)

### ⌨️ Production package files

- `yarn run package` builds the extension for all the browsers to `dist/production` directory respectively.

You can also use a Docker container and run the yarn commands within a container:

```bash
docker run --rm --volume="$(pwd):/app" --workdir="/app" -t -i node:lts "yarn install && yarn run package"
```

Note: By default the `manifest.json` is set with version `0.0.0`. The webpack loader will update the version in the build with that of the `package.json` version. In order to release a new version, update version in `package.json` and run script.

## Native Companions

Alby supports native connectors to native applications on the host computer. For this the extension passes each call to a native application (using [native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)).
This allows Alby also to connect to nodes behind Tor (through this native "proxy" application).

Currently, there is one native companion app available to connect to Tor nodes: [https://github.com/getAlby/alby-companion-rs](https://github.com/getAlby/alby-companion-rs)

## ⭐ Contributing

We welcome and appreciate new contributions.

### Find a task

We use the [Development Project Board](https://github.com/orgs/getAlby/projects/10/views/2) to plan to-dos. Best choose something from the to-do column. (If there is nothing for you, feel free to pick something from the backlog)

#### Developer

- Check out the issues that have specifically been [marked as being friendly to new contributors](https://github.com/getAlby/lightning-browser-extension/issues?q=is%3Aopen+is%3Aissue+label%3Adesign+label%3A%22good+first+issue%22)
- You can also review open PRs

#### Designer

- Have a look at our [Open source Design guide](https://github.com/getAlby/lightning-browser-extension/wiki/Open-source-Design)
- Check out the issues that have specifically been [marked with "design"](https://github.com/getAlby/lightning-browser-extension/issues?q=is%3Aopen+is%3Aissue+label%3A%22design%22)
- We also have a [Figma Design Guide Project](https://www.figma.com/file/xwGXHxW4FWpV03Tt37atZv/Extension-1.10.0) which you can have a look at

#### Anyone

- Have a look at this Readme. Can it be improved? Do you see typos? You can open a PR or reach out to us in [our community chat](https://bitcoindesign.slack.com/archives/C02591ADXM2).
- You can help with [translations](#translations)

### Creating a PR

When creating a PR please take this points as a reminder:

- If there's not yet an issue for your PR please first [create an issue](https://github.com/bumi/lightning-browser-extension/issues/new) with a proposal what you would like to do. This allows us to give feedback and helps you no wasting time and motivation
- Think in iterations (babysteps)\
  You can always start a PR and if you feel like adding on more things to it, better branch off and [create a new i.e. _draft_-PR](https://github.blog/2019-02-14-introducing-draft-pull-requests/)
- Newly added components should have a unit-test
- If you work on a more complex PR please [join our community chat](https://bitcoindesign.slack.com/archives/C02591ADXM2) to get feedback, discuss the best way to tackle the challenge, and to ensure that there's no duplication of work. It's often faster and nicer to chat or call about questions than to do ping-pong comments in PRs

### Code format & preferences

- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io/) for code (and more) formatting
- We prefer [Axios](https://axios-http.com/) over [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

#### Code Editors

##### [VS Code](https://code.visualstudio.com/)

For better support we reccomend these extensions:

- [vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [vscode-tailwindcss](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [vscode-html-css](https://marketplace.visualstudio.com/items?itemName=ecmel.vscode-html-css)

### Commit message format

Alby enforces [Conventional Commits Specification](https://www.conventionalcommits.org/en/)

> A specification for adding human and machine readable meaning to commit messages

### Translations

Alby uses [Weblate](https://weblate.org/en/) to manage translations for different locales. If you'd like to contribute, you can [add translations here](https://hosted.weblate.org/projects/getalby-lightning-browser-extension/getalby-lightning-browser-extension/).

## ❔ FAQs

#### Why not use Joule?

Joule is a full interface to manage a LND node. It only supports one LND account.
Our goal is NOT to write a full UI for a Lightning Network node with all the channel management features, but instead to only focus on what is necessary for the web (for payment and authentication flows). We believe there are already way better management UIs.
Also we focus on supporting multipe different node backends (non-custodial and custodial).

#### What is WebLN?

WebLN is a library and set of specifications for lightning apps and client providers to facilitate communication between apps and users' lightning nodes in a secure way. It provides a programmatic, permissioned interface for letting applications ask users to send payments, generate invoices to receive payments, and much more. [This documentation](https://webln.dev/#/) covers how to use WebLN in your Lightning-driven applications.

#### Is there a bounty program and can I contribute?

Yes. Thanks to generous donors, Alby is able to offer several bounties. You can find them on our [Wiki page](https://github.com/getAlby/lightning-browser-extension/wiki/Bounties). If you want to support Alby's bounty program, please donate [here](https://getalby.com/bounties). We greatly appreciate your contribution! 🙏

### Thanks

Based on the web extension starter kit: [/abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)
heavily inspired by the super-amazing work of the [Joule extension](https://lightningjoule.com/)

## ⚡️Donations

Want to support the work on Alby?

Support the Alby team ⚡️hello@getalby.com  
You can also contribute to our [bounty program](https://github.com/getAlby/lightning-browser-extension/wiki/Bounties): ⚡️bounties@getalby.com

## License

MIT
