import * as accounts from "./actions/accounts";
import * as ln from "./actions/ln";
import lnurl, { lnurlPay } from "./actions/lnurl";
import * as webln from "./actions/webln";
import * as allowances from "./actions/allowances";
import * as setup from "./actions/setup";
import * as payments from "./actions/payments";
import * as settings from "./actions/settings";

// TODO: potential nesting/grouping of actions for better organization
const routes = {
  /*
  webln: {
    enable: allowances.enable,
    getInfo: ln.getInfo,
    sendPayment: ln.sendPayment,
  },
  ln: ln,
  accounts: accounts,
  */
  addAllowance: allowances.add,
  enable: allowances.enable,
  getAllowance: allowances.get,
  getAllowanceById: allowances.getById,
  listAllowances: allowances.list,
  deleteAllowance: allowances.deleteAllowance,
  updateAllowance: allowances.updateAllowance,
  lock: accounts.lock,
  isUnlocked: accounts.isUnlocked,
  unlock: accounts.unlock,
  getInfo: ln.getInfo,
  lnurl,
  lnurlPay,
  sendPaymentOrPrompt: webln.sendPaymentOrPrompt,
  signMessageOrPrompt: webln.signMessageOrPrompt,
  sendPayment: ln.sendPayment,
  checkPayment: ln.checkPayment,
  signMessage: ln.signMessage,
  verifyMessage: ln.verifyMessage,
  makeInvoice: ln.makeInvoice,
  getBalance: ln.getBalance,
  getPayments: payments.all,
  setPassword: setup.setPassword,
  accountInfo: accounts.info,
  addAccount: accounts.add,
  getAccounts: accounts.all,
  removeAccount: accounts.remove,
  deleteAccount: accounts.deleteAccount,
  selectAccount: accounts.select,
  reset: setup.reset,
  status: setup.status,
  validateAccount: setup.validateAccount,
  setIcon: setup.setIcon,
  setSetting: settings.set,
  getSettings: settings.get,
};

const router = (path) => {
  if (!path) {
    throw new Error("No action path provided to router");
  }
  const routeParts = path.split("/");
  const route = routeParts.reduce((route, path) => {
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
