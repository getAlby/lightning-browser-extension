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
  tokens: string;
}

declare module "invoices" {
  export function parsePaymentRequest(obj: {
    request: string;
  }): PaymentRequestDetails;
}
