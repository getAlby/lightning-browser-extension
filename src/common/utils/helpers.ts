import axios from "axios";
import { bech32 } from "bech32";

export const normalizeAccountsData = (
  data: Record<string, { config: unknown }> = {}
) => {
  const accountDataKeys = Object.keys(data);

  return accountDataKeys.map((item) => ({
    title: item,
    description: data[item].config,
  }));
};

export const getFiatFromSatoshi = async (currency: string, satoshi: number) => {
  const res = await axios.get<{
    [key: string]: {
      sell: number;
    };
  }>("https://blockchain.info/ticker");
  const exchangeRate: number = res?.data[currency ?? "USD"]?.sell;
  const amount = Math.round((satoshi / 100000000) * exchangeRate);
  return amount;
};

export const calcFiatFromSatoshi = (rate: string, s: string) => {
  //making sure we have numbers not strings
  const satoshi = parseFloat(s);
  const exchangeRate = parseFloat(rate);
  // making even more sure we are returning only numbers
  return +((satoshi / 100000000) * exchangeRate).toFixed(2);
};

export const sortByFieldAscending = (data: [], field: string) => {
  return data.sort((a, b) => {
    const da = a[field],
      db = b[field];
    return db - da;
  });
};

export const sortByFieldDescending = (data: [], field: string) => {
  return data.sort((a, b) => {
    const da = a[field],
      db = b[field];
    return da - db;
  });
};

export function bech32Decode(str: string) {
  const { words: dataPart } = bech32.decode(str, 2000);
  const requestByteArray = bech32.fromWords(dataPart);
  return Buffer.from(requestByteArray).toString();
}

export async function poll<T>({
  fn,
  validate,
  interval,
  maxAttempts,
}: {
  fn: () => Promise<T>;
  validate: (value: T) => boolean;
  interval: number;
  maxAttempts: number;
}) {
  let attempts = 0;

  const executePoll = async (
    resolve: (value: unknown) => void,
    reject: (reason?: Error) => void
  ) => {
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error("Exceeded max attempts"));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
}
