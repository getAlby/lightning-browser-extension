import useSWR, { mutate } from "swr";
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

export interface UnlockRes {
  currentAccountId: string;
}

interface BlocklistRes {
  blocked: boolean;
}

export const getAccountInfo = (): Promise<AccountInfoRes> =>
  msg.request<AccountInfoRes>("accountInfo");

export const getAccountInfoKey = (
  id: string | null | undefined
): string | null => (id ? `accountInfo/${id}` : null);

// useSWR hook is expected to be called in every render, hence we expect parameter id null to skip fetching
export const useAccountInfoCached = async (
  id: string | null
): Promise<AccountInfo | null> => {
  const { data, error } = await useSWR<AccountInfoRes>(
    getAccountInfoKey(id),
    getAccountInfo
  );

  if (!data) return null;
  // @Todo: how to handle this error in the calling function ?
  if (error) throw error;

  return buildAccountInfo(id, data);
};

// revalidation (mark the data as expired and trigger a refetch) for the resource
export const refetchAccountInfo = async (
  id: string | null
): Promise<AccountInfo | null> => {
  const data = await mutate<AccountInfoRes>(
    getAccountInfoKey(id),
    getAccountInfo
  );
  if (!data) return null;

  return buildAccountInfo(id, data);
};

const buildAccountInfo = (
  id: string | null,
  data: AccountInfoRes
): AccountInfo => {
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
  msg.request("removeAccount", { id });
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
  useAccountInfoCached,
  refetchAccountInfo,
  removeAccount,
  unlock,
  getBlocklist,
  getInvoices,
  lnurlAuth,
  getCurrencyRate,
};
