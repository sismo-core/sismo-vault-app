import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber, Contract } from "ethers";
import env from "../../../environment";
import { ChainIdToName, ContractABIs } from "../contracts/commons";
import { Badges as BadgesContract } from "../contracts/commons/typechain";
import { Account, Badge, MintedBadge } from "../types";
import * as Sentry from "@sentry/react";

export type Filter = {
  collectionIds?: number[];
};

export class Badges {
  private chainId: number;
  private provider: Provider;

  constructor({ provider, chainId }: { provider: Provider; chainId: number }) {
    this.chainId = chainId;
    this.provider = provider;
  }

  public async getMintedBadgesFromContracts(
    accounts: Account[],
    badges: Badge[]
  ): Promise<MintedBadge[]> {
    try {
      const contract = new Contract(
        env.contracts[this.chainId]["Badges"].address,
        ContractABIs["Badges"],
        this.provider
      ) as BadgesContract;
      const collectionIds = badges.map((badge) => badge.collectionId);

      const _addresses = [];
      const _ids = [];
      for (let account of accounts) {
        for (let id of collectionIds) {
          _addresses.push(account.identifier);
          _ids.push(id);
        }
      }

      const balances = await contract.balanceOfBatch(_addresses, _ids);
      const mintedBadges: MintedBadge[] = [];
      let balanceIndex = 0;
      for (let account of accounts) {
        for (let collectionId of collectionIds) {
          const balance = balances[balanceIndex];
          if (balance.gt(0)) {
            mintedBadges.push({
              badge: badges.find(
                (badge) => badge.collectionId === collectionId
              ),
              owner: account,
              network: ChainIdToName[this.chainId],
              value: BigNumber.from(balance).toString(),
            });
          }
          balanceIndex++;
        }
      }
      return mintedBadges;
    } catch (e) {
      Sentry.captureException(e);
      console.error("Balance Of Batch", e);
      return null;
    }
  }
}
