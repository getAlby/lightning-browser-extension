<p align="center">
  <picture>
    <source srcset="/doc/logo-white.svg" media="(prefers-color-scheme: dark)" width="300">
    <img alt="Alby Logo" src="/doc/logo-black.svg" width="300">
  </picture>
</p>

<h1 align="center">⚡ Alby - Lightning Browser Extension</h1>
<p align="center">
  <strong>Seamlessly bring Bitcoin's Lightning Network to your browser.</strong>
</p>

The Alby browser extension seamlessly integrates the Bitcoin Lightning Network into websites, enabling both payments and authentication flows.

Designed to be a lightweight and efficient web extension, Alby allows browsers to interact with the Lightning Network programmatically. It focuses on web payments rather than advanced node management, ensuring a simple and intuitive user experience.

Alby implements the WebLN standard, providing a universal interface for websites to:

- Connect to Lightning Network nodes
- Request payments, invoices, signatures, and logins
- Enable a smooth and frictionless web payment experience
- The extension supports both custodial and non-custodial setups, making it flexible for different use cases

## 🌟 Key Features

- **Custom Budgets & Allowances** - Enable auto-payments and payment streams.
- **Multiple Accounts** - Supports different Lightning node backends (e.g., LND, CLN, custodial options).
- **Full WebLN Support** - Send & receive payments, generate invoices, signMessage, verifyMessage, dynamic makeInvoice and more.
- **LNURL Support** - Seamless [LNURL-pay](https://github.com/lnurl/luds/blob/luds/06.md), [LNURL-auth](https://github.com/lnurl/luds/blob/luds/04.md), and [LNURL-withdraw](https://github.com/lnurl/luds/blob/luds/03.md) integrations.
- **Keysend Payments** - Send payments without an invoice.
- **Payment History & Metadata** - Track transactions with additional website metadata.

## 🐝 About Alby

Alby is open-source, our goal is to create the best online experience to consume and reward content and services online.

## 🌎 Browser Support

Extension supports

✅ **[All Chromium-based browsers](<https://en.wikipedia.org/wiki/Chromium_(web_browser)#Browsers_based_on_Chromium>)** (Chrome, Edge, Opera, Brave, etc.)  
✅ **Firefox desktop and mobile**  
🚀 **More browsers coming soon...**

## 🛠 Installation

### Official Release

Add Alby to your browser

- [Add to Chrome, Opera, Brave, and all Chromium based browsers](https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe)
- [Add to Firefox](https://addons.mozilla.org/en-US/firefox/addon/alby/)

### Nightly Builds (Latest Development Version)

- [Firefox Nightly](https://nightly.link/getAlby/lightning-browser-extension/workflows/build/master/firefox.xpi.zip) - best to install it as a temporary add-on as discussed in the "[Load extension into browser](/doc/SETUP.md#-load-extension-into-browser)" section
- [Chrome Nightly](https://nightly.link/getAlby/lightning-browser-extension/workflows/build/master/chrome.zip)
  - for Chrome: go to `chrome://extensions/`, enable "Developer mode" (top right), and drag & drop the file in the browser
  - for Edge: go to `edge://extensions/`, enable "Developer mode" (left column), and load the unpacked file in the browser

> ⚠️ _Note: Updating may require reconfiguring your wallet._

## 🏛️ Architecture

![architecture](/doc/ln-browser-architecture.png)

### 🛠 Development

We welcome and appreciate new contributions! 🎉 To get started, [Refer to SETUP.md for info regarding how to set up Alby](./doc/SETUP.md)

#### 👨‍💻 Developer

- Check out the issues that have specifically been [marked as being friendly to new contributors](https://github.com/getAlby/lightning-browser-extension/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
- You can also review open PRs
- [Contribution guide for new developers](./doc/CONTRIBUTION.md)

#### 🎨 Designer

- Have a look at our [Open source Design guide](https://github.com/getAlby/lightning-browser-extension/wiki/Open-source-Design)
- Check out the issues that have specifically been [marked with "design"](https://github.com/getAlby/lightning-browser-extension/issues?q=is%3Aopen+is%3Aissue+label%3A%22design%22)
- You can find and copy the current version of the extension in this Figma file: [Alby Extension Master Design](https://www.figma.com/file/O49NS4o3IjWwmHvFLncTy6/Alby-Extension-Master-Design?node-id=0%3A1&t=rd4dQkDtwZ4Nuuqo-1)

#### 🌍 Anyone

- Have a look at this Readme. Can it be improved? Do you see typos? You can open a PR or reach out to us in [our community chat](https://bitcoindesign.slack.com/archives/C02591ADXM2).
- You can help with [translations](./doc/CONTRIBUTION.md#translations)
- [Code of Conduct](./doc/CODE_OF_CONDUCT.md)

## 🤝 Native Companions

Alby supports native connectors to native applications on the host computer. For this, the extension passes each call to a native application (using [native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)).
This allows Alby also to connect to nodes behind Tor (through this native "proxy" application).

Currently, there is one native companion app available to connect to Tor nodes: [https://github.com/getAlby/alby-companion-rs](https://github.com/getAlby/alby-companion-rs)

## 💬 Join the conversation

- [Discord](https://discord.gg/4DQu2pa72D)
- [Telegram](https://t.me/getAlby)
- [Community calls](https://cal.com/getalby/communitycall): bi-weekly on Thursday at 15:00 UTC

## ❔ FAQs

#### Why not use Joule?

Joule is a full interface to manage a LND node. It only supports one LND account.
Our goal is NOT to write a full UI for a Lightning Network node with all the channel management features, but instead to only focus on what is necessary for the web (for payment and authentication flows). We believe there are already way better management UIs.
Also, we focus on supporting multiple different node backends (non-custodial and custodial).

#### What is WebLN?

WebLN is a library and set of specifications for lightning apps and client providers to facilitate communication between apps and users' lightning nodes in a secure way. It provides a programmatic, permissioned interface for letting applications ask users to send payments, generate invoices to receive payments, and much more. [This documentation](https://webln.guide/) covers how to use WebLN in your Lightning-driven applications.

#### Is there a bounty program and can I contribute?

Yes. Thanks to generous donors, Alby is able to offer several bounties. You can find them on our [Wiki page](https://github.com/getAlby/lightning-browser-extension/wiki/Bounties). If you want to support Alby's bounty program, please donate [here](https://getalby.com/p/bounties). We greatly appreciate your contribution! 🙏

## ⚡️ Donations

Want to support the work on Alby?

Support the Alby team ⚡️hello@getalby.com
You can also contribute to our [bounty program](https://guides.getalby.com/developer-guide/bounties/alby-browser-extension-bounties): ⚡️bounties@getalby.com

## 🎉 Thanks

Based on the web extension starter kit: [/abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)
heavily inspired by the super-amazing work of the [Joule extension](https://lightningjoule.com/)

## ⚖️ License

[MIT](./LICENSE)
