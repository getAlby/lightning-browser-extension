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
  amount: string | number;
  memo: string;
}

type ErrorResponse = {
  error: string;
};

export type MakeInvoiceResponse =
  | {
      data: {
        paymentRequest: string;
        rHash: string;
      };
    }
  | ErrorResponse;

export type GetInfoResponse =
  | {
      data: WebLNNode;
    }
  | ErrorResponse;

export type GetBalanceResponse =
  | {
      data: {
        balance: number;
      };
    }
  | ErrorResponse;

export type SendPaymentResponse =
  | {
      data: {
        preimage: string;
        paymentHash: string;
        route: Route;
      };
    }
  | ErrorResponse;

export interface SendPaymentArgs {
  paymentRequest: string;
}

export interface CheckPaymentArgs {
  paymentHash: string;
}

export type CheckPaymentResponse =
  | {
      data: {
        paid: boolean;
        preimage?: string;
      };
    }
  | ErrorResponse;

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
