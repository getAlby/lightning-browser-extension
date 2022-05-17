// https://www.npmjs.com/package/currency.js 0 dependencies, 135,987k weekly downloads
import axios from "axios";
import currencyJs from "currency.js";
// https://github.com/MikeMcl/decimal.js-light 0 dependencies, 826,917 weekly downloads
import { Decimal } from "decimal.js-light";

const numSatsInBtc = 100_000_000;

export const bitcoinToFiat = async (
  amountInBtc: number | string,
  convertTo: SupportedCurrencies
) => {
  const btc = new Decimal(amountInBtc);
  const rate = await getFiatBtcRate(convertTo);
  return btc.mul(rate).toNumber();
};

export const bitcoinToSatoshis = (amountInBtc: number | string) => {
  const btc = new Decimal(amountInBtc);
  return btc.mul(numSatsInBtc).toNumber();
};

export const satoshisToBitcoin = (amountInSatoshis: number | string) => {
  const sats = new Decimal(amountInSatoshis);
  return sats.div(numSatsInBtc).toNumber();
};

export const satoshisToFiat = async (
  amountInSats: number | string,
  convertTo: SupportedCurrencies
) => {
  const btc = satoshisToBitcoin(amountInSats);
  const fiat = await bitcoinToFiat(btc, convertTo);
  return fiat;
};

export const fiatToBitcoin = async (
  amountInCurrency: number | string,
  convertFrom: SupportedCurrencies
) => {
  const amt = new Decimal(amountInCurrency);
  const rate = await getFiatBtcRate(convertFrom);
  const evaluatedRate = new Decimal(rate);
  return amt.div(evaluatedRate).toNumber();
};

export const fiatToSatoshis = async (
  amountInCurrency: number | string,
  convertFrom: SupportedCurrencies
) => {
  const amountInBtc = await fiatToBitcoin(amountInCurrency, convertFrom);
  return bitcoinToSatoshis(amountInBtc);
};

export const getFiatBtcRate = async (
  currency: SupportedCurrencies
): Promise<string> => {
  const response = await axios.get(
    `https://api.coindesk.com/v1/bpi/currentprice/${currency.toLowerCase()}.json`
  );
  const data = await response.data;
  return currencyJs(data.bpi[currency].rate, {
    separator: "",
    symbol: "",
  }).format();
};

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
