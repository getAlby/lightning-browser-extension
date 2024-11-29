import {
  CreateSwapParams,
  CreateSwapResponse,
  SwapInfoResponse,
} from "@getalby/sdk/dist/types";
import { ACCOUNT_CURRENCIES } from "~/common/constants";
import {
  ConnectPeerArgs,
  ConnectPeerResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SendPaymentAsyncResponse,
  SendPaymentResponse,
} from "~/extension/background-script/connectors/connector.interface";
import type {
  Account,
  AccountInfo,
  Accounts,
  Allowance,
  BitcoinNetworkType,
  ConnectorType,
  DbPayment,
  EsploraAssetRegistry,
  Invoice,
  LnurlAuthResponse,
  MessageAccountEdit,
  MessageAccountValidate,
  MessageGetTransactions,
  MessageLnurlAuth,
  MessageSettingsSet,
  NodeInfo,
  OriginData,
  PsbtPreview,
  PsetPreview,
  SettingsStorage,
  ValidateAccountResponse,
} from "~/types";

import {
  getAccountsCache,
  removeAccountFromCache,
  storeAccounts,
} from "./cache";
import msg from "./msg";

export interface AccountInfoRes {
  connectorType: ConnectorType;
  balance: { balance: string | number; currency: ACCOUNT_CURRENCIES };
  currentAccountId: string;
  info: {
    nostr_pubkey?: string;
    alias: string;
    pubkey?: string;
    lightning_address?: string;
    node_required?: boolean;
    shared_node?: boolean;
    using_fee_credits?: boolean;
    limits?: {
      max_send_volume: number;
      max_send_amount: number;
      max_receive_volume: number;
      max_receive_amount: number;
      max_account_balance: number;
      max_volume_period_in_days: number;
    };
  };
  name: string;
  avatarUrl?: string;
}

