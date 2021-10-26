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
  args: { lnurlEncoded?: string; paymentRequest?: string };
  origin: OriginData;
}
