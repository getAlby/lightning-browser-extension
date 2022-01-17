# Lightning Web Extension

## STATUS: alpha

### A general browser extension to bring the Bitcoin Lightning network to the browser

The extension provides deep Lightning Network integration for websites (for payments and authentication flows).

The goal is to write a minimal web extension to allow browsers to interact with the Lightning Network programmatically. It focusses on the web-payments process and does not try to be a full node UI with advanced channel-management or similar features.

The extension implements the WebLN standard as the interface that allows websites to connect to Lightning Network nodes (to request payments, invoices, signatures, login, etc.) and enable seamless UX of web payments and authentications.

The extension can connect to different node implementations and supports custodial and non-custodial setups.

## Some Features

- [x] Custom budgets/allowances for websites to allow payment streams/auto-payments
- [x] Multiple accounts and support for different node backends (lnd, etc.)
- [x] Full WebLN send and receive payment flows (getInfo, sendPayment, fixed makeInvoice support)
- [x] [LNURL-pay](https://xn--57h.bigsun.xyz/lnurl-pay-flow.txt) support
- [x] [LNURL-auth](https://xn--57h.bigsun.xyz/lnurl-auth.html) support
- [x] Payment history with additional website metadata
- [ ] [LNURL-withdraw](https://xn--57h.bigsun.xyz/lnurl-withdraw-flow.txt) support
- [x] WebLN signMessage, verifyMessage support
- [x] WebLN dynamic makeInvoice support
- [ ] [Lsat](https://lsat.tech/) support


## Join the conversation

We have a channel on the [bitcoin.design](https://bitcoin.design/) Slack community [#lightning-browser-extension](https://bitcoindesign.slack.com/archives/C02591ADXM2) and a [Telegram group](https://t.me/getAlby) Come and join us!

We also do a weekly call on Monday at 14:00 UTC - ([15:00 CET/CAT - 10:00 EDT](https://www.worldtimebuddy.com/?qm=1&lid=100,12,5&h=100&date=2021-11-4&sln=14-15&hf=1)) on [Jitsi](https://meet.fulmo.org/AlbyCommunityCall)

## Try out the most recent version
Download Nightly releases
* [Firefox Nightly](https://alby-releases-public.s3.eu-central-1.amazonaws.com/alby-firefox-nightly-master.xpi) - best install it as temporary add-on as discussed in the "Load extension into browser" section
* [Chrome Nightly](https://alby-releases-public.s3.eu-central-1.amazonaws.com/alby-chrome-nightly-master.zip) - go to `chrome://extensions/`, enable "Developer mode" (top right) and drag& drop the file

(Note: You might need to reconfigure your wallet after installing new versions)

## Browser Support

* [Chrome](https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe) (Opera, Brave, and all Chromium based browsers)
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/alby/)
* more coming soon...

## Architecture idea

![architecture](/doc/ln-browser-architecture.png)

## Project Structure

```
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
└
```

## 🚀 Quick Start

Ensure you have

- [Node.js](https://nodejs.org) 10 or later installed
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Then run the following:

- `yarn install` to install dependencies.
- `yarn run dev:chrome` to start the development server for chrome extension
- `yarn run dev:firefox` to start the development server for firefox addon
- `yarn run dev:opera` to start the development server for opera extension
- `yarn run build:chrome` to build chrome extension
- `yarn run build:firefox` to build firefox addon
- `yarn run build:opera` to build opera extension
- `yarn run build` builds and packs extensions all at once to the `dist/production` directory
- `yarn run package` build the production packages in the `dist/production` directory

### 🛠 Development

- `yarn install` to install dependencies
- To watch file changes in development

  - Chrome
    - `yarn run dev:chrome`
  - Firefox
    - `yarn run dev:firefox`
  - Opera
    - `yarn run dev:opera`


### 💻 Load extension into browser

- **Chrome**

  - Go to the browser address bar and type `chrome://extensions`
  - Check the `Developer Mode` button to enable it.
  - Click on the `Load Unpacked Extension…` button.
  - Select the extension’s dist directory: `dist/development/chrome`

- **Firefox**

  - Load the Add-on via `about:debugging` => `This Firefox` as temporary Add-on. (`about:debugging#/runtime/this-firfox`)
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

```
docker run --rm --volume="$(pwd):/app" --workdir="/app" -t -i node:lts "yarn install && yarn run package"
```


Note: By default the `manifest.json` is set with version `0.0.0`. The webpack loader will update the version in the build with that of the `package.json` version. In order to release a new version, update version in `package.json` and run script.


## Native Companions

For native connections the extension passes each call to a native application (using [native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)).
The native application does all the user interaction and connections to the lightning wallet.

Currently there is one prototype of a native companion app which can connect to LND: [lnd-native-companion](https://github.com/bumi/lnd-native-companion)

## ⭐ Contributing
We welcome and appreciate new contributions.

We use the [Development Project Board](https://github.com/getAlby/lightning-browser-extension/projects/2) to plan the next ToDos. Best choose something from the ToDo Column. (If there is nothing for you, feel free to pick something from the backlog)

If you're a developer looking to help but not sure where to begin, check out the issues that have specifically been marked as being friendly to new contributors [here](https://github.com/getAlby/lightning-browser-extension/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+project%3AgetAlby%2Flightning-browser-extension%2F2).

If you're looking for a bigger challenge, before opening a pull request please [create an issue](https://github.com/bumi/lightning-browser-extension/issues/new) or [join our community chat](https://bitcoindesign.slack.com/archives/C02591ADXM2) to get feedback, discuss the best way to tackle the challenge, and to ensure that there's no duplication of work.

## ❔ FAQs

#### Why not use Joule?

Joule is a full interface to manage a LND node. It only supports one LND account.
Our goal is NOT to write a full UI for a Lightning Network node with all the channel management features, but instead to only focus on what is necessary for the web (for payment and authentication flows). We believe there are already way better management UIs.
Also we focus on supporting multipe different node backends (non-custodial and custodial).

#### What is WebLN?

WebLN is a library and set of specifications for lightning apps and client providers to facilitate communication between apps and users' lightning nodes in a secure way. It provides a programmatic, permissioned interface for letting applications ask users to send payments, generate invoices to receive payments, and much more. This [documentation](https://webln.dev/#/) covers how to use WebLN in your Lightning-driven applications.

### Thanks

Based on the web extension starter kit: [/abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter")
heavily inspired by the super amazing work of the [Joule extension](https://lightningjoule.com/)

## License

MIT
