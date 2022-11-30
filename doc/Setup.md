# How to run Alby in the local development environment

## 🚀 Quick Start

Ensure you have

- [Node.js](https://nodejs.org) v16 or newer installed (we run tests with v18)
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Supported but not required

- [nvm](https://github.com/nvm-sh/nvm#intro)

Then run the following

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

### Testnet/testing-accounts for development use Alby testnet

We set up our own internal testnet, which can be used for your development.
If this is not reachable please let us know.

- [Test-setup](https://github.com/getAlby/lightning-browser-extension/wiki/Test-setup) for different connectors (i.e. LND)
- [Thunderhub](https://thunderhub.regtest.getalby.com/) for testing nodes (PW: `getalby`)
  Currently only lists LND nodes
- [LNDhub.go API Swagger](https://lndhub.regtest.getalby.com/swagger/index.html)

After installing the wallet in the browser and setting the username and password, the page will jump to the page for selecting the lightning network wallet.

Select the LND Testnet accounts account LND-1 in the document [Test-setup](https://github.com/getAlby/lightning-browser-extension/wiki/Test-setup).

Copy the content of Address to the REST API host and port pasted into the wallet

Copy the contents of Admin Macaroon and paste it into the Macaroon (HEX format) in the wallet

Click Continue to create an account

### Testnet/testing-accounts for development use localhost testnet

For most people who are new to the btc lightning network, starting a test version of the lightning network environment locally is very helpful for developing wallets, so that they can transfer money with confidence.

[Start the lightning network test environment locally and link to the Alby](https://github.com/getAlby/lightning-browser-extension/wiki/Start-the-lightning-network-test-environment-locally-and-link-to-the-Alby)

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

### Debugging

Most logs are written to the background script. Make sure to "inspect" the background script to see the console. Help for [Chrome](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/), [Firefox](https://extensionworkshop.com/documentation/develop/debugging/)

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

#### Storybook.js

We used to maintain a [Storybook](https://storybook.js.org)-setup but nobody as using it. Currently we do not see a use for it.\
But happy to talk about if you think it's useful.
