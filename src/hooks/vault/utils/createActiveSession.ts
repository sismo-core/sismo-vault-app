import CryptoJS from "crypto-js";
import { setCookie, deleteCookie } from "./cookies";
import SHA3 from "sha3";
import { BigNumber, utils } from "ethers";
import { Owner } from "../../../libs/vault-client";

const generateDataEncryptionKeyFromSeed = (seed: string) => {
  const hash = new SHA3(256);
  const randomBigNumber = BigNumber.from(utils.randomBytes(32)).toHexString();
  return "0x" + hash.update(seed + "/dataEncryptionKey_" + randomBigNumber).digest("hex");
};

export const createActiveSession = (owner: Owner, expireHours: number) => {
  const dataKeyEncryption = generateDataEncryptionKeyFromSeed(owner.seed);
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(owner), dataKeyEncryption).toString();
  setCookie("as_sismo_ek_v1", dataKeyEncryption, expireHours);
  localStorage.setItem("as_sismo_ct_v1", ciphertext);
};

export const deleteActiveSession = () => {
  deleteCookie("as_sismo_ek");
  localStorage.removeItem("as_sismo_ct");
};
