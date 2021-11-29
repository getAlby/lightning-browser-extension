interface WebLNNode {
  alias: string;
  pubkey: string;
  color?: string;
}

export interface GetInfoResponse {
  data: WebLNNode;
}

interface SendPaymentResponse {
  preimage: string;
}

export interface SendPaymentArgs {
  paymentRequest: string;
}

export default interface Connector {
  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse>;
  getInfo(): Promise<GetInfoResponse>;
}
