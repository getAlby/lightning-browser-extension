import * as accounts from "./actions/accounts";
import * as ln from "./actions/ln";
import * as allowances from "./actions/allowances";

const routes = {
  webln: {
    enable: allowances.enable,
    getInfo: ln.getInfo,
    sendPayment: ln.sendPayment,
  },
  ln: ln,
  accounts: accounts,
  // legacy routes
  isUnlocked: accounts.isUnlocked,
  unlock: accounts.unlock,
  getInfo: ln.getInfo,
  getBalance: ln.getBalance,
  getTransactions: ln.getTransactions,
};

const router = (path) => {
  const routeParts = path.split(".");
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
