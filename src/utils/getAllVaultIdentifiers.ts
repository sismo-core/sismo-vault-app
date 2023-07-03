import { BigNumber, ethers } from "ethers";
import { getPoseidon } from "../libs/poseidon";
import { ImportedAccount } from "../libs/vault-client";
import { SNARK_FIELD } from "@sismo-core/hydra-s2";
import { keccak256 } from "ethers/lib/utils";
import { GroupMetadata } from "../libs/sismo-client";
import { getAccountTypeAppId } from "./getAccountTypeAppId";

export const getAllVaultIdentifiers = async (
  groupsMetadata: GroupMetadata[],
  vaultSecret: string,
  importedAccounts: ImportedAccount[]
): Promise<string[]> => {
  let identifiers: string[] = [];

  if (groupsMetadata?.length) {
    // List of all accountTypes of all claims
    const accountTypes: string[] = [];
    for (let groupMetadata of groupsMetadata) {
      for (let accountType of groupMetadata.accountTypes) {
        if (!accountTypes.find((el) => el === accountType)) accountTypes.push(accountType);
      }
    }

    // List of all appId used to generate vaultId in groups of claims
    const appIds: string[] = [];
    for (let accountType of accountTypes) {
      const appId = getAccountTypeAppId(accountType);
      if (appId) {
        if (!appIds.find((el) => el === appId)) appIds.push(appId);
      }
    }

    // List of all owned identifiers
    if (appIds?.length) {
      const poseidon = await getPoseidon();
      for (let appId of appIds) {
        const namespace = BigNumber.from(
          keccak256(ethers.utils.solidityPack(["uint128", "uint128"], [appId, BigNumber.from(0)]))
        )
          .mod(SNARK_FIELD)
          .toHexString();
        const userId = poseidon([vaultSecret, namespace]).toHexString();
        identifiers.push(userId);
      }
    }
  }
  for (let importedAccount of importedAccounts) {
    identifiers.push(importedAccount.identifier);
  }
  return identifiers;
};
