import { Vault } from "./client.types";
import { BigNumber } from "ethers";

export const demoVault: Vault = {
  loadingActiveSession: false,
  commitmentMapper: {
    url: "https://x93oogcd5e.execute-api.eu-west-1.amazonaws.com",
  },
  keepConnected: true,
  vaultName: "My Sismo vault",
  autoImportOwners: true,
  importedAccounts: [
    {
      identifier: "0x41527b1845caa922c28911f5f9c76bdc12eee712",
      seed: "0x4a7aa8f1af7ac047f128dfa9e895ef716e16128f17af70ab722ee88c02467068",
      commitmentReceipt: [
        BigNumber.from(
          "0x300159a32410e4701fa9a32e459399f693df523a553268c97c1648cd7f6cfc92"
        ),
        BigNumber.from(
          "0x0ecc980da27cca5c7542825931fa54e3456fa6f53d85fd5bac24c39616fc81f4"
        ),
        BigNumber.from(
          "0x0119e6d7a330c058aaf92eb8976679d7dd64f055ccb41376ea31601d33620129"
        ),
      ],
      commitmentMapperPubKey: [
        BigNumber.from(
          "0x07f6c5612eb579788478789deccb06cf0eb168e457eea490af754922939ebdb9"
        ),
        BigNumber.from(
          "0x20706798455f90ed993f8dac8075fc1538738a25f0c928da905c0dffd81869fa"
        ),
      ],
      type: "ethereum",
      timestamp: 1678459334350,
    },
    {
      identifier: "0x91c46e41f6af316142c4b58b1afb91d4655ff87c",
      seed: "0xd5b0dff2c9b0168e8998447e7b64df1f0fbe805b7442ab91377d8168aafe4ad0",
      commitmentReceipt: [
        BigNumber.from(
          "0x304cab23adfdb1a3aabc7a8d4069a4abf6f4fa8497a3f30ae6bb5a7c9c0ee6d6"
        ),
        BigNumber.from(
          "0x2733975edd50220e9b41de45c65a41dea020e1da4c5176d7cfa081102279cffc"
        ),
        BigNumber.from(
          "0x02c6bba4c9176ad646dd043828cc1d88d37d6442311e397cf5f0893c734fc27d"
        ),
      ],
      commitmentMapperPubKey: [
        BigNumber.from(
          "0x07f6c5612eb579788478789deccb06cf0eb168e457eea490af754922939ebdb9"
        ),
        BigNumber.from(
          "0x20706798455f90ed993f8dac8075fc1538738a25f0c928da905c0dffd81869fa"
        ),
      ],
      type: "ethereum",
      timestamp: 1678459363524,
    },
    {
      identifier: "0x4ef9c52e3af04eafbda4ad6c65be08282b39c4bf",
      seed: "0x8205b82bfd32ef2061e25eae75459b4777432f3db0dde5a1b6376a38f1fa024a",
      commitmentReceipt: [
        BigNumber.from(
          "0x2d984b3e9ff3544c03a62e5e5a639f77d342f5a8042686434e75bad248ae12b1"
        ),
        BigNumber.from(
          "0x272b017855b59f2cd509478d716281cd64609856982a9ce69e0ad12cb01daf52"
        ),
        BigNumber.from(
          "0x05625cbbe4f158a4539f078c46069c00582570ba33a50b84c7b89a5eed337753"
        ),
      ],
      commitmentMapperPubKey: [
        BigNumber.from(
          "0x07f6c5612eb579788478789deccb06cf0eb168e457eea490af754922939ebdb9"
        ),
        BigNumber.from(
          "0x20706798455f90ed993f8dac8075fc1538738a25f0c928da905c0dffd81869fa"
        ),
      ],
      type: "ethereum",
      timestamp: 1678459385136,
    },
    {
      identifier: "0x1ae8839726ca075b866138e80c85d50c33d696ed",
      seed: "0x38b31bdb6562614125218b667571eab501c8238c37b3e566d39a0f63f2036a3b",
      commitmentReceipt: [
        BigNumber.from(
          "0x1ffe179d00b7e6a76f4bb67be88d61446f5ea28448dde901ac7148948fd195dc"
        ),
        BigNumber.from(
          "0x27a76499324a843340a1f3195a0b313187b3310c2424c00e86e747d26a8630ed"
        ),
        BigNumber.from(
          "0x04145394ded8d2124abc7ca2c4111a71ec5cf6aafc1d6012468f46409c2f0d99"
        ),
      ],
      commitmentMapperPubKey: [
        BigNumber.from(
          "0x07f6c5612eb579788478789deccb06cf0eb168e457eea490af754922939ebdb9"
        ),
        BigNumber.from(
          "0x20706798455f90ed993f8dac8075fc1538738a25f0c928da905c0dffd81869fa"
        ),
      ],
      type: "ethereum",
      timestamp: 1678459403673,
    },
  ],
  owners: [
    {
      seed: "0x4a7aa8f1af7ac047f128dfa9e895ef716e16128f17af70ab722ee88c02467068",
      identifier: "0x41527b1845caa922c28911f5f9c76bdc12eee712",
      timestamp: 1678459328743,
    },
    {
      identifier: "0x91c46e41f6af316142c4b58b1afb91d4655ff87c",
      seed: "0xd5b0dff2c9b0168e8998447e7b64df1f0fbe805b7442ab91377d8168aafe4ad0",
      timestamp: 1678459363524,
    },
    {
      identifier: "0x4ef9c52e3af04eafbda4ad6c65be08282b39c4bf",
      seed: "0x8205b82bfd32ef2061e25eae75459b4777432f3db0dde5a1b6376a38f1fa024a",
      timestamp: 1678459385136,
    },
    {
      identifier: "0x1ae8839726ca075b866138e80c85d50c33d696ed",
      seed: "0x38b31bdb6562614125218b667571eab501c8238c37b3e566d39a0f63f2036a3b",
      timestamp: 1678459403673,
    },
  ],
  connectedOwner: {
    seed: "0x4a7aa8f1af7ac047f128dfa9e895ef716e16128f17af70ab722ee88c02467068",
    identifier: "0x41527b1845caa922c28911f5f9c76bdc12eee712",
    timestamp: 1678459328743,
  },
  isConnected: true,
  deletable: false,
  recoveryKeys: [],
};
