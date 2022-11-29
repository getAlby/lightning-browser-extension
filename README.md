<p align="center" style="    background-color: rgb(248,195,58)">
  <img width="300px" src="/doc/Alby-logo-figure-full.png">
</p>

<h1 align="center">Alby - Lightning Browser Extension</h1>




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

## About Alby
Alby is open-source and currently in alpha stage. Our goal is to create the best online experience to consume and reward content and services online

## Join the conversation

We have a channel on the [bitcoin.design](https://bitcoin.design/) Slack community [#lightning-browser-extension](https://bitcoindesign.slack.com/archives/C02591ADXM2) and a [Telegram group](https://t.me/getAlby). Come and join us!

We also do a bi-weekly call on Thursday at [13:00 UTC](https://everytimezone.com/s/436cf0d2) on [Jitsi](https://meet.fulmo.org/AlbyCommunityCall)

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

- [Firefox Nightly](https://nightly.link/getAlby/lightning-browser-extension/workflows/build/master/firefox.xpi.zip) - best to install it as a temporary add-on as discussed in the "Load extension into browser" section
- [Chrome Nightly](https://nightly.link/getAlby/lightning-browser-extension/workflows/build/master/chrome.zip) - go to `chrome://extensions/`, enable "Developer mode" (top right) and drag & drop the file in the browser

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

We set up our own internal testnet, which can be used for your development.
If this is not reachable please let us know.

- [Test-setup](https://github.com/getAlby/lightning-browser-extension/wiki/Test-setup) for different connectors (i.e. LND)
- [Thunderhub](https://thunderhub.regtest.getalby.com/) for testing nodes (PW: `getalby`)
  Currently only lists LND nodes
- [LNDhub.go API Swagger](https://lndhub.regtest.getalby.com/swagger/index.html)

[How to run Alby in the local development environment.](./doc/Setup.md)


# ⭐  Contributing

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


[Contribution guide for new developers.](./doc/Contribution.md)

[Contributor Covenant Code of Conduct.](./doc/CODE_OF_CONDUCT.md)



## ❔ FAQs

#### Why not use Joule?

Joule is a full interface to manage a LND node. It only supports one LND account.
Our goal is NOT to write a full UI for a Lightning Network node with all the channel management features, but instead to only focus on what is necessary for the web (for payment and authentication flows). We believe there are already way better management UIs.
Also we focus on supporting multiple different node backends (non-custodial and custodial).

#### What is WebLN?

WebLN is a library and set of specifications for lightning apps and client providers to facilitate communication between apps and users' lightning nodes in a secure way. It provides a programmatic, permissioned interface for letting applications ask users to send payments, generate invoices to receive payments, and much more. [This documentation](https://webln.guide/) covers how to use WebLN in your Lightning-driven applications.

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
