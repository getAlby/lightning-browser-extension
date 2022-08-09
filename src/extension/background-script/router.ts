import * as accounts from "./actions/accounts";
import * as allowances from "./actions/allowances";
import * as blocklist from "./actions/blocklist";
import * as ln from "./actions/ln";
import lnurl from "./actions/lnurl";
import * as payments from "./actions/payments";
import * as settings from "./actions/settings";
import * as setup from "./actions/setup";
import * as webln from "./actions/webln";

const routes = {
  // webln calls can be made from the webln object injected in the websites. See inject-script
  webln: {
    enable: allowances.enable,
    getInfo: ln.getInfo,
    keysendOrPrompt: webln.keysendOrPrompt,
    lnurl: webln.lnurl,
    makeInvoice: webln.makeInvoiceOrPrompt,
    sendPaymentOrPrompt: webln.sendPaymentOrPrompt,
    signMessageOrPrompt: webln.signMessageOrPrompt,
    verifyMessage: ln.verifyMessage,
  },

  addAllowance: allowances.add,
  deleteAllowance: allowances.deleteAllowance,
  getAllowance: allowances.get,
  getAllowanceById: allowances.getById,
  listAllowances: allowances.list,
  updateAllowance: allowances.updateAllowance,

  accountDecryptedDetails: accounts.decryptedDetails,
  accountInfo: accounts.info,
  addAccount: accounts.add,
  editAccount: accounts.edit,
  getAccounts: accounts.all,
  lock: accounts.lock,
  removeAccount: accounts.remove,
  selectAccount: accounts.select,
  unlock: accounts.unlock,

  checkPayment: ln.checkPayment,
  connectPeer: ln.connectPeer,
  getInfo: ln.getInfo,
  getInvoices: ln.invoices,
  keysend: ln.keysend,
  makeInvoice: ln.makeInvoice,
  sendPayment: ln.sendPayment,
  signMessage: ln.signMessage,
  auth: ln.auth,

  getPayments: payments.all,

  reset: setup.reset,
  setIcon: setup.setIconMessageHandler,
  setPassword: setup.setPassword,
  status: setup.status,
  validateAccount: setup.validateAccount,

  changePassword: settings.changePassword,
  getSettings: settings.get,
  setSetting: settings.set,

  addBlocklist: blocklist.add,
  deleteBlocklist: blocklist.deleteBlocklist,
  getBlocklist: blocklist.get,
  listBlocklist: blocklist.list,

  lnurl: lnurl,
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
      return Promise.reject({ error: `${path} not found}` });
    };
  }
  return route;
};

export { routes, router };
