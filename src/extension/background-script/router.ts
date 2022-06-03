import * as accounts from "./actions/accounts";
import * as allowances from "./actions/allowances";
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
    sendPaymentOrPrompt: webln.sendPaymentOrPrompt,
    keysendOrPrompt: webln.keysendOrPrompt,
    signMessageOrPrompt: webln.signMessageOrPrompt,
    lnurl: webln.lnurl,
    makeInvoice: webln.makeInvoiceOrPrompt,
    verifyMessage: ln.verifyMessage,
  },
  addAllowance: allowances.add,
  getAllowance: allowances.get,
  getAllowanceById: allowances.getById,
  listAllowances: allowances.list,
  deleteAllowance: allowances.deleteAllowance,
  updateAllowance: allowances.updateAllowance,
  lock: accounts.lock,
  isUnlocked: accounts.isUnlocked,
  unlock: accounts.unlock,
  getInfo: ln.getInfo,
  sendPayment: ln.sendPayment,
  keysend: ln.keysend,
  checkPayment: ln.checkPayment,
  signMessage: ln.signMessage,
  makeInvoice: ln.makeInvoice,
  getBalance: ln.getBalance,
  getPayments: payments.all,
  accountInfo: accounts.info,
  addAccount: accounts.add,
  editAccount: accounts.edit,
  getAccounts: accounts.all,
  removeAccount: accounts.remove,
  deleteAccount: accounts.deleteAccount,
  selectAccount: accounts.select,
  setPassword: setup.setPassword,
  reset: setup.reset,
  status: setup.status,
  validateAccount: setup.validateAccount,
  setIcon: setup.setIcon,
  setSetting: settings.set,
  getSettings: settings.get,
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
    console.log(`Route not found: ${path}`);
    // return a function to keep the expected method signature
    return () => {
      return Promise.reject({ error: `${path} not found}` });
    };
  }
  return route;
};

export { routes, router };
