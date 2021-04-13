import { encryptData, decryptData } from "../../../common/lib/crypto";

/**
 * Encripted storage module. A passord is required to initialize this module.
 * The storage is under the form of key-value pairs.
 */
module.exports = function init(password) {
  if (!password) {
    throw new Error("A passord is required to initialize the storage module!");
  }

  const pwd = `${password}`;
  const salt = window.crypto.getRandomValues(new Uint32Array(4)).join("");

  function get(key) {
    return browser.storage.sync.get(key).then((result) => {
      try {
        if (!result) return;
        const decriptedData = decryptData(result, pwd, salt);
        return decriptedData.data;
      } catch (err) {
        console.error(err);
        throw new Error("Cannot decode data from storage. Wrong password!");
      }
    });
  }

  function set(key, data) {
    // typeof key !== "string"
    const encryptedData = encryptData(data, pwd, salt);
    return browser.storage.sync.set(key, { data: encryptedData });
  }

  return {
    set,
    get,
  };
};
