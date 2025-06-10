import browser from "webextension-polyfill";
import type { AccountInfo, Invoice } from "~/types";

export const getAccountsCache = async () => {
  let accountsCache: { [id: string]: AccountInfo } = {};
  const result = await browser.storage.local.get(["accounts"]);
  if (result.accounts) {
    accountsCache = JSON.parse(result.accounts);
  }
  return accountsCache;
};

export const storeAccounts = (accounts: { [id: string]: AccountInfo }) => {
  browser.storage.local.set({
    accounts: JSON.stringify(accounts),
  });
};

export const removeAccountFromCache = async (id: string) => {
  const accountsCache = await getAccountsCache();
  if (accountsCache[id]) {
    delete accountsCache[id];
    storeAccounts(accountsCache);
  }
  return accountsCache;
};

export const getTransactionsCache = async (accountId: string) => {
  const cacheKey = `transactions_${accountId}`;
  const result = await browser.storage.local.get([cacheKey]);
  if (result[cacheKey]) {
    const cached = JSON.parse(result[cacheKey]);
    // Check if cache is less than 5 minutes old
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.transactions;
    }
  }
  return null;
};

export const storeTransactions = (accountId: string, transactions: Invoice[]) => {
  const cacheKey = `transactions_${accountId}`;
  browser.storage.local.set({
    [cacheKey]: JSON.stringify({
      transactions,
      timestamp: Date.now(),
    }),
  });
};

export const removeTransactionsFromCache = async (accountId: string) => {
  const cacheKey = `transactions_${accountId}`;
  await browser.storage.local.remove([cacheKey]);
};
