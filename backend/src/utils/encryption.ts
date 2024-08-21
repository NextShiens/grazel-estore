import * as CryptoJS from "crypto-js";

const iv = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");

export function encrypt(plainText: string, workingKey: string): string {
  const key = CryptoJS.MD5(workingKey);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
  }).toString();
  return encrypted;
}

export function decrypt(encText: string, workingKey: string): string {
  const key = CryptoJS.MD5(workingKey);
  const decrypted = CryptoJS.AES.decrypt(encText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
  }).toString(CryptoJS.enc.Utf8);
  return decrypted;
}
