import * as accounts from "./actions/accounts";
import * as alby from "./actions/alby";
import * as allowances from "./actions/allowances";
import * as blocklist from "./actions/blocklist";
import * as cache from "./actions/cache";
import * as liquid from "./actions/liquid";
import * as ln from "./actions/ln";
import lnurl, { auth } from "./actions/lnurl";
import * as mnemonic from "./actions/mnemonic";
import * as nostr from "./actions/nostr";
import * as payments from "./actions/payments";
import * as permissions from "./actions/permissions";
import * as settings from "./actions/settings";
import * as setup from "./actions/setup";
import * as swaps from "./actions/swaps";
import * as webbtc from "./actions/webbtc";
import * as webln from "./actions/webln";

const routes = {
  addAllowance: allowances.add,
  getAllowance: allowances.get,
  getAllowanceById: allowances.getById,
  listAllowances: allowances.list,
  deleteAllowance: allowances.deleteAllowance,
  updateAllowance: allowances.updateAllowance,
  addPermission: permissions.add,
  deletePermission: permissions.deletePermission,
  deletePermissionsById: permissions.deleteByIds,
  listPermissions: permissions.listByAllowance,
  lock: accounts.lock,
  unlock: accounts.unlock,
  getInfo: ln.getInfo,
  getTransactions: ln.getTransactions,
  sendPayment: ln.sendPayment,
  sendPaymentAsync: ln.sendPaymentAsync,
  keysend: ln.keysend,
  checkPayment: ln.checkPayment,
  signMessage: ln.signMessage,
  makeInvoice: ln.makeInvoice,
  connectPeer: ln.connectPeer,
  getPayments: payments.all,
  getPaymentsByAccount: payments.listByAccount,
  accountInfo: accounts.info,
  accountDecryptedDetails: accounts.decryptedDetails,
  addAccount: accounts.add,
  editAccount: accounts.edit,
  getAccounts: accounts.all,
  getAccount: accounts.get,
  removeAccount: accounts.remove,
  selectAccount: accounts.select,
  setPassword: setup.setPassword,
  reset: setup.reset,
  status: setup.status,
  validateAccount: setup.validateAccount,
  setIcon: setup.setIconMessageHandler,
  changePassword: settings.changePassword,
  setSetting: settings.set,
  getSettings: settings.get,
  addBlocklist: blocklist.add,
  deleteBlocklist: blocklist.deleteBlocklist,
  getBlocklist: blocklist.get,
  listBlocklist: blocklist.list,
  lnurl: lnurl,
  lnurlAuth: auth,
  getCurrencyRate: cache.getCurrencyRate,
  setMnemonic: mnemonic.setMnemonic,
  getMnemonic: mnemonic.getMnemonic,
  generateMnemonic: mnemonic.generateMnemonic,
  getSwapInfo: swaps.info,
  createSwap: swaps.createSwap,
  liquid: {
    signPset: liquid.signPset,
    getPsetPreview: liquid.getPsetPreview,
    fetchAssetRegistry: liquid.fetchAssetRegistry,
  },
  nostr: {
    generatePrivateKey: nostr.generatePrivateKey,
    getPrivateKey: nostr.getPrivateKey,
    getPublicKey: nostr.getPublicKey,
    removePrivateKey: nostr.removePrivateKey,
    setPrivateKey: nostr.setPrivateKey,
  },
  webbtc: {
    getPsbtPreview: webbtc.getPsbtPreview,
    signPsbt: webbtc.signPsbt,
    getAddress: webbtc.getAddress,
  },

  // Public calls that are accessible from the inpage script (through the content script)
  public: {
    webbtc: {
      isEnabled: webbtc.isEnabled,
      enable: webbtc.enable,
      getInfo: webbtc.getInfo,
      signPsbtWithPrompt: webbtc.signPsbtWithPrompt,
      getAddressOrPrompt: webbtc.getAddressOrPrompt,
    },
    alby: {
      isEnabled: alby.isEnabled,
      enable: alby.enable,
      addAccount: accounts.promptAdd,
    },
    webln: {
      enable: webln.enable,
      isEnabled: webln.isEnabled,
      getInfo: ln.getInfo,
      sendPaymentOrPrompt: webln.sendPaymentOrPrompt,
      sendPaymentAsyncWithPrompt: webln.sendPaymentAsyncWithPrompt,
      keysendOrPrompt: webln.keysendOrPrompt,
      signMessageOrPrompt: webln.signMessageOrPrompt,
      lnurl: webln.lnurl,
      makeInvoice: webln.makeInvoiceOrPrompt,
      getBalanceOrPrompt: webln.getBalanceOrPrompt,
      request: ln.request,
    },
    liquid: {
      isEnabled: liquid.isEnabled,
      enable: liquid.enable,
      getAddressOrPrompt: liquid.getAddressOrPrompt,
      signPsetWithPrompt: liquid.signPsetWithPrompt,
    },
    nostr: {
      isEnabled: nostr.isEnabled,
      enable: nostr.enable,
      getPublicKeyOrPrompt: nostr.getPublicKeyOrPrompt,
      signEventOrPrompt: nostr.signEventOrPrompt,
      signSchnorrOrPrompt: nostr.signSchnorrOrPrompt,
      encryptOrPrompt: nostr.encryptOrPrompt,
      decryptOrPrompt: nostr.decryptOrPrompt,
      nip44EncryptOrPrompt: nostr.nip44EncryptOrPrompt,
      nip44DecryptOrPrompt: nostr.nip44DecryptOrPrompt,
    },
  },
};

const router = (path: FixMe) => {
  if (!path) {
    throw new Error("No action path provided to router");
  }
  const routeParts = path.split("/");
  const route = routeParts.reduce((route: FixMe, path: FixMe) => {
    return route[path];
  }, routes);

  if (!route) {
    console.warn(`Route not found: ${path}`);
    // return a function to keep the expected method signature
    return () => {
      return Promise.reject({ error: `${path} not found` });
    };
  }
  return route;
};

export { router, routes };
