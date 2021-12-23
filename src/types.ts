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

export interface Battery extends OriginData {
  method: string;
  recipient: string;
  name: string;
  icon: string;
}

export interface Message {
  args: Record<string, unknown>;
  origin: OriginData;
}

export interface LNURLDetails {
  tag: "channelRequest" | "login" | "payRequest" | "withdrawRequest";
  k1: string;
  action: string;
  domain: string;
  url: URL;
}

export interface LNURLPaymentInfo {
  pr: string;
  successAction?: {
    tag: string;
    description?: string;
    message?: string;
    url?: string;
  };
}

export interface IBadge {
  label: string;
  color: string;
  textColor: string;
}

export type Transaction = {
  type: string;
  id: string;
  title: string | React.ReactNode;
  subTitle: string;
  date: string;
  amount: string;
  currency: string;
  value: string;
  preimage: string;
  badges: IBadge[];
  totalAmount: string;
  description: string;
  location: string;
};

export interface Allowance {
  badge: IBadge;
  enabled: boolean;
  remainingBudget: number;
}
