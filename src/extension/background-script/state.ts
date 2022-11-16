import merge from "lodash.merge";
import pick from "lodash.pick";
import browser from "webextension-polyfill";
import createState from "zustand";
import { CURRENCIES } from "~/common/constants";
import { decryptData } from "~/common/lib/crypto";
import { isManifestV3 } from "~/common/utils/mv3";
import { Migration } from "~/extension/background-script/migrations";
import i18n from "~/i18n/i18nConfig";
import type { Account, Accounts, SettingsStorage } from "~/types";

import connectors from "./connectors";
import type Connector from "./connectors/connector.interface";
import Nostr from "./nostr";

interface State {
  account: Account | null;
  accounts: Accounts;
  migrations: Migration[] | null;
  connector: Connector | null;
  currentAccountId: string | null;
  nostrPrivateKey: string | null;
  nostr: Nostr | null;
  mv2Password: string | null;
  password: (password?: string | null) => Promise<string | null>;
  getAccount: () => Account | null;
  getConnector: () => Promise<Connector>;
  getNostr: () => Nostr;
  init: () => Promise<void>;
  isUnlocked: () => Promise<boolean>;
  lock: () => Promise<void>;
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
  nostr: null,
  nostrPrivateKey: null,
  mv2Password: null,
  password: async (password) => {
    if (isManifestV3) {
      if (password) {
        // @ts-ignore: https://github.com/mozilla/webextension-polyfill/issues/329
        await browser.storage.session.set({ password });
      }
      // @ts-ignore: https://github.com/mozilla/webextension-polyfill/issues/329
      const storageSessionPassword = await browser.storage.session.get(
        "password"
      );

      return storageSessionPassword.password;
    } else {
      if (password) {
        set({ mv2Password: password });
      }
      return get().mv2Password;
    }
  },
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
    const password = await get().password();

    if (!password) throw new Error("Password is not set");
    const config = decryptData(account.config as string, password);

    const connector = new connectors[account.connector](config);
    await connector.init();

    set({ connector: connector });

    return connector;
  },
  getNostr: () => {
    if (get().nostr) {
      return get().nostr as Nostr;
    }

    const nostr = new Nostr();
    set({ nostr: nostr });

    return nostr;
  },
  lock: async () => {
    if (isManifestV3) {
      // @ts-ignore: https://github.com/mozilla/webextension-polyfill/issues/329
      await browser.storage.session.set({ password: null });
    } else {
      set({ mv2Password: null });
    }
    const connector = await get().connector;
    if (connector) {
      await connector.unload();
    }
    set({ connector: null, account: null });
  },
  isUnlocked: async () => {
    const password = await await get().password();
    return password !== null;
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
