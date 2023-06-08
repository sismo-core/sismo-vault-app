import { deleteCookie, getCookie } from "./cookies";
import CryptoJS from "crypto-js";

export const getVaultV2ConnectedOwner = () => {
  // Clean old version of as
  window.localStorage.removeItem("as_sismo_ct");
  deleteCookie("as_sismo_ek");
  try {
    const cipherText = window.localStorage.getItem("as_sismo_ct_v1");
    if (!cipherText) return null;
    const encryptionKey = getCookie("as_sismo_ek_v1");
    if (!encryptionKey) return null;

    const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
    const owner = bytes.toString(CryptoJS.enc.Utf8);

    if (!owner) return null;
    return JSON.parse(owner);
  } catch (e) {
    console.error(e);
    window.localStorage.removeItem("as_sismo_ct_v1");
    deleteCookie("as_sismo_ek_v1");
  }
};
