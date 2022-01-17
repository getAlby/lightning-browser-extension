import browser from "webextension-polyfill";

import utils from "./utils";
import type { Account, SettingsStorage } from "../../types";

interface AccountInfoRes {
  currentAccountId: string;
  info: { alias: string };
  balance: { balance: string };
}

interface StatusRes {
  configured: boolean;
  unlocked: boolean;
  currentAccountId: string;
  info: {
    alias: string;
  };
  balance: {
    balance: string;
  };
}

interface UnlockRes {
  currentAccountId: string;
}

export const getAccountInfo = () => utils.call<AccountInfoRes>("accountInfo");
/**
 * stale-while-revalidate get account info
 * @param id - account id
 * @param callback - will be called first with cached (stale) data first, then with fresh data.
 */
export const swrGetAccountInfo = async (
  id: string,
  callback?: (account: Account) => void
): Promise<Account> => {
  // Load account info from cache.
  let accountsCache: { [id: string]: Account } = {};
  const result = await browser.storage.local.get(["accounts"]);
  if (result.accounts) {
    accountsCache = JSON.parse(result.accounts);
  }

  return new Promise((resolve) => {
    if (accountsCache[id]) {
      if (callback) callback(accountsCache[id]);
      resolve(accountsCache[id]);
    }

    // Update account info with most recent data, save to cache.
    getAccountInfo().then((response) => {
      const { alias } = response.info;
      const balance = parseInt(response.balance.balance); // TODO: handle amounts
      const account = { id, alias, balance };
      browser.storage.local.set({
        accounts: JSON.stringify({
          ...accountsCache,
          [id]: account,
        }),
      });
      if (callback) callback(account);
      return resolve(account);
    });
  });
};
export const getSettings = () => utils.call<SettingsStorage>("getSettings");
export const getStatus = () => utils.call<StatusRes>("status");
export const setSetting = (
  setting: Record<string, string | number | boolean>
) =>
  utils.call<SettingsStorage>("setSetting", {
    setting,
  });
export const unlock = (password: string) =>
  utils.call<UnlockRes>("unlock", { password });

export default {
  getAccountInfo,
  getSettings,
  getStatus,
  setSetting,
  swr: {
    getAccountInfo: swrGetAccountInfo,
  },
  unlock,
};
