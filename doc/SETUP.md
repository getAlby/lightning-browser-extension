# How to run Alby in the local development environment

## 🚀 Quick Start

> For Windows users, please use [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install).

- Install dependencies\
  `$ yarn install`

### 💻 Load extension into browser

> **NOTE:** by default, the extension built this way will talk to the testnet API (which runs under [api.regtest.getalby.com](https://api.regtest.getalby.com)). The testnet API is **not stable** but you can do transactions with testnet sats. In case you want to do run a dev build with the mainnet API, add the following `ALBY_API_URL` environment variable to your command: `$ ALBY_API_URL="https://api.getalby.com" yarn run dev:[chrome|firefox]`

- Start development build, which will automatically watch for file changes:

  - Chrome\
    `$ yarn run dev:chrome`
  - Firefox\
    `$ yarn run dev:firefox`
  - Opera\
     `$ yarn run dev:opera`

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

## Install and debug extension for Firefox Android

[Refer to SETUP_ANDROID.md for info regarding how to setup and debug Alby on firefox android](./SETUP_ANDROID.md)

### Multiple Extensions

It is not recommended to have multiple versions of the extension (development + official) running in the same browser. You will have instances of the extension with the same icon which is confusing, and also leads to a poor webln experience as both extensions will launch a popup. There may also be unexpected bugs due to conflict with the two extensions running at the same time.

Some ways you can work around this are:

- Use a separate Chrome / firefox profile for development of the extension (this profile would not have the official extension installed)
- Use a dedicated browser for development of the extension (this browser would not have the official extension installed)
- Disable the official extension during development, and disable the development extension when you want to use Alby as normal.

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
│   ├── fixtures                # Reusable sample data for tests
│   ├── i18n                    # Translations for internationalization
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

#### Storybook.js

We used to maintain a [Storybook](https://storybook.js.org)-setup but nobody as using it. Currently we do not see a use for it.\
But happy to talk about if you think it's useful.

## Contributing

We love collaborating with folks inside and outside of GitHub and welcome contributions!
