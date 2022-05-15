import { useState, useEffect, createContext, useContext } from "react";
import { satoshisToFiat, SupportedCurrencies } from "bitcoin-conversion";
import { useAuth } from "./AuthContext";
import api from "~/common/lib/api";

interface CurrencyContextType {
  balances: {
    satsBalance: string;
    fiatBalance: string;
  };
  setCurrencyValue: (currency: SupportedCurrencies) => void;
  currencies: string[];
}

const CurrencyContext = createContext({} as CurrencyContextType);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currencies = [
    "AED",
    "AFN",
    "ALL",
    "AMD",
    "ANG",
    "AOA",
    "ARS",
    "AUD",
    "AWG",
    "AZN",
    "BAM",
    "BBD",
    "BDT",
    "BGN",
    "BHD",
    "BIF",
    "BMD",
    "BND",
    "BOB",
    "BRL",
    "BSD",
    "BTC",
    "BTN",
    "BWP",
    "BYR",
    "BZD",
    "CAD",
    "CDF",
    "CHF",
    "CLF",
    "CLP",
    "CNY",
    "COP",
    "CRC",
    "CUP",
    "CVE",
    "CZK",
    "DJF",
    "DKK",
    "DOP",
    "DZD",
    "EEK",
    "EGP",
    "ERN",
    "ETB",
    "EUR",
    "FJD",
    "FKP",
    "GBP",
    "GEL",
    "GHS",
    "GIP",
    "GMD",
    "GNF",
    "GTQ",
    "GYD",
    "HKD",
    "HNL",
    "HRK",
    "HTG",
    "HUF",
    "IDR",
    "ILS",
    "INR",
    "IQD",
    "IRR",
    "ISK",
    "JEP",
    "JMD",
    "JOD",
    "JPY",
    "KES",
    "KGS",
    "KHR",
    "KMF",
    "KPW",
    "KRW",
    "KWD",
    "KYD",
    "KZT",
    "LAK",
    "LBP",
    "LKR",
    "LRD",
    "LSL",
    "LTL",
    "LVL",
    "LYD",
    "MAD",
    "MDL",
    "MGA",
    "MKD",
    "MMK",
    "MNT",
    "MOP",
    "MRO",
    "MTL",
    "MUR",
    "MVR",
    "MWK",
    "MXN",
    "MYR",
    "MZN",
    "NAD",
    "NGN",
    "NIO",
    "NOK",
    "NPR",
    "NZD",
    "OMR",
    "PAB",
    "PEN",
    "PGK",
    "PHP",
    "PKR",
    "PLN",
    "PYG",
    "QAR",
    "RON",
    "RSD",
    "RUB",
    "RWF",
    "SAR",
    "SBD",
    "SCR",
    "SDG",
    "SEK",
    "SGD",
    "SHP",
    "SLL",
    "SOS",
    "SRD",
    "STD",
    "SVC",
    "SYP",
    "SZL",
    "THB",
    "TJS",
    "TMT",
    "TND",
    "TOP",
    "TRY",
    "TTD",
    "TWD",
    "TZS",
    "UAH",
    "UGX",
    "USD",
    "UYU",
    "UZS",
    "VEF",
    "VND",
    "VUV",
    "WST",
    "XAF",
    "XAG",
    "XAU",
    "XBT",
    "XCD",
    "XDR",
    "XOF",
    "XPF",
    "YER",
    "ZAR",
    "ZMK",
    "ZMW",
    "ZWL",
  ];
  const [balances, setBalances] = useState<{
    satsBalance: string;
    fiatBalance: string;
  }>({ satsBalance: "", fiatBalance: "" });
  const [currency, setCurrency] = useState<SupportedCurrencies>("USD");
  const auth = useAuth();

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

  const setCurrencyValue = (currency: SupportedCurrencies) =>
    setCurrency(currency);

  useEffect(() => {
    api.getSettings().then((settings) => setCurrency(settings.currency));
  }, []);

  useEffect(() => {
    if (typeof auth.account?.balance === "number") {
      getBalances(auth.account?.balance).then((balances) =>
        setBalances(balances)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.account?.balance, currency]);

  const value = {
    balances,
    setCurrencyValue,
    currencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurreny() {
  return useContext(CurrencyContext);
}
