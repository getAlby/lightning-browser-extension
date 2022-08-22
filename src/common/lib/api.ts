import {
  ConnectPeerArgs,
  ConnectPeerResponse,
  GetInvoicesResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
} from "~/extension/background-script/connectors/connector.interface";
import type {
  Accounts,
  AccountInfo,
  NodeInfo,
  Allowance,
  SettingsStorage,
  MessageInvoices,
  DbPayment,
  MessageLnurlAuth,
  MessageSettingsSet,
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
  info: { alias: string; pubkey?: string };
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
  utils.call<{ payments: DbPayment[] }>("getPayments", options);
export const getSettings = () => utils.call<SettingsStorage>("getSettings");
export const getStatus = () => utils.call<StatusRes>("status");
export const getInfo = () => utils.call<NodeInfo>("getInfo");
export const makeInvoice = ({ amount, memo }: MakeInvoiceArgs) =>
  utils.call<MakeInvoiceResponse["data"]>("makeInvoice", { amount, memo });
export const connectPeer = ({ host, pubkey }: ConnectPeerArgs) =>
  utils.call<ConnectPeerResponse["data"]>("connectPeer", { host, pubkey });
export const setSetting = (setting: MessageSettingsSet["args"]["setting"]) =>
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
export const getInvoices = (options?: MessageInvoices["args"]) =>
  utils.call<GetInvoicesResponse["data"]>("getInvoices", options);
export const lnurlAuth = (options?: FixMe) => {
  utils.call<MessageLnurlAuth["args"]>("lnurlAuth", options);
};

export default {
  getAccountInfo,
  getAccounts,
  getInfo,
  selectAccount,
  getAllowance,
  getPayments,
  getSettings,
  getStatus,
  makeInvoice,
  connectPeer,
  setSetting,
  swr: {
    getAccountInfo: swrGetAccountInfo,
  },
  removeAccount,
  unlock,
  getBlocklist,
  getInvoices,
  lnurlAuth,
};
