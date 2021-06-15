import * as accounts from "./accounts";

const connectorCall = (state, message, sender) => {
  console.log(`Lightning call ${message.type}`);
  const method = message.type.split(".").reverse()[0];

  return state.connector[method]({
    args: message.args,
    origin: message.origin,
    type: method,
  });
};

const routes = {
  ln: {
    getInfo: connectorCall,
    isUnlocked: connectorCall,
  },
  accounts: accounts,
  isUnlocked: accounts.isUnlocked,
};

const router = (path) => {
  const routeParts = path.split(".");
  const route = routeParts.reduce((route, path) => {
    return route[path];
  }, routes);
  if (!route) {
    console.log(`Route not found: ${path}`);
    return Promise.reject({ error: `${path} not found}` });
  }
  return route;
};

export { routes, router };
