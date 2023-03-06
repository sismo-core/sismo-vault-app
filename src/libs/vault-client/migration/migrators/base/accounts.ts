import { EddsaPublicKey, EddsaSignature } from "@sismo-core/hydra-s1";
import { BigNumber } from "ethers";

type EthAccount = {
  identifier: string;
  seed: string;
  commitmentReceipt: EddsaSignature;
  commitmentMapperPubKey: EddsaPublicKey;
};

type Web2Account = {
  identifier: string;
  seed: string;
  commitmentReceipt: EddsaSignature;
  commitmentMapperPubKey: EddsaPublicKey;
  wallet: {
    mnemonic: string;
    accountNumber: number;
  };
};

export const ethAccount1: EthAccount = {
  identifier: "0x1",
  seed: "0xseed1",
  commitmentReceipt: [
    BigNumber.from(1),
    BigNumber.from(2),
    BigNumber.from(3),
  ] as EddsaSignature,
  commitmentMapperPubKey: [
    BigNumber.from(4),
    BigNumber.from(3),
  ] as EddsaPublicKey,
};

export const ethAccount2: EthAccount = {
  identifier: "0x2",
  seed: "0xseed2",
  commitmentReceipt: [
    BigNumber.from(5),
    BigNumber.from(6),
    BigNumber.from(7),
  ] as EddsaSignature,
  commitmentMapperPubKey: [
    BigNumber.from(8),
    BigNumber.from(9),
  ] as EddsaPublicKey,
};

export const ethAccount3: EthAccount = {
  identifier: "0x3",
  seed: "0xseed3",
  commitmentReceipt: [
    BigNumber.from(10),
    BigNumber.from(11),
    BigNumber.from(12),
  ] as EddsaSignature,
  commitmentMapperPubKey: [
    BigNumber.from(13),
    BigNumber.from(14),
  ] as EddsaPublicKey,
};

export const githubAccount1: Web2Account = {
  identifier: "0xgithub1",
  seed: "0xgithubSeed1",
  commitmentReceipt: [
    BigNumber.from(10),
    BigNumber.from(11),
    BigNumber.from(12),
  ] as EddsaSignature,
  commitmentMapperPubKey: [
    BigNumber.from(13),
    BigNumber.from(14),
  ] as EddsaPublicKey,
  wallet: {
    mnemonic: "github mnemonic number 1",
    accountNumber: 1,
  },
};

export const tweeterAccount1: Web2Account = {
  identifier: "0xtwitter1",
  seed: "0xtwitterSeed1",
  commitmentReceipt: [
    BigNumber.from(10),
    BigNumber.from(11),
    BigNumber.from(12),
  ] as EddsaSignature,
  commitmentMapperPubKey: [
    BigNumber.from(13),
    BigNumber.from(14),
  ] as EddsaPublicKey,
  wallet: {
    mnemonic: "tweeter mnemonic number 1",
    accountNumber: 1,
  },
};

export const recoveryKey1 = {
  key: "0xKey1",
  mnemonic: "key mnemonic 1",
  accountNumber: 1,
  valid: true,
  name: "Backup key 1",
};
