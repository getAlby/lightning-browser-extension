import browser from "webextension-polyfill";
import createState from "zustand";

import { decryptData } from "../../common/lib/crypto";
import connectors from "./connectors";

type Connector = any;

type BrowserStorageKeys = "settings" | "accounts" | "currentAccountId";

interface Account {
  connector: "base" | "native" | "lnd" | "lndhub" | "lnbits";
  config: any;
}

interface State {
  connector: any;
  account: Account | null;
  settings: any;
  accounts: {
    [key: string]: Account;
  };
  currentAccountId: string | null;
  password: string | null;
  getConnector: () => Connector | null;
}

// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorage = {
  settings: {},
  accounts: {},
  currentAccountId: null,
};

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
    if ((password = get().password) && account) {
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
        const data: State[BrowserStorageKeys] = {};
        const browserStorageKeys = Object.keys(
          browserStorage
        ) as BrowserStorageKeys[];
        browserStorageKeys.forEach((key) => {
          data[key] = result[key] || browserStorage[key];
        });
        set(data);
      });
  },
  saveToStorage: () => {
    const current = get();
    const data: State[BrowserStorageKeys] = {};
    const browserStorageKeys = Object.keys(
      browserStorage
    ) as BrowserStorageKeys[];
    browserStorageKeys.forEach((key) => {
      data[key] = current[key] || browserStorage[key];
    });
    return browser.storage.sync.set(data);
  },
}));

const browserStorageKeys = Object.keys(browserStorage) as BrowserStorageKeys[];
browserStorageKeys.forEach((key) => {
  console.log(`Adding state subscription for ${key}`);
  state.subscribe(
    (newValue, previousValue) => {
      //if (previous && Object.keys(previous) > 0) {
      const data: State[BrowserStorageKeys] = {};
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
