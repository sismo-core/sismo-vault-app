import CryptoJS from "crypto-js";

export const getVaultV1ConnectedOwner = () => {
  try {
    const cipherText = window.localStorage.getItem("minting_app_ct");
    if (!cipherText) return null;
    const encryptionKey = window.localStorage.getItem("minting_app_ek");
    if (!encryptionKey) return null;

    console.log("cipherText", cipherText);
    console.log("encryptionKey", encryptionKey);

    const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
    console.log("bytes", bytes);
    const owner = bytes.toString(CryptoJS.enc.Utf8);
    console.log("owner", owner);

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
