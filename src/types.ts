import { PaymentRequestObject } from "bolt11";
import { CURRENCIES } from "~/common/constants";
import connectors from "~/extension/background-script/connectors";
import {
  SendPaymentResponse,
  WebLNNode,
} from "~/extension/background-script/connectors/connector.interface";

export type ConnectorType = keyof typeof connectors;

export interface Account {
  id: string;
  connector: ConnectorType;
  config: string;
  name: string;
}

export interface Accounts {
  [id: string]: Account;
}

export interface NodeInfo {
  node: WebLNNode;
}
export interface AccountInfo {
  alias: string;
  balance: number;
  fiatBalance?: string;
  id: string;
  name: string;
  satsBalance?: string;
}

export interface MetaData {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  keywords?: string[];
  language?: string;
  type?: string;
  url?: string;
  provider?: string;
  [x: string]: string | string[] | undefined;
}

export interface OriginData {
  location: string;
  domain: string;
  host: string;
  pathname: string;
  name: string;
  description: string;
  icon: string;
  metaData: MetaData;
  external: boolean;
}

export interface PaymentNotificationData {
  paymentRequestDetails?: PaymentRequestObject | undefined;
  response: SendPaymentResponse | { error: string };
  details: {
    destination?: string | undefined;
    description?: string | undefined;
  };
}

export interface OriginDataInternal {
  internal: boolean;
}

export interface Battery extends OriginData {
  method: string;
  recipient: string;
  name: string;
  icon: string;
}

/**
 * @deprecated Use MessageDefault instead
 */
export interface Message {
  action?: string;
  application?: string;
  args: Record<string, unknown>;
  origin: OriginData | OriginDataInternal;
  prompt?: boolean;
}

// new message  type, please use this
export interface MessageDefault {
  origin: OriginData | OriginDataInternal;
  application?: string;
  prompt?: boolean;
}

export interface MessageAccountRemove extends MessageDefault {
  args?: { id: Account["id"] };
  action: "removeAccount";
}

export interface MessageAccountAdd extends MessageDefault {
  args: Omit<Account, "id">;
  action: "addAccount";
}
export interface MessageAccountEdit extends MessageDefault {
  args: {
    id: Account["id"];
    name: Account["name"];
  };
  action: "editAccount";
}
export interface MessageAccountDecryptedDetails extends MessageDefault {
  args: {
    id: Account["id"];
    name: Account["name"];
  };
  action: "accountDecryptedDetails";
}

export interface MessageAccountInfo extends MessageDefault {
  action: "accountInfo";
}

export interface MessageAccountAll extends MessageDefault {
  action: "getAccounts";
}

export interface MessageBlocklistAdd extends MessageDefault {
  args: {
    host: string;
    name: string;
    imageURL: string;
  };
  action: "addBlocklist";
}

export interface MessageBlocklistDelete extends MessageDefault {
  args: {
    host: string;
  };
  action: "deleteBlocklist";
}

export interface MessageBlocklistGet extends MessageDefault {
  args: {
    host: string;
  };
  action: "getBlocklist";
}

export interface MessageSetIcon extends MessageDefault {
  action: "setIcon";
  args: {
    icon: string;
  };
}

export interface MessageAccountLock extends MessageDefault {
  action: "lock";
}

export interface MessageAccountUnlock extends MessageDefault {
  args: { password: string | number };
  action: "unlock";
}

export interface MessageAccountSelect extends MessageDefault {
  args: { id: Account["id"] };
  action: "selectAccount";
}
export interface MessageAllowanceList extends MessageDefault {
  action: "listAllowances";
}

export interface MessageAllowanceDelete extends MessageDefault {
  args: {
    id: Allowance["id"];
  };
  action: "deleteAllowance";
}

export interface MessageAllowanceUpdate extends MessageDefault {
  args: {
    enabled: Allowance["enabled"];
    id: Allowance["id"];
    totalBudget: Allowance["totalBudget"];
  };
  action: "updateAllowance";
}

export interface LNURLChannelServiceResponse {
  uri: string; // Remote node address of form node_key@ip_address:port_number
  callback: string; // a second-level URL which would initiate an OpenChannel message from target LN node
  k1: string; // random or non-random string to identify the user's LN WALLET when using the callback URL
  tag: "channelRequest"; // type of LNURL
  domain: string;
}

export interface LNURLPayServiceResponse {
  callback: string; // The URL from LN SERVICE which will accept the pay request parameters
  maxSendable: number; // Max amount LN SERVICE is willing to receive
  minSendable: number; // Min amount LN SERVICE is willing to receive, can not be less than 1 or more than `maxSendable`
  domain: string;
  metadata: string; // Metadata json which must be presented as raw string here, this is required to pass signature verification at a later step
  tag: "payRequest"; // Type of LNURL
  payerData?: {
    name: { mandatory: boolean };
    pubkey: { mandatory: boolean };
    identifier: { mandatory: boolean };
    email: { mandatory: boolean };
    auth: { mandatory: boolean; k1: string };
  };
  commentAllowed?: number;
}

