import { PaymentRequestObject } from "bolt11";
import { SendPaymentResponse } from "~/extension/background-script/connectors/connector.interface";

import connectors from "./extension/background-script/connectors";

export type ConnectorType = keyof typeof connectors;

export interface Account {
  id: string;
  connector: ConnectorType;
  config: string | Record<string, unknown>;
  name: string;
}

export interface Accounts {
  [id: string]: Account;
}

export interface AccountInfo {
  alias: string;
  balance: number;
  id: string;
  name: string;
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

// deprecated message type,please stop using this
export interface Message {
  application?: string;
  args: Record<string, unknown>;
  origin: OriginData | OriginDataInternal;
  prompt?: boolean;
  action?: string;
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

export interface MessageAccountInfo extends Omit<MessageDefault, "args"> {
  action: "accountInfo";
}

export interface MessageAccountAll extends Omit<MessageDefault, "args"> {
  action: "getAccounts";
}

export interface MessageAccountLock extends Omit<MessageDefault, "args"> {
  action: "lock";
}

interface LNURLChannelServiceResponse {
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

export type Payment = {
  preimage: string;
  paymentHash: string;
  route: {
    total_amt: number;
    total_fees: number;
  };
};

export interface Allowance {
  enabled: boolean;
  host: string;
  id: string;
  imageURL: string;
  lastPaymendAt: number;
  name: string;
  payments: Transaction[];
  paymentsCount: number;
  paymentsAmount: number;
  percentage: string;
  remainingBudget: number;
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
  currency: SupportedCurrencies;
  exchange: SupportedExchanges;
}

export type SupportedExchanges = "Coindesk" | "Yad.io";

// Supported currencies by Coindesk and Yad.io
// https://github.com/AryanJ-NYC/bitcoin-conversion/blob/master/src/index.ts#L143
export type SupportedCurrencies =
  | "AED" // United Arab Emirates Dirham"
  | "AFN" // Afghan Afghani"
  | "ALL" // Albanian Lek"
  | "AMD" // Armenian Dram"
  | "ANG" // Netherlands Antillean Guilder"
  | "AOA" // Angolan Kwanza"
  | "ARS" // Argentine Peso"
  | "AUD" // Australian Dollar"
  | "AWG" // Aruban Florin"
  | "AZN" // Azerbaijani Manat"
  | "BAM" // Bosnia-Herzegovina Convertible Mark"
  | "BBD" // Barbadian Dollar"
  | "BDT" // Bangladeshi Taka"
  | "BGN" // Bulgarian Lev"
  | "BHD" // Bahraini Dinar"
  | "BIF" // Burundian Franc"
  | "BMD" // Bermudan Dollar"
  | "BND" // Brunei Dollar"
  | "BOB" // Bolivian Boliviano"
  | "BRL" // Brazilian Real"
  | "BSD" // Bahamian Dollar"
  | "BTC" // Bitcoin"
  | "BTN" // Bhutanese Ngultrum"
  | "BWP" // Botswanan Pula"
  | "BYR" // Belarusian Ruble"
  | "BZD" // Belize Dollar"
  | "CAD" // Canadian Dollar"
  | "CDF" // Congolese Franc"
  | "CHF" // Swiss Franc"
  | "CLF" // Chilean Unit of Account (UF)"
  | "CLP" // Chilean Peso"
  | "CNY" // Chinese Yuan"
  | "COP" // Colombian Peso"
  | "CRC" // Costa Rican Col\u00f3n"
  | "CUP" // Cuban Peso"
  | "CVE" // Cape Verdean Escudo"
  | "CZK" // Czech Republic Koruna"
  | "DJF" // Djiboutian Franc"
  | "DKK" // Danish Krone"
  | "DOP" // Dominican Peso"
  | "DZD" // Algerian Dinar"
  | "EEK" // Estonian Kroon"
  | "EGP" // Egyptian Pound"
  | "ERN" // Eritrean Nnakfa"
  | "ETB" // Ethiopian Birr"
  | "EUR" // Euro"
  | "FJD" // Fijian Dollar"
  | "FKP" // Falkland Islands Pound"
  | "GBP" // British Pound Sterling"
  | "GEL" // Georgian Lari"
  | "GHS" // Ghanaian Cedi"
  | "GIP" // Gibraltar Pound"
  | "GMD" // Gambian Dalasi"
  | "GNF" // Guinean Franc"
  | "GTQ" // Guatemalan Quetzal"
  | "GYD" // Guyanaese Dollar"
  | "HKD" // Hong Kong Dollar"
  | "HNL" // Honduran Lempira"
  | "HRK" // Croatian Kuna"
  | "HTG" // Haitian Gourde"
  | "HUF" // Hungarian Forint"
  | "IDR" // Indonesian Rupiah"
  | "ILS" // Israeli New Sheqel"
  | "INR" // Indian Rupee"
  | "IQD" // Iraqi Dinar"
  | "IRR" // Iranian Rial"
  | "ISK" // Icelandic Kr\u00f3na"
  | "JEP" // Jersey Pound"
  | "JMD" // Jamaican Dollar"
  | "JOD" // Jordanian Dinar"
  | "JPY" // Japanese Yen"
  | "KES" // Kenyan Shilling"
  | "KGS" // Kyrgystani Som"
  | "KHR" // Cambodian Riel"
  | "KMF" // Comorian Franc"
  | "KPW" // North Korean Won"
  | "KRW" // South Korean Won"
  | "KWD" // Kuwaiti Dinar"
  | "KYD" // Cayman Islands Dollar"
  | "KZT" // Kazakhstani Tenge"
  | "LAK" // Laotian Kip"
  | "LBP" // Lebanese Pound"
  | "LKR" // Sri Lankan Rupee"
  | "LRD" // Liberian Dollar"
  | "LSL" // Lesotho Loti"
  | "LTL" // Lithuanian Litas"
  | "LVL" // Latvian Lats"
  | "LYD" // Libyan Dinar"
  | "MAD" // Moroccan Dirham"
  | "MDL" // Moldovan Leu"
  | "MGA" // Malagasy Ariary"
  | "MKD" // Macedonian Denar"
  | "MMK" // Myanma Kyat"
  | "MNT" // Mongolian Tugrik"
  | "MOP" // Macanese Pataca"
  | "MRO" // Mauritanian Ouguiya"
  | "MTL" // Maltese Lira"
  | "MUR" // Mauritian Rupee"
  | "MVR" // Maldivian Rufiyaa"
  | "MWK" // Malawian Kwacha"
  | "MXN" // Mexican Peso"
  | "MYR" // Malaysian Ringgit"
  | "MZN" // Mozambican Metical"
  | "NAD" // Namibian Dollar"
  | "NGN" // Nigerian Naira"
  | "NIO" // Nicaraguan C\u00f3rdoba"
  | "NOK" // Norwegian Krone"
  | "NPR" // Nepalese Rupee"
  | "NZD" // New Zealand Dollar"
  | "OMR" // Omani Rial"
  | "PAB" // Panamanian Balboa"
  | "PEN" // Peruvian Nuevo Sol"
  | "PGK" // Papua New Guinean Kina"
  | "PHP" // Philippine Peso"
  | "PKR" // Pakistani Rupee"
  | "PLN" // Polish Zloty"
  | "PYG" // Paraguayan Guarani"
  | "QAR" // Qatari Rial"
  | "RON" // Romanian Leu"
  | "RSD" // Serbian Dinar"
  | "RUB" // Russian Ruble"
  | "RWF" // Rwandan Franc"
  | "SAR" // Saudi Riyal"
  | "SBD" // Solomon Islands Dollar"
  | "SCR" // Seychellois Rupee"
  | "SDG" // Sudanese Pound"
  | "SEK" // Swedish Krona"
  | "SGD" // Singapore Dollar"
  | "SHP" // Saint Helena Pound"
  | "SLL" // Sierra Leonean Leone"
  | "SOS" // Somali Shilling"
  | "SRD" // Surinamese Dollar"
  | "STD" // S\u00e3o Tom\u00e9 and Pr\u00edncipe Dobra"
  | "SVC" // Salvadoran Col\u00f3n"
  | "SYP" // Syrian Pound"
  | "SZL" // Swazi Lilangeni"
  | "THB" // Thai Baht"
  | "TJS" // Tajikistani Somoni"
  | "TMT" // Turkmenistani Manat"
  | "TND" // Tunisian Dinar"
  | "TOP" // Tongan Pa?anga"
  | "TRY" // Turkish Lira"
  | "TTD" // Trinidad and Tobago Dollar"
  | "TWD" // New Taiwan Dollar"
  | "TZS" // Tanzanian Shilling"
  | "UAH" // Ukrainian Hryvnia"
  | "UGX" // Ugandan Shilling"
  | "USD" // United States Dollar"
  | "UYU" // Uruguayan Peso"
  | "UZS" // Uzbekistan Som"
  | "VEF" // Venezuelan Bol\u00edvar Fuerte"
  | "VND" // Vietnamese Dong"
  | "VUV" // Vanuatu Vatu"
  | "WST" // Samoan Tala"
  | "XAF" // CFA Franc BEAC"
  | "XAG" // Silver (troy ounce)"
  | "XAU" // Gold (troy ounce)"
  | "XBT" // Bitcoin"
  | "XCD" // East Caribbean Dollar"
  | "XDR" // Special Drawing Rights"
  | "XOF" // CFA Franc BCEAO"
  | "XPF" // CFP Franc"
  | "YER" // Yemeni Rial"
  | "ZAR" // South African Rand"
  | "ZMK" // Zambian Kwacha (pre-2013)"
  | "ZMW" // Zambian Kwacha"
  | "ZWL"; // Zimbabwean Dollar"
