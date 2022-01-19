interface WebLNNode {
  alias: string;
  pubkey?: string;
  color?: string;
}

interface Route {
  total_amt: number;
  total_fees: number;
}

export interface MakeInvoiceArgs {
  amount: number;
  memo: string;
}

export interface MakeInvoiceResponse {
  data: {
    paymentRequest: string;
    rHash: string;
  };
}

export interface GetInfoResponse {
  data: WebLNNode;
}

export interface GetBalanceResponse {
  data: {
    balance: number;
  };
}

export type SendPaymentResponse =
  | {
      data: {
        preimage: string;
        paymentHash: string;
        route: Route;
      };
    }
  | { error: string };

export interface SendPaymentArgs {
  paymentRequest: string;
}

export interface CheckPaymentArgs {
  paymentHash: string;
}

export interface CheckPaymentResponse {
  data: {
    paid: boolean;
    preimage?: string;
  };
}

export interface SignMessageArgs {
  message: string;
  key_loc: {
    key_family: number;
    key_index: number;
  };
}

export interface SignMessageResponse {
  data: {
    signature: string;
  };
}

export interface VerifyMessageArgs {
  message: string;
  signature: string;
}

export interface VerifyMessageResponse {
  data: {
    valid: boolean;
  };
}

export default interface Connector {
  init(): Promise<void>;
  unload(): Promise<void>;
  getInfo(): Promise<GetInfoResponse>;
  getBalance(): Promise<GetBalanceResponse>;
  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse>;
  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse>;
  checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse>;
  signMessage(args: SignMessageArgs): Promise<SignMessageResponse>;
  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse>;
}