export interface LNURLAuthServiceResponse {
  tag: "login"; // Type of LNURL
  k1: string; // (hex encoded 32 bytes of challenge) which is going to be signed by user's linkingPrivKey.
  action?: string; // optional action enum which can be one of four strings: register | login | link | auth.
  domain: string;
}

export interface LNURLWithdrawServiceResponse {
  tag: "withdrawRequest"; // type of LNURL
  callback: string; // The URL which LN SERVICE would accept a withdrawal Lightning invoice as query parameter
  k1: string; // Random or non-random string to identify the user's LN WALLET when using the callback URL
  defaultDescription: string; // A default withdrawal invoice description
  minWithdrawable: number; // Min amount (in millisatoshis) the user can withdraw from LN SERVICE, or 0
  maxWithdrawable: number; // Max amount (in millisatoshis) the user can withdraw from LN SERVICE, or equal to minWithdrawable if the user has no choice over the amounts
  domain: string;
}

export type LNURLDetails = (
  | LNURLChannelServiceResponse
  | LNURLPayServiceResponse
  | LNURLAuthServiceResponse
  | LNURLWithdrawServiceResponse
) & { url: URL };

export interface LNURLPaymentSuccessAction {
  tag: string;
  description?: string;
  message?: string;
  url?: string;
}

export interface LNURLPaymentInfo {
  pr: string;
  successAction?: LNURLPaymentSuccessAction;
}

export interface LNURLPaymentInfoError {
  status: string;
  reason: string;
}

export interface RequestInvoiceArgs {
  amount?: string | number;
  defaultAmount?: string | number;
  minimumAmount?: string | number;
  maximumAmount?: string | number;
  defaultMemo?: string;
  memo?: string;
}

export interface IBadge {
  label: string;
  color: string;
  textColor: string;
}

export type Transaction = {
  type?: string;
  id: string;
  createdAt: string;
  name: string;
  host: string;
  title: string | React.ReactNode;
  subTitle: string | React.ReactNode;
  date: string;
  amount: string;
  currency: string;
  value: string;
  preimage: string;
  badges: IBadge[];
  totalAmount: string;
  totalFees: string;
  description: string;
  location: string;
  totalAmountFiat: string;
};

export interface Payment {
  allowanceId: string;
  createdAt: string;
  description: string;
  destination: string;
  host: string;
  id?: number;
  location: string;
  name: string;
  paymentHash: string;
  paymentRequest: string;
  preimage: string;
  totalAmount: number | string;
  totalFees: number | string;
}

export interface PaymentResponse
  extends Pick<Payment, "destination" | "preimage" | "paymentHash"> {
  route: {
    total_time_lock: number;
    total_fees: string;
    total_amt: string;
    hops: {
      chan_id: string;
      chan_capacity: string;
      amt_to_forward: string;
      fee: string;
      expiry: number;
      amt_to_forward_msat: string;
      fee_msat: string;
      pub_key: string;
      tlv_payload: true;
      mpp_record: {
        payment_addr: string;
        total_amt_msat: string;
      };
      amp_record: null;
      custom_records: unknown;
    };
    total_fees_msat: string;
    total_amt_msat: string;
  };
}

export interface Allowance {
  createdAt: string;
  enabled: boolean;
  host: string;
  id: number;
  imageURL: string;
  lastPaymentAt: string;
  lnurlAuth: string;
  name: string;
  payments: Transaction[];
  paymentsAmount: number;
  paymentsCount: number;
  percentage: string;
  remainingBudget: number;
  tag: string;
  totalBudget: number;
  usedBudget: number;
}
export interface SettingsStorage {
  websiteEnhancements: boolean;
  legacyLnurlAuth: boolean;
  userName: string;
  userEmail: string;
  locale: string;
  theme: string;
  currency: CURRENCIES;
  exchange: SupportedExchanges;
  debug: boolean;
}

export interface Blocklist {
  id?: number;
  host: string;
  name: string;
  imageURL: string;
  isBlocked: boolean;
}

export interface Badge {
  label: string;
  color: string;
  textColor: string;
}

export interface Publisher
  extends Pick<
    Allowance,
    | "host"
    | "imageURL"
    | "name"
    | "payments"
    | "paymentsAmount"
    | "paymentsCount"
    | "percentage"
    | "totalBudget"
    | "usedBudget"
  > {
  id: number;
  title?: string;
  badge?: {
    label: string;
    color: string;
    textColor: string;
  };
}

export type SupportedExchanges = "alby" | "coindesk" | "yadio";
