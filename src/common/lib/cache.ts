import browser from "webextension-polyfill";

import type { AccountInfo } from "../../types";

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
