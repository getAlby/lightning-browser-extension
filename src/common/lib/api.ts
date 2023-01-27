import useSWR from "swr";
import { ACCOUNT_CURRENCIES } from "~/common/constants";
import {
  ConnectPeerArgs,
  ConnectPeerResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
} from "~/extension/background-script/connectors/connector.interface";
import type {
  AccountInfo,
  Accounts,
  Allowance,
  DbPayment,
  Invoice,
  LnurlAuthResponse,
  MessageInvoices,
  MessageLnurlAuth,
  MessageSettingsSet,
  NodeInfo,
  SettingsStorage,
} from "~/types";

import {
  getAccountsCache,
  removeAccountFromCache,
  storeAccounts,
} from "./cache";
import msg from "./msg";

export interface AccountInfoRes {
  balance: { balance: string | number; currency: ACCOUNT_CURRENCIES };
  currentAccountId: string;
  info: { alias: string; pubkey?: string };
  name: string;
}

export interface StatusRes {
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

export const getAccountInfo = (): Promise<AccountInfoRes> =>
  msg.request<AccountInfoRes>("accountInfo");

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
        const { balance: resBalance, currency } = response.balance;
        const name = response.name;
        const balance =
          typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts
        const account = {
          id,
          name,
          alias,
          balance,
          currency: currency || "BTC", // set default currency for every account
        };
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

export const useSwrGetAccountInfoTest = async (
  id: string | null
): Promise<AccountInfo | null> => {
  const key = id ? "accountInfo/" + id : null;
  const { data, error } = await useSWR(key, getAccountInfo);

  if (!data) return null;

  if (error) throw error;

  const alias = data.info.alias;
  const { balance: resBalance, currency } = data.balance;
  const name = data.name;
  const balance =
    typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts

  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: id!,
    name,
    alias,
    balance,
    currency: currency || "BTC", // set default currency for every account
  };
};

export const getAccounts = () => msg.request<Accounts>("getAccounts");
export const updateAllowance = () => msg.request<Accounts>("updateAllowance");
export const selectAccount = (id: string) =>
  msg.request("selectAccount", { id });
export const getAllowance = (host: string) =>
  msg.request<Allowance>("getAllowance", { host });
export const getPayments = (options: { limit: number }) =>
  msg.request<{ payments: DbPayment[] }>("getPayments", options);
export const getSettings = () => msg.request<SettingsStorage>("getSettings");
export const getStatus = () => msg.request<StatusRes>("status");
export const getInfo = () => msg.request<NodeInfo>("getInfo");
export const makeInvoice = ({ amount, memo }: MakeInvoiceArgs) =>
  msg.request<MakeInvoiceResponse["data"]>("makeInvoice", { amount, memo });
export const connectPeer = ({ host, pubkey }: ConnectPeerArgs) =>
  msg.request<ConnectPeerResponse["data"]>("connectPeer", { host, pubkey });
export const setSetting = (setting: MessageSettingsSet["args"]["setting"]) =>
  msg.request<SettingsStorage>("setSetting", {
    setting,
  });
export const removeAccount = (id: string) =>
  Promise.all([
    msg.request("removeAccount", { id }),
    removeAccountFromCache(id),
  ]);
export const unlock = (password: string) =>
  msg.request<UnlockRes>("unlock", { password });
export const getBlocklist = (host: string) =>
  msg.request<BlocklistRes>("getBlocklist", { host });
export const getInvoices = (options?: MessageInvoices["args"]) =>
  msg.request<{ invoices: Invoice[] }>("getInvoices", options);
export const lnurlAuth = (
  options: MessageLnurlAuth["args"]
): Promise<LnurlAuthResponse> =>
  msg.request<LnurlAuthResponse>("lnurlAuth", options);

export const getCurrencyRate = async () =>
  msg.request<{ rate: number }>("getCurrencyRate");

export default {
  getAccountInfo,
  getAccounts,
  getInfo,
  selectAccount,
  getAllowance,
  updateAllowance,
  getPayments,
  getSettings,
  getStatus,
  makeInvoice,
  connectPeer,
  setSetting,
  swr: {
    getAccountInfo: swrGetAccountInfo,
    useSwrGetAccountInfoTest: useSwrGetAccountInfoTest,
  },
  removeAccount,
  unlock,
  getBlocklist,
  getInvoices,
  lnurlAuth,
  getCurrencyRate,
};
