# Lightning Web Extension

## STATUS: experimental

### A general browser extension to bring the Bitcoin Lightning network to the browser

The extension provides deep lighting integration for websites (for payments and authentication flows).

The goal is to write a minimal web extension supporting the developing [WebLN standard](https://webln.dev) to allow browsers to interact with lightning.

The extension implements the WebLN standard. The goal is to write a miminmal interface that allows websites to connect to Lightning nodes (to request payments, invoices, signatures, login, etc.)

The extension can connect to different node implementation and supports custodial and non-custodial setups. 
E.g.:

* [remote LND](https://github.com/bumi/lightning-browser-extension/blob/master/source/lib/connectors/lnd.js)
* [Local native companion apps](https://github.com/bumi/lightning-browser-extension/blob/master/source/lib/connectors/native.js) (e.g. zaphq or native wallet apps)
* [LNBits](https://github.com/bumi/lightning-browser-extension/blob/master/source/lib/connectors/lnbits.js)
* [LNDHub](https://github.com/bumi/lightning-browser-extension/blob/master/source/lib/connectors/lndhub.js) 
* ...


## Architecture idea

![architecture](/ln-browser-architecture.png)

## General Ideas

- Focus on the web-payment process, no channel-management or similar
- Support to connect multiple wallets (LND, C-Lightning, local wallet UIs (e.g. Zap), custodial (e.g. lnbits), native embedded wallet)
- [LNURL-pay](https://xn--57h.bigsun.xyz/lnurl-pay-flow.txt) support 
- [LNURL-auth](https://xn--57h.bigsun.xyz/lnurl-auth.html) support 
- [Lsat](https://lsat.tech/) support


## Browser Support

| [![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](/) | [![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](/) | [![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)](/) | [![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](/) | [![Yandex](https://raw.github.com/alrra/browser-logos/master/src/yandex/yandex_48x48.png)](/) | [![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png)](/) | [![vivaldi](https://raw.github.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png)](/) |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 49 & later ✔                                                                                  | 52 & later ✔                                                                                     | 36 & later ✔                                                                               | 79 & later ✔                                                                            | Latest ✔                                                                                      | Latest ✔                                                                                   | Latest ✔                                                                                         |


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
- `yarn run build` builds and packs extensions all at once to extension/ directory

### Development

- `yarn install` to install dependencies.
- To watch file changes in development

  - Chrome
    - `yarn run dev:chrome`
  - Firefox
    - `yarn run dev:firefox`
  - Opera
    - `yarn run dev:opera`

- **Load extension in browser**

- ### Chrome

  - Go to the browser address bar and type `chrome://extensions`
  - Check the `Developer Mode` button to enable it.
  - Click on the `Load Unpacked Extension…` button.
  - Select your extension’s extracted directory.

- ### Firefox

  - Load the Add-on via `about:debugging` => `This Firefox` as temporary Add-on.
  - Choose the `manifest.json` file in the extracted directory
  - [debugging details](https://extensionworkshop.com/documentation/develop/debugging/#debugging_popups)

- ### Opera

  - Load the extension via `opera:extensions`
  - Check the `Developer Mode` and load as unpacked from extension’s extracted directory.



### Production

- `yarn run build` builds the extension for all the browsers to `extension/BROWSER` directory respectively.

Note: By default the `manifest.json` is set with version `0.0.0`. The webpack loader will update the version in the build with that of the `package.json` version. In order to release a new version, update version in `package.json` and run script.

If you don't want to use `package.json` version, you can disable the option [here](https://github.com/abhijithvijayan/web-extension-starter/blob/e10158c4a49948dea9fdca06592876d9ca04e028/webpack.config.js#L79).


## Native Companions

For native connections the extension passes each call to a native application (using [native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)).
The native application does all the user interaction and connections to the lightning wallet.

Currently there is one prototype of a native companion app which can connect to LND: [lnd-native-companion](https://github.com/bumi/lnd-native-companion)


## FAQs

#### Why not use Joule?
Joule is a full interface to manage a LND node. It only supports one LND account.  
Our goal is NOT to write a full UI for a lightning node with all the channel management features but to only focus on what is necessary for the web (for payment and authentication flows). We believe there are already way better management UIs.
Also we focus on supporting multipe different node backends (non-custodial and custodial).


### Thanks

based on the web extension starter kit: [/abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter")  
heaviy inspired by the amazon work of the [Joule extension](https://lightningjoule.com/) 

## License

MIT 
