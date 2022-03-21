import utils from "./utils";
import type {
  Accounts,
  AccountInfo,
  Allowance,
  Transaction,
  SettingsStorage,
} from "../../types";
import {
  getAccountsCache,
  removeAccountFromCache,
  storeAccounts,
} from "./cache";

interface AccountInfoRes {
  currentAccountId: string;
  info: { alias: string };
  balance: { balance: string };
}

interface StatusRes {
  configured: boolean;
  unlocked: boolean;
  currentAccountId: string;
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
  callback?: (account: AccountInfo) => void
): Promise<AccountInfo> => {
  const accountsCache = await getAccountsCache();

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
      storeAccounts({
        ...accountsCache,
        [id]: account,
      });
      if (callback) callback(account);
      return resolve(account);
    });
  });
};
export const getAccounts = () => utils.call<Accounts>("getAccounts");
export const selectAccount = (id: string) =>
  utils.call("selectAccount", { id });
export const getAllowance = (host: string) =>
  utils.call<Allowance>("getAllowance", { host });
export const getPayments = (options: { limit: number }) =>
  utils.call<{ payments: Transaction[] }>("getPayments", options);
export const getSettings = () => utils.call<SettingsStorage>("getSettings");
export const getStatus = () => utils.call<StatusRes>("status");
export const setSetting = (
  setting: Record<string, string | number | boolean>
) =>
  utils.call<SettingsStorage>("setSetting", {
    setting,
  });
export const deleteAccount = (id: string) =>
  Promise.all([
    utils.call("deleteAccount", { id }),
    removeAccountFromCache(id),
  ]);
export const unlock = (password: string) =>
  utils.call<UnlockRes>("unlock", { password });

export default {
  getAccountInfo,
  getAccounts,
  selectAccount,
  getAllowance,
  getPayments,
  getSettings,
  getStatus,
  setSetting,
  swr: {
    getAccountInfo: swrGetAccountInfo,
  },
  deleteAccount,
  unlock,
};
