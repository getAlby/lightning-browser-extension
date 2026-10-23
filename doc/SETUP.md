# How to run Alby in the local development environment

This guide walks you through setting up the Alby Lightning Browser Extension for local development, enabling you to modify, test, and debug it efficiently.

Please go through the [Contribution Guidelines](./CONTRIBUTION.md) before going forward with any development. This helps us keep the process streamlined and results in better PRs.

If you have any setup problems, please ensure you have read through all the instructions have all the required software installed before creating an issue.

## ⚡ Prerequisites

- [Node.js](https://nodejs.org) 22.23.4 or newer within Node 22 (use `nvm install && nvm use` for the pinned version)
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Supported but not required

- [nvm](https://github.com/nvm-sh/nvm#intro)

## 🖥️ OS Requirements

For the best development experience, we recommend using Linux or MacOS, as it offers better compatibility, streamlined workflows, and a consistent development environment. If using Windows, we highly recommend to set up WSL 2 to run a Linux environment smoothly on windows. Install [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install).

## 🚀 Quick Start

This guide helps you run the extension in desktop browsers.

- We use [Yarn](https://yarnpkg.com/) as package manager. To install all required dependencies, run the following command at the root of the project:
  `$ yarn install`

### Run Development Build

- Start the development build with the mainnet API. The build will automatically watch for file changes:

  - Chrome\
    `$ yarn run dev:chrome`
  - Firefox\
    `$ yarn run dev:firefox`
  - Opera\
     `$ yarn run dev:opera`

### Load extension into browser

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

## 📱 Firefox Android Setup

Alby extension is actively maintained for Firefox on Android. Follow the [SETUP_ANDROID.md](./SETUP_ANDROID.md) guide to install and debug it.

## 🛠️ Testing and Debugging

### Unit Testing with Jest

Unit tests help ensure that individual components and functions work as expected. By writing unit tests, we can catch bugs early, improve code quality, and maintain stability when making changes.

The extension uses [Jest](https://jestjs.io) as the testing framework. To run the unit tests, use the following command:

```bash
yarn test:unit
```

### Debugging

Most logs are written to the background script of the extension. Make sure to "inspect" the background script to see the console.

- [Chrome](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)
- [Firefox](https://extensionworkshop.com/documentation/develop/debugging/)

## ❓ FAQ

### Can I run multiple versions of the extension at the same time?

It is not recommended to have multiple versions of the extension (development + official) running in the same browser. You will have instances of the extension with the same icon which is confusing, and also leads to a poor webln experience as both extensions will launch a popup. There may also be unexpected bugs due to conflict with the two extensions running at the same time.

Some ways you can work around this are:

- Use a separate Chrome / firefox profile for development of the extension (this profile would not have the official extension installed)
- Use a dedicated browser for development of the extension (this browser would not have the official extension installed)
- Disable the official extension during development, and disable the development extension when you want to use Alby as normal.

### How to Test Different Connectors Supported by the Extension?

By default, Alby and NWC (Nostr Wallet Connect) connectors are sufficient for testing UI changes and core functionality. However, if you need to test specific connectors like LND, CLN, or LNbits, you can run your own local lightning network and you can use [Lightning Polar](https://lightningpolar.com/) which helps you to spin up local instances.

## 📂 Project Structure

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

## ⌨️ Production package files

- `yarn run package` builds the extension for all the browsers to `dist/production` directory respectively.

You can also use a Docker container and run the yarn commands within a container:

```bash
docker run --rm --pull=always --volume="$(pwd):/app" --workdir="/app" -t -i node:22.23.4 sh -c "yarn install && yarn run package"
```

Note: By default the `manifest.json` is set with version `0.0.0`. The webpack loader will update the version in the build with that of the `package.json` version. In order to release a new version, update version in `package.json` and run script.

## Contributing

We love collaborating with folks inside and outside of GitHub and welcome contributions!
