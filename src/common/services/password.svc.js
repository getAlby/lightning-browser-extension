import dataStore from "../data-store";
import messaging from "./messaging";

async function init(password, confirmedPassword) {
  if (password !== confirmedPassword) {
    throw new Error("Cannot initialzie. Passwords do not match!");
  }
  const storage = dataStore(password);
  await storage.set("isPasswordSet", true);
}

async function checkPassword(password) {
  if (password && password.length) {
    return _checkUserPassword(password);
  }
  return _checkCachedPassword();
}

async function isInitialized() {
  const storage = dataStore();
  return storage.isInitialized();
}

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
    await messaging.onMessage("cached-password", async (msg) => {
      const isPasswordSet = await _checkUserPassword(msg.password);
      resolve(isPasswordSet);
    });
    await messaging.sendMessage("get-password-from-cache");
  });
}

const passwordSvc = {
  init,
  checkPassword,
  isInitialized,
  isUnlocked,
};

export default passwordSvc;
