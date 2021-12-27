import { AES, enc } from "crypto-js";

export function encryptData(data: unknown, password: string) {
  return AES.encrypt(JSON.stringify(data), password).toString();
}

export function decryptData(cipher: string, password: string) {
  const decrypted = AES.decrypt(cipher, password);
  return JSON.parse(decrypted.toString(enc.Utf8));
}
