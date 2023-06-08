import CryptoJS from "crypto-js";

export const getVaultV1ConnectedOwner = () => {
  try {
    const cipherText = window.localStorage.getItem("minting_app_ct");
    if (!cipherText) return null;
    const encryptionKey = window.localStorage.getItem("minting_app_ek");
    if (!encryptionKey) return null;

    const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
    const owner = bytes.toString(CryptoJS.enc.Utf8);

    window.localStorage.removeItem("minting_app_ek");
    window.localStorage.removeItem("minting_app_ct");

    if (!owner) return null;
    return JSON.parse(owner);
  } catch (e) {
    console.error(e);
    window.localStorage.removeItem("minting_app_ct");
    window.localStorage.removeItem("minting_app_ek");
  }
};
