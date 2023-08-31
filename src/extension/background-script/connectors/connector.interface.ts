import {
  CreateSwapParams,
  CreateSwapResponse,
  SwapInfoResponse,
} from "@getalby/sdk/dist/types";
import { ACCOUNT_CURRENCIES } from "~/common/constants";
import { OAuthToken } from "~/types";

export interface WebLNNode {
  alias: string;
  pubkey?: string;
  color?: string;
}

interface Route {
  total_amt: number;
  total_fees: number;
}

export interface ConnectorInvoice {
  custom_records?: {
    "696969"?: string;
    "7629169"?: string;
    "5482373484"?: string;
  } & Record<string, string>;
  id: string;
  memo: string;
  preimage: string;
  settled: boolean;
  settleDate: number;
  totalAmount: string;
  type: "received";
}

export interface MakeInvoiceArgs {
  amount: string | number;
  memo: string;
}

export type MakeInvoiceResponse = {
  data: {
    paymentRequest: string;
    rHash: string;
  };
};

export type GetInfoResponse<T extends WebLNNode = WebLNNode> = {
  data: T;
};

export type GetBalanceResponse = {
  data: {
    balance: number;
    currency?: ACCOUNT_CURRENCIES;
  };
};

export type GetInvoicesResponse = {
  data: {
    invoices: ConnectorInvoice[];
  };
};

export type SendPaymentResponse = {
  data: {
    preimage: string;
    paymentHash: string;
    route: Route;
  };
};

export interface SendPaymentArgs {
  paymentRequest: string;
}

export interface KeysendArgs {
  pubkey: string;
  amount: number;
  customRecords: Record<string, string>;
}

export interface CheckPaymentArgs {
  paymentHash: string;
}

export type CheckPaymentResponse = {
  data: {
    paid: boolean;
    preimage?: string;
  };
};

export interface SignMessageArgs {
  message: string;
  key_loc: {
    key_family: number;
    key_index: number;
  };
}

export interface SignMessageResponse {
  data: {
    message: string;
    signature: string;
  };
}

export interface ConnectPeerResponse {
  data: boolean;
}

export interface ConnectPeerArgs {
  pubkey: string;
  host: string;
}

export default interface Connector {
  init(): Promise<void>;
  unload(): Promise<void>;
  getInfo(): Promise<GetInfoResponse>;
  getBalance(): Promise<GetBalanceResponse>;
  getInvoices(): Promise<GetInvoicesResponse>;
  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse>;
  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse>;
  keysend(args: KeysendArgs): Promise<SendPaymentResponse>;
  checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse>;
  signMessage(args: SignMessageArgs): Promise<SignMessageResponse>;
  connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse>;
  supportedMethods?: string[];
  requestMethod?(
    method: string,
    args: Record<string, unknown>
  ): Promise<{ data: unknown }>;
  getOAuthToken?(): OAuthToken | undefined;
  getSwapInfo?(): Promise<SwapInfoResponse>;
  createSwap?(params: CreateSwapParams): Promise<CreateSwapResponse>;
}

export function flattenRequestMethods(methods: string[]) {
  return methods.map((method) => `request.${method}`);
}
