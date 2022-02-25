interface PaymentRequestDetails {
  chain_address?: string;
  cltv_delta: number;
  created_at: string;
  description?: string;
  description_hash?: string;
  destination: string;
  expires_at: string;
  features: {
    bit: number;
    is_required: boolean;
    type: string;
  }[];
  id: string;
  is_expired: boolean;
  mtokens: string;
  network: string;
  payment?: string;
  routes?: {
    base_fee_mtokens?: string;
    channel?: string;
    cltv_delta?: number;
    fee_rate?: number;
    public_key: string;
  };
  safe_tokens: number;
  tokens: number;
}

declare module "invoices" {
  export function parsePaymentRequest(obj: {
    request: string;
  }): PaymentRequestDetails;
}

// can be removed with TS 4.6
// https://github.com/denoland/deno/issues/12754#issuecomment-1016111068
interface Crypto {
  randomUUID: () => string;
}
