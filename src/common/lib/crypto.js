import { AES, enc } from "crypto-js";

export function encryptData(data, password, salt) {
  return AES.encrypt(JSON.stringify(data), password).toString();
}

export function decryptData(cipher, password, salt) {
  const decrypted = AES.decrypt(cipher, password);
  return JSON.parse(decrypted.toString(enc.Utf8));
}
