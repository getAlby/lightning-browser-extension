interface WebLNNode {
  alias: string;
  pubkey?: string;
  color?: string;
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
        route: { total_amt: number; total_fees: number };
      };
    }
  | { error: string };

export interface SendPaymentArgs {
  paymentRequest: string;
}

export interface SignMessageArgs {
  message: string;
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
  getInfo(): Promise<GetInfoResponse>;
  getBalance(): Promise<GetBalanceResponse>;
  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse>;
  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse>;
  signMessage(args: SignMessageArgs): Promise<SignMessageResponse>;
  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse>;
}
