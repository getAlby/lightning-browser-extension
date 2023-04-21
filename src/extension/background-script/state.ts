import merge from "lodash.merge";
import pick from "lodash.pick";
import browser from "webextension-polyfill";
import createState from "zustand";
import { DEFAULT_SETTINGS } from "~/common/constants";
import { decryptData } from "~/common/lib/crypto";
import { isManifestV3 } from "~/common/utils/mv3";
import { Migration } from "~/extension/background-script/migrations";
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
  getNostr: () => Promise<Nostr>;
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

let storage: "sync" | "local" = "sync";

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

    const connector = new connectors[account.connector](account, config);
    await connector.init();

    set({ connector: connector });

    return connector;
  },
  getNostr: async () => {
    if (get().nostr) {
      return get().nostr as Nostr;
    }
    const currentAccountId = get().currentAccountId as string;
    const account = get().accounts[currentAccountId];

    const password = await get().password();
    if (!password) throw new Error("Password is not set");
    const privateKey = decryptData(account.nostrPrivateKey as string, password);

    const nostr = new Nostr(privateKey);
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

    const allTabs = await browser.tabs.query({ title: "Alby" });

    // https://stackoverflow.com/a/54317362/1667461
    const allTabIds = Array.from(allTabs, (tab) => tab.id).filter(
      (i): i is number => {
        return typeof i === "number";
      }
    );

    browser.tabs.remove(allTabIds);

    const connector = get().connector;
    if (connector) {
      await connector.unload();
    }
    set({ connector: null, account: null, nostr: null });
  },
  isUnlocked: async () => {
    const password = await await get().password();
    return !!password;
  },
  init: () => {
    return browser.storage.sync
      .get(browserStorageKeys)
      .then((result) => {
        // Deep merge to ensure that nested defaults are also merged instead of overwritten.
        const data = merge(browserStorageDefaults, result as BrowserStorage);
        set(data);
      })
      .catch((e) => {
        console.info("storage.sync is not available. using storage.local");
        storage = "local";
        return browser.storage.local.get("__sync").then((result) => {
          // Deep merge to ensure that nested defaults are also merged instead of overwritten.
          const data = merge(
            browserStorageDefaults,
            result.mockSync as BrowserStorage
          );
          set(data);
        });
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

    if (storage === "sync") {
      return browser.storage.sync.set(data);
    } else {
      // because there's an overlap with accounts being stored in
      // the local storage, see src/common/lib/cache.ts
      return browser.storage.local.set({ __sync: data });
    }
  },
}));

export default state;
