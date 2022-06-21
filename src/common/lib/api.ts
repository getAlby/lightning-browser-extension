import {
  MakeInvoiceArgs,
  MakeInvoiceResponse,
} from "~/extension/background-script/connectors/connector.interface";
import type {
  Accounts,
  AccountInfo,
  Allowance,
  Transaction,
  SettingsStorage,
} from "~/types";

import {
  getAccountsCache,
  removeAccountFromCache,
  storeAccounts,
} from "./cache";
import utils from "./utils";

export interface AccountInfoRes {
  balance: { balance: string | number };
  currentAccountId: string;
  info: { alias: string };
  name: string;
}

interface StatusRes {
  configured: boolean;
  unlocked: boolean;
  currentAccountId: string;
}

interface UnlockRes {
  currentAccountId: string;
}

interface BlocklistRes {
  blocked: boolean;
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

  return new Promise((resolve, reject) => {
    if (accountsCache[id]) {
      if (callback) callback(accountsCache[id]);
      resolve(accountsCache[id]);
    }

    // Update account info with most recent data, save to cache.
    getAccountInfo()
      .then((response) => {
        const { alias } = response.info;
        const { balance: resBalance } = response.balance;
        const name = response.name;
        const balance =
          typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts
        const account = { id, name, alias, balance };
        storeAccounts({
          ...accountsCache,
          [id]: account,
        });
        if (callback) callback(account);
        return resolve(account);
      })
      .catch(reject);
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
export const makeInvoice = ({ amount, memo }: MakeInvoiceArgs) =>
  utils.call<MakeInvoiceResponse["data"]>("makeInvoice", { amount, memo });
export const setSetting = (
  setting: Record<string, string | number | boolean>
) =>
  utils.call<SettingsStorage>("setSetting", {
    setting,
  });
export const removeAccount = (id: string) =>
  Promise.all([
    utils.call("removeAccount", { id }),
    removeAccountFromCache(id),
  ]);
export const unlock = (password: string) =>
  utils.call<UnlockRes>("unlock", { password });
export const getBlocklist = (host: string) =>
  utils.call<BlocklistRes>("getBlocklist", { host });

export default {
  getAccountInfo,
  getAccounts,
  selectAccount,
  getAllowance,
  getPayments,
  getSettings,
  getStatus,
  makeInvoice,
  setSetting,
  swr: {
    getAccountInfo: swrGetAccountInfo,
  },
  removeAccount,
  unlock,
  getBlocklist,
};
