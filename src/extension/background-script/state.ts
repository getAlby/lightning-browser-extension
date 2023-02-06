import merge from "lodash.merge";
import pick from "lodash.pick";
import browser from "webextension-polyfill";
import createState from "zustand";
import { CURRENCIES } from "~/common/constants";
import { decryptData } from "~/common/lib/crypto";
import { Migration } from "~/extension/background-script/migrations";
import i18n from "~/i18n/i18nConfig";
import type { Account, Accounts, SettingsStorage } from "~/types";

import connectors from "./connectors";
import type Connector from "./connectors/connector.interface";
import Liquid from "./liquid";
import Nostr from "./nostr";

interface State {
  account: Account | null;
  accounts: Accounts;
  migrations: Migration[] | null;
  connector: Connector | null;
  currentAccountId: string | null;
  nostrPrivateKey: string | null;
  liquid: Liquid | null;
  nostr: Nostr | null;
  getAccount: () => Account | null;
  getConnector: () => Promise<Connector>;
  getLiquid: () => Liquid;
  getNostr: () => Nostr;
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
  migrations: Migration[] | null;
  nostrPrivateKey: string | null;
}

export const DEFAULT_SETTINGS: SettingsStorage = {
  browserNotifications: true,
  websiteEnhancements: true,
  legacyLnurlAuth: false,
  isUsingLegacyLnurlAuthKey: false,
  userName: "",
  userEmail: "",
  locale: i18n.resolvedLanguage,
  theme: "system",
  showFiat: true,
  currency: CURRENCIES.USD,
  exchange: "alby",
  debug: false,
  nostrEnabled: false,
  closedTips: [],
};

// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorageDefaults: BrowserStorage = {
  settings: { ...DEFAULT_SETTINGS }, // duplicate DEFALT_SETTINGS
  accounts: {},
  currentAccountId: null,
  migrations: [],
  nostrPrivateKey: null,
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
  liquid: null,
  nostr: null,
  nostrPrivateKey: null,
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
  getLiquid: () => {
    if (get().liquid) {
      return get().liquid as Liquid;
    }
    const currentAccountId = get().currentAccountId as string;
    const account = get().accounts[currentAccountId];

    const password = get().password as string;
    const privateKey = decryptData(
      account.liquidPrivateKey as string,
      password
    );

    const liquid = new Liquid(privateKey);
    set({ liquid: liquid });

    return liquid;
  },
  getNostr: () => {
    if (get().nostr) {
      return get().nostr as Nostr;
    }
    const currentAccountId = get().currentAccountId as string;
    const account = get().accounts[currentAccountId];

    const password = get().password as string;
    const privateKey = decryptData(account.nostrPrivateKey as string, password);

    const nostr = new Nostr(privateKey);
    set({ nostr: nostr });

    return nostr;
  },
  lock: async () => {
    const connector = get().connector;
    if (connector) {
      await connector.unload();
    }
    set({
      password: null,
      connector: null,
      account: null,
      nostr: null,
      liquid: null,
    });
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
