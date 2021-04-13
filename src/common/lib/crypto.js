import { AES, enc } from "crypto-js";

export function encryptData(data, password) {
  return AES.encrypt(JSON.stringify(data), password).toString();
}

export function decryptData(cipher, password) {
  const decrypted = AES.decrypt(cipher, password);
  const jsonStr = decrypted.toString(enc.Utf8);
  if (!jsonStr || !jsonStr.length) {
    return;
  }
  return JSON.parse(jsonStr);
}
