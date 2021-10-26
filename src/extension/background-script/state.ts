import browser from "webextension-polyfill";
import createState from "zustand";

import { decryptData } from "../../common/lib/crypto";
import connectors from "./connectors";

// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorage = {
  settings: {},
  accounts: {},
  currentAccountId: null,
};

interface State {
  connector: any;
  account: any;
  settings: any;
  accounts: any;
  currentAccountId: string | null;
  password: string | null;
}

const state = createState<State>((set, get) => ({
  connector: null,
  account: null,
  settings: {},
  accounts: {},
  currentAccountId: null,
  password: null,
  getAccount: () => {
    const currentAccountId = get().currentAccountId;
    let account = null;
    if (currentAccountId) {
      account = get().accounts[currentAccountId];
    }
    return account;
  },
  getConnector: () => {
    const currentAccountId = get().currentAccountId;
    let account = null;
    if (currentAccountId) {
      account = get().accounts[currentAccountId];
    }

    let password = null;
    if ((password = get().password)) {
      const config = decryptData(account.config, password);

      const connector = new connectors[account.connector](config);
      // TODO memoize connector?
      set({ connector: connector });

      return connector;
    }
    return null;
  },
  lock: () => set({ password: null, connector: null, account: null }),
  init: () => {
    return browser.storage.sync
      .get(Object.keys(browserStorage))
      .then((result) => {
        const data = {};
        Object.keys(browserStorage).forEach((key) => {
          data[key] = result[key] || browserStorage[key];
        });
        set(data);
      });
  },
  saveToStorage: () => {
    const current = get();
    const data = {};
    Object.keys(browserStorage).forEach((key) => {
      data[key] = current[key] || browserStorage[key];
    });
    return browser.storage.sync.set(data);
  },
}));

Object.keys(browserStorage).forEach((key) => {
  console.log(`Adding state subscription for ${key}`);
  state.subscribe(
    (newValue, previousValue) => {
      //if (previous && Object.keys(previous) > 0) {
      const data = {};
      data[key] = newValue;
      return browser.storage.sync.set(data);
      //}
      //return Promise.resolve();
    },
    (state) => state[key],
    (newValue, previousValue) => {
      // NOTE: using JSON.stringify to compare objects
      return JSON.stringify(newValue) === JSON.stringify(previousValue);
    }
  );
});

export default state;
