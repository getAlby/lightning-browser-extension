/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */

const numSatsInBtc = 100_000_000;

const bitcoinToFiat = async (amountInBtc: number | string, rate: number) => {
  return Number(amountInBtc) * Number(rate);
};

const satoshisToBitcoin = (amountInSatoshis: number | string) => {
  return Number(amountInSatoshis) / numSatsInBtc;
};

export const satoshisToFiat = async ({
  amountInSats,
  rate,
}: {
  amountInSats: number | string;
  rate: number;
}) => {
  const btc = satoshisToBitcoin(amountInSats);
  const fiat = await bitcoinToFiat(btc, rate);
  return fiat;
};

export const getSatValue = (balance: number) => `${balance} sats`;
