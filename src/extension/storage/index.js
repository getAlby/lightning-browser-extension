import browser from "webextension-polyfill";

import { encryptData, decryptData } from "../../common/lib/crypto";

/**
 * Encripted storage module. A passord is required to initialize this module.
 * The storage is under the form of key-value pairs.
 */
let cachedStorage = null;

function init(password) {
  if (!password) {
    throw new Error("A passord is required to initialize the storage module!");
  }

  const pwd = `${password}`;

  function get(key) {
    if (!key || typeof key !== "string") {
      throw new Error("Invalid key: " + key);
    }
    return browser.storage.sync.get(key).then((result) => {
      try {
        if (!result || !result[key]) return;
        const decriptedData = decryptData(result[key], pwd);
        return decriptedData && decriptedData.data;
      } catch (err) {
        console.error(err);
        throw new Error("Cannot decode data from storage. Wrong password!");
      }
    });
  }

  function set(key, data) {
    if (!key || typeof key !== "string") {
      throw new Error("Invalid key: " + key);
    }

    const encryptedData = encryptData({ data }, pwd);
    const kV = {
      [key]: encryptedData,
    };
    return browser.storage.sync.set(kV);
  }

  return {
    set,
    get,
    isInitialized: async function () {
      // TODO: recheck
      const isPasswordSet = await browser.storage.sync.get("isPasswordSet");
      return (
        isPasswordSet !== undefined &&
        JSON.stringify(isPasswordSet) !== JSON.stringify({})
      );
    },
    isUnlocked: async function () {
      return true;
    },
  };
}

function initNullDataStore() {
  return {
    set: async function () {
      throw new Error("Operation not permitted. Data Store is not unlocked!");
    },
    get: async function () {
      throw new Error("Operation not permitted. Data Store is not unlocked!");
    },
    isInitialized: async function () {
      const isPasswordSet = await browser.storage.sync.get("isPasswordSet");
      return (
        isPasswordSet !== undefined &&
        JSON.stringify(isPasswordSet) !== JSON.stringify({})
      );
    },
    isUnlocked: async function () {
      return false;
    },
  };
}

const dataStore = function (password) {
  if (password) {
    cachedStorage = init(password);
    return cachedStorage;
  }
  if (cachedStorage) {
    return cachedStorage;
  }
  return initNullDataStore();
};

export default dataStore;
