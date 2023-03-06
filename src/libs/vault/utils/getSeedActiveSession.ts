import { deleteCookie, getCookie } from "./cookies";
import CryptoJS from "crypto-js";

export const getSeedActiveSession = () => {
  try {
    const ciphertext = window.localStorage.getItem("as_sismo_ct");
    if (!ciphertext) return null;
    const encryptionKey = getCookie("as_sismo_ek");
    if (!encryptionKey) return null;
    //Decrypt
    const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
    const owner = bytes.toString(CryptoJS.enc.Utf8);
    if (!owner) return null;
    return JSON.parse(owner);
  } catch (e) {
    console.error(e);
    window.localStorage.removeItem("as_sismo_ct");
    deleteCookie("as_sismo_ek");
  }
};
