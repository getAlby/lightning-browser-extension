import axios from "axios";
import { bech32 } from "bech32";

export const normalizeAccountsData = (data: { [key: string]: any } = {}) => {
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
