import * as accounts from "./actions/accounts";
import * as ln from "./actions/ln";
import * as allowances from "./actions/allowances";
import * as setup from "./actions/setup";

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
  enable: allowances.enable,
  getAllowance: allowances.get,
  isUnlocked: accounts.isUnlocked,
  unlock: accounts.unlock,
  getInfo: ln.getInfo,
  getBalance: ln.getBalance,
  getTransactions: ln.getTransactions,
  setPassword: setup.setPassword,
  addAccount: accounts.add,
  selectAccount: accounts.select,
  reset: setup.reset,
  status: setup.status,
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
