import merge from "lodash/merge";
import pick from "lodash/pick";
import browser from "webextension-polyfill";
import createState from "zustand";
import { CURRENCIES } from "~/common/constants";
import { decryptData } from "~/common/lib/crypto";
import i18n from "~/i18n/i18nConfig";
import type { Account, Accounts, SettingsStorage } from "~/types";

import connectors from "./connectors";
import type Connector from "./connectors/connector.interface";

interface State {
  account: Account | null;
  accounts: Accounts;
  migrations: Array<string> | null;
  connector: Connector | null;
  currentAccountId: string | null;
  getAccount: () => Account | null;
  getConnector: () => Promise<Connector>;
  init: () => Promise<void>;
  isUnlocked: () => boolean;
  lock: () => Promise<void>;
  password: string | null;
  saveToStorage: () => Promise<void>;
  settings: SettingsStorage;
  reset: () => Promise<void>;
}

interface BrowserStorage {
  settings: SettingsStorage;
  accounts: Accounts;
  currentAccountId: string | null;
  migrations: Array<string> | null;
}

export const DEFAULT_SETTINGS: SettingsStorage = {
  websiteEnhancements: true,
  legacyLnurlAuth: false,
  isUsingLegacyLnurlAuthKey: false,
  userName: "",
  userEmail: "",
  locale: i18n.resolvedLanguage,
  theme: "system",
  currency: CURRENCIES.USD,
  exchange: "alby",
  debug: false,
};

// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorageDefaults: BrowserStorage = {
  settings: { ...DEFAULT_SETTINGS }, // duplicate DEFALT_SETTINGS
  accounts: {},
  currentAccountId: null,
  migrations: [],
};

const browserStorageKeys = Object.keys(browserStorageDefaults) as Array<
  keyof BrowserStorage
>;

const state = createState<State>((set, get) => ({
  connector: null,
  account: null,
  settings: DEFAULT_SETTINGS,
  migrations: [],
  accounts: {},
  currentAccountId: null,
  password: null,
  getAccount: () => {
    const currentAccountId = get().currentAccountId as string;
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
    const config = decryptData(account.config as string, password);

    const connector = new connectors[account.connector](config);
    await connector.init();

    set({ connector: connector });

    return connector;
  },
  lock: async () => {
    const connector = get().connector;
    if (connector) {
      await connector.unload();
    }
    set({ password: null, connector: null, account: null });
  },
  isUnlocked: () => {
    return get().password !== null;
  },
  init: () => {
    return browser.storage.sync.get(browserStorageKeys).then((result) => {
      // Deep merge to ensure that nested defaults are also merged instead of overwritten.
      const data = merge(browserStorageDefaults, result as BrowserStorage);
      set(data);
    });
  },
  reset: async () => {
    set({ ...browserStorageDefaults });
    get().saveToStorage();
  },
  saveToStorage: () => {
    const current = get();
    const data = {
      ...browserStorageDefaults,
      ...pick(current, browserStorageKeys),
    };
    return browser.storage.sync.set(data);
  },
}));

export default state;
