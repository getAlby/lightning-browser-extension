import { ACCOUNT_CURRENCIES } from "~/common/constants";
import {
  ConnectPeerArgs,
  ConnectPeerResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
} from "~/extension/background-script/connectors/connector.interface";
import type {
  Account,
  AccountInfo,
  Accounts,
  Allowance,
  ConnectorType,
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
  connector: ConnectorType;
  balance: { balance: string | number; currency: ACCOUNT_CURRENCIES };
  currentAccountId: string;
  info: { alias: string; pubkey?: string };
  name: string;
}

export interface GetAccountRes
  extends Pick<Account, "id" | "connector" | "name"> {
  nostrEnabled: boolean;
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

export const getAccountInfo = () => msg.request<AccountInfoRes>("accountInfo");

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
        const connector = response.connector;
        const balance =
          typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts
        const account = {
          id,
          name,
          alias,
          balance,
          connector,
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
export const getAccounts = () => msg.request<Accounts>("getAccounts");
export const getAccount = () => msg.request<GetAccountRes>("getAccount");
export const updateAllowance = () => msg.request<Accounts>("updateAllowance");
export const selectAccount = (id: string) =>
  msg.request("selectAccount", { id });
export const getAllowance = (host: string) =>
  msg.request<Allowance>("getAllowance", { host });
export const getPayments = (options?: { limit?: number }) =>
  msg.request<{ payments: DbPayment[] }>("getPayments", options);
export const getPaymentsByAccount = (options: {
  accountId: Account["id"];
  limit: number;
}) => msg.request<{ payments: DbPayment[] }>("getPaymentsByAccount", options);
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
  getAccount,
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
  },
  removeAccount,
  unlock,
  getBlocklist,
  getInvoices,
  lnurlAuth,
  getCurrencyRate,
};
