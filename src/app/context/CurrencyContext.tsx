import { useState, useEffect, createContext, useContext } from "react";
import currencyJs from "currency.js";
import { Decimal } from "decimal.js-light";
import axios from "axios";

import { useAuth } from "./AuthContext";
import api from "~/common/lib/api";
import currencies from "../utils/supportedCurrencies";
import { SupportedCurrencies, SupportedExchanges } from "~/types";

interface CurrencyContextType {
  balances: {
    satsBalance: string;
    fiatBalance: string;
  };
  setCurrencyValue: (currency: SupportedCurrencies) => void;
  currencies: string[];
  getFiatValue: (amount: number | string) => Promise<string>;
  fiatToSatoshis: (amount: number | string) => Promise<number>;
}

const CurrencyContext = createContext({} as CurrencyContextType);

const numSatsInBtc = 100_000_000;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [balances, setBalances] = useState<{
    satsBalance: string;
    fiatBalance: string;
  }>({ satsBalance: "", fiatBalance: "" });
  const [currency, setCurrency] = useState<SupportedCurrencies>(
    "USD" as SupportedCurrencies
  );
  const [exchange, setExchange] = useState<SupportedExchanges>("Coindesk");
  const auth = useAuth();

  const bitcoinToFiat = async (
    amountInBtc: number | string,
    convertTo: SupportedCurrencies
  ) => {
    const btc = new Decimal(amountInBtc);
    const rate = await getFiatBtcRate(convertTo);
    return btc.mul(rate).toNumber();
  };

  const getFiatBtcRate = async (
    currency: SupportedCurrencies
  ): Promise<string> => {
    let response;

    if (exchange === "Yad.io") {
      response = await axios.get(
        `https://api.yadio.io/exrates/${currency.toLowerCase()}`
      );
      const data = await response?.data;
      return currencyJs(data.BTC, {
        separator: "",
        symbol: "",
      }).format();
    }

    response = await axios.get(
      `https://api.coindesk.com/v1/bpi/currentprice/${currency.toLowerCase()}.json`
    );
    const data = await response?.data;
    return currencyJs(data.bpi[currency].rate, {
      separator: "",
      symbol: "",
    }).format();
  };

  const satoshisToBitcoin = (amountInSatoshis: number | string) => {
    const sats = new Decimal(amountInSatoshis);
    return sats.div(numSatsInBtc).toNumber();
  };

  const satoshisToFiat = async (
    amountInSats: number | string,
    convertTo: SupportedCurrencies
  ) => {
    const btc = satoshisToBitcoin(amountInSats);
    const fiat = await bitcoinToFiat(btc, convertTo);
    return fiat;
  };

  const getBalances = async (balance: number) => {
    const fiatValue = await satoshisToFiat(balance, currency);
    const localeFiatValue = fiatValue.toLocaleString("en", {
      style: "currency",
      currency: currency,
    });
    return {
      satsBalance: `${balance} sats`,
      fiatBalance: localeFiatValue,
    };
  };

  const getFiatValue = async (amount: number | string) => {
    const fiatValue = await satoshisToFiat(amount, currency);
    const localeFiatValue = fiatValue.toLocaleString("en", {
      style: "currency",
      currency: currency,
    });
    return localeFiatValue;
  };

  const bitcoinToSatoshis = (amountInBtc: number | string) => {
    const btc = new Decimal(amountInBtc);
    return btc.mul(numSatsInBtc).toNumber();
  };

  const fiatToBitcoin = async (
    amountInCurrency: number | string,
    convertFrom: SupportedCurrencies
  ) => {
    const amt = new Decimal(amountInCurrency);
    const rate = await getFiatBtcRate(convertFrom);
    const evaluatedRate = new Decimal(rate);
    return amt.div(evaluatedRate).toNumber();
  };

  const fiatToSatoshis = async (amountInCurrency: number | string) => {
    const amountInBtc = await fiatToBitcoin(amountInCurrency, currency);
    return bitcoinToSatoshis(amountInBtc);
  };

  const setCurrencyValue = (currency: SupportedCurrencies) =>
    setCurrency(currency);

  useEffect(() => {
    api.getSettings().then((settings) => {
      setCurrency(settings.currency);
      setExchange(settings.exchange);
    });
  }, []);

  useEffect(() => {
    if (typeof auth.account?.balance === "number") {
      getBalances(auth.account?.balance).then((balances) =>
        setBalances(balances)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.account?.balance, currency]);

  const value: CurrencyContextType = {
    balances,
    setCurrencyValue,
    currencies,
    getFiatValue,
    fiatToSatoshis,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
