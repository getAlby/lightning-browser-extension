import browser from "webextension-polyfill";
import createState from "zustand";

import { decryptData } from "../../common/lib/crypto";
import connectors from "./connectors";
import type Connector from "./connectors/connector.interface";

type BrowserStorageKeys = "settings" | "accounts" | "currentAccountId";

interface Account {
  connector: keyof typeof connectors;
  config: string;
}

interface State {
  connector: Connector | null;
  account: Account | null;
  settings: Record<string, unknown>;
  accounts: Record<string, Account>;
  currentAccountId: string | null;
  password: string | null;
  getAccount: () => Account | null;
  getConnector: () => Promise<Connector>;
  lock: () => Promise<void>;
  init: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const DEFAULT_SETTINGS = {
  websiteEnhancements: true,
  userName: "",
};

// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorage: {
  settings: Record<string, unknown>;
  accounts: Record<string, Account>;
  currentAccountId: string | null;
} = {
  settings: DEFAULT_SETTINGS,
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
  getConnector: async () => {
    if (get().connector) {
      return get().connector as Connector;
    }
    const currentAccountId = get().currentAccountId as string;
    const account = get().accounts[currentAccountId];

    const password = get().password as string;
    const config = decryptData(account.config, password);

    const connector = new connectors[account.connector](config);
    await connector.init();

    set({ connector: connector });

    return connector;
  },
  lock: async () => {
    const connector = get().connector;
    if (connector) {
      connector.unload();
    }
    set({ password: null, connector: null, account: null });
  },
  init: () => {
    return browser.storage.sync
      .get(Object.keys(browserStorage))
      .then((result) => {
        const data = { ...browserStorage };
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
