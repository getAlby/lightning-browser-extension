import { v4 as uuidv4 } from "uuid";
import dataStore from "../data-store";

const ACCOUNTS_DATA_STORE_KEY = "accounts";

async function getAll() {
  return (await dataStore().get(ACCOUNTS_DATA_STORE_KEY)) || [];
}

async function getById(accountId) {
  if (!accountId) {
    return;
  }
  const accounts = (await dataStore().get(ACCOUNTS_DATA_STORE_KEY)) || [];
  return accounts.find((acc) => acc.id === accountId);
}

async function add(account) {
  if (!account) {
    return;
  }
  const accounts = (await getAll()) || [];
  account.isCurrent = accounts.length === 0;
  account.id = uuidv4();
  accounts.push(account);
  await _setAccounts(accounts);
  return account;
}

async function update(account) {
  if (!account) {
    return;
  }
  const accounts = (await getAll()) || [];
  const accountIndex = accounts.findIndex((acc) => acc.id === account.id);
  if (accountIndex !== -1) {
    accounts[accountIndex] = account;
  }
  await _setAccounts(accounts);
  return account;
}

async function remove(accountID = "") {
  const accounts = (await getAll()) || [];
  const updatedAccounts = accounts.filter((acc) => acc.id !== accountID);
  await _setAccounts(updatedAccounts);
  return updatedAccounts;
}

async function removeAll() {
  await _setAccounts([]);
}

async function setCurrentAccount(accountID) {
  const accounts = (await getAll()) || [];
  accounts.forEach((acc) => (acc.isCurrent = acc.id === accountID));
  await _setAccounts(accounts);
  return accounts.find((acc) => acc.isCurrent === true);
}

async function getCurrentAccount() {
  const accounts = (await getAll()) || [];
  return accounts.find((acc) => acc.isCurrent === true);
}

async function _setAccounts(accounts) {
  return dataStore().set(ACCOUNTS_DATA_STORE_KEY, accounts);
}

const accountSvc = {
  getAll,
  getById,
  add,
  update,
  remove,
  removeAll,
  setCurrentAccount,
  getCurrentAccount,
};

export default accountSvc;
