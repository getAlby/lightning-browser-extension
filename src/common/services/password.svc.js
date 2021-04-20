import dataStore from "../data-store";
import messagingSvc from "./messaging.svc";

/**
 * Configure the password that will be used to secure this account and enrypt the data.
 * @param {string} password original password
 * @param {string} confirmedPassword confirmed passord
 */
async function init(password, confirmedPassword) {
  if (password !== confirmedPassword) {
    throw new Error("Cannot initialzie. Passwords do not match!");
  }
  const storage = dataStore(password);
  await storage.set("isPasswordSet", true);
}

/**
 * Check if the provided password is the correct one, that is the one used to initalize the account.
 * @param {string} password the passord
 * @returns true if the passord is correct, false otherwise
 */
async function checkPassword(password) {
  if (password && password.length) {
    return _checkUserPassword(password);
  }
  return _checkCachedPassword();
}

/**
 * Check if the user has already configured a password for the extension.
 * @returns true if the user has already configured a password, false otherwise
 */
async function isInitialized() {
  const storage = dataStore();
  return storage.isInitialized();
}

/**
 * Check if the user has provided a valid password since the extesion was last time loaded.
 * @returns true if the user has already provided a valid password, false otherwise
 */
async function isUnlocked() {
  const storage = dataStore();
  return storage.isUnlocked();
}

async function _checkUserPassword(password) {
  try {
    const storage = dataStore(password);
    const isPasswordSet = await storage.get("isPasswordSet");
    return isPasswordSet === true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function _checkCachedPassword() {
  return new Promise(async (resolve) => {
    await messagingSvc.onMessage("cached-password", async (msg) => {
      const isPasswordSet = await _checkUserPassword(msg.password);
      resolve(isPasswordSet);
    });
    await messagingSvc.sendMessage("get-password-from-cache");
  });
}

const passwordSvc = {
  init,
  checkPassword,
  isInitialized,
  isUnlocked,
};

export default passwordSvc;