export interface GetAccountRes extends Pick<Account, "id" | "name"> {
  connectorType: ConnectorType;
  liquidEnabled: boolean;
  nostrEnabled: boolean;
  hasMnemonic: boolean;
  isMnemonicBackupDone: boolean;
  hasImportedNostrKey: boolean;
  bitcoinNetwork: BitcoinNetworkType;
  useMnemonicForLnurlAuth: boolean;
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
        const connectorType = response.connectorType;
        const balance =
          typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts
        const avatarUrl = response.avatarUrl;
        const account = {
          id,
          name,
          alias,
          balance,
          connectorType,
          currency: currency || "BTC", // set default currency for every account
          avatarUrl,
          lightningAddress: response.info.lightning_address,
          nodeRequired: response.info.node_required,
          sharedNode: response.info.shared_node,
          usingFeeCredits: response.info.using_fee_credits,
          limits: response.info.limits,
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
export const getAccount = (id?: string) =>
  msg.request<GetAccountRes>("getAccount", {
    id,
  });

const validateAccount = (
  account: MessageAccountValidate["args"]
): Promise<ValidateAccountResponse> => msg.request("validateAccount", account);

export const updateAllowance = () => msg.request<Accounts>("updateAllowance");
export const selectAccount = (id: string) =>
  msg.request("selectAccount", { id });
export const editAccount = (
  id: string,
  args: Omit<MessageAccountEdit["args"], "id">
) => msg.request("editAccount", { id, ...args });

export const getAllowance = (host: string) =>
  msg.request<Allowance>("getAllowance", { host });
export const getPayments = (options?: { limit?: number }) =>
  msg.request<{ payments: DbPayment[] }>("getPayments", options);
export const getPaymentsByAccount = (options: {
  accountId: Account["id"];
  limit?: number;
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
export const getTransactions = (options?: MessageGetTransactions["args"]) =>
  msg.request<{ transactions: Invoice[] }>("getTransactions", options);
export const lnurlAuth = (
  options: MessageLnurlAuth["args"]
): Promise<LnurlAuthResponse> =>
  msg.request<LnurlAuthResponse>("lnurlAuth", options);

export const sendPayment = (
  paymentRequest: string,
  origin: OriginData | undefined
) =>
  msg.request<SendPaymentResponse["data"] | { error: string }>(
    "sendPayment",
    { paymentRequest },
    {
      origin,
    }
  );
export const sendPaymentAsync = (
  paymentRequest: string,
  origin: OriginData | undefined
) =>
  msg.request<SendPaymentAsyncResponse["data"] | { error: string }>(
    "sendPaymentAsync",
    { paymentRequest },
    {
      origin,
    }
  );

export const getCurrencyRate = async () =>
  msg.request<{ rate: number }>("getCurrencyRate");

const getNostrPrivateKey = (id: string): Promise<string> =>
  msg.request("nostr/getPrivateKey", {
    id,
  });

const getNostrPublicKey = (id: string): Promise<string> =>
  msg.request("nostr/getPublicKey", {
    id,
  });

const generateNostrPrivateKey = (id: string): Promise<string> =>
  msg.request("nostr/generatePrivateKey", {
    id,
  });

const removeNostrPrivateKey = (id: string): Promise<void> =>
  msg.request("nostr/removePrivateKey", {
    id,
  });

const setNostrPrivateKey = (id: string, privateKey: string): Promise<void> =>
  msg.request("nostr/setPrivateKey", {
    id,
    privateKey,
  });

const getMnemonic = (id: string): Promise<string> =>
  msg.request("getMnemonic", {
    id,
  });

const generateMnemonic = (): Promise<string> => msg.request("generateMnemonic");

// TODO: consider adding removeMnemonic function, make mnemonic a string here rather than optional (null = delete current mnemonic)
const setMnemonic = (id: string, mnemonic: string | null): Promise<void> =>
  msg.request("setMnemonic", {
    id,
    mnemonic,
  });

const getSwapInfo = (): Promise<SwapInfoResponse> => msg.request("getSwapInfo");
const createSwap = (params: CreateSwapParams): Promise<CreateSwapResponse> =>
  msg.request("createSwap", params);
const getLiquidPsetPreview = (pset: string): Promise<PsetPreview> =>
  msg.request("liquid/getPsetPreview", {
    pset,
  });

const fetchLiquidAssetRegistry = (
  psetPreview: PsetPreview
): Promise<EsploraAssetRegistry> =>
  msg.request("liquid/fetchAssetRegistry", {
    psetPreview,
  });

const signPset = (pset: string): Promise<string> =>
  msg.request("liquid/signPset", {
    pset,
  });

const getPsbtPreview = (psbt: string): Promise<PsbtPreview> =>
  msg.request("webbtc/getPsbtPreview", {
    psbt,
  });
const signPsbt = (psbt: string): Promise<string> =>
  msg.request("webbtc/signPsbt", {
    psbt,
  });

export default {
  getAccount,
  getAccountInfo,
  getAccounts,
  editAccount,
  getInfo,
  selectAccount,
  validateAccount,
  getAllowance,
  updateAllowance,
  getPayments,
  getPaymentsByAccount,
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
  getTransactions,
  lnurlAuth,
  getCurrencyRate,
  sendPayment,
  sendPaymentAsync,
  nostr: {
    getPrivateKey: getNostrPrivateKey,
    getPublicKey: getNostrPublicKey,
    generatePrivateKey: generateNostrPrivateKey,
    setPrivateKey: setNostrPrivateKey,
    removePrivateKey: removeNostrPrivateKey,
  },
  getMnemonic,
  setMnemonic,
  generateMnemonic,
  getSwapInfo,
  createSwap,
  liquid: {
    getPsetPreview: getLiquidPsetPreview,
    fetchAssetRegistry: fetchLiquidAssetRegistry,
    signPset: signPset,
  },
  bitcoin: {
    getPsbtPreview,
    signPsbt,
  },
};
