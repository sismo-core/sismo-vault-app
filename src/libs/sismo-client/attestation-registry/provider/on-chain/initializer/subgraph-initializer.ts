import axios, { AxiosResponse } from "axios";
import { Attestation } from "../../../types";
import { Initializer } from "./initializer";
import * as Sentry from "@sentry/react";

export class SubgraphInitializer extends Initializer {
  private url: string;
  private limitByPage: number;

  constructor({ url, limitByPage }: { url: string; limitByPage?: number }) {
    super();
    this.url = url;
    if (!limitByPage) this.limitByPage = 10000;
    else this.limitByPage = limitByPage;
  }

  public async init(): Promise<{
    attestations: Attestation[];
    block: number;
  }> {
    let block = 0;
    let attestations: Attestation[] = [];
    try {
      const { block: metricsBlock, totalNbAttestations } =
        await this.getCurrentMetrics();
      attestations = await this.getAllAttestations(totalNbAttestations);
      block = metricsBlock;
    } catch (e) {
      console.error("Build error", e);
      Sentry.withScope(function (scope) {
        scope.setLevel("fatal");
        Sentry.captureException(e);
      });
    }
    return {
      block,
      attestations,
    };
  }

  private getAllAttestations = async (
    totalNbAttestations: number
  ): Promise<Attestation[]> => {
    const allPromises = [];
    const pageNb = Math.ceil(totalNbAttestations / this.limitByPage);
    for (let page = 1; page <= pageNb; page++) {
      const variables = {
        first: this.limitByPage,
        skip: (page - 1) * this.limitByPage,
      };
      allPromises.push(
        axios({
          url: this.url,
          method: "post",
          data: {
            query: `
              query GetAttestations ($first: Int, $skip: Int) {
                badges(first: $first, skip: $skip) {
                  tokenId
                  id
                  hydraS1Nullifier {
                    nullifier
                    id
                    timestamp
                  }
                  balance
                  owner {
                    id
                  }
                }
              }
            `,
            variables,
          },
        }).then((res: AxiosResponse<any>): Attestation[] => {
          const badges = res?.data?.data?.badges;
          return badges.map((badge) => ({
            collectionId: Number(badge.tokenId),
            value: badge.balance,
            owner: badge.owner.id.toLowerCase(),
            timestamp: Number(badge.hydraS1Nullifier.timestamp),
            extraData: {
              nullifier: badge.hydraS1Nullifier.nullifier,
            },
          }));
        })
      );
    }
    let attestationArrays = await Promise.all(allPromises);
    return attestationArrays.flat();
  };

  private getCurrentMetrics = async (): Promise<{
    block: number;
    totalNbAttestations: number;
  }> => {
    const { data: dataMetrics } = await axios({
      url: this.url,
      method: "post",
      data: {
        query: `
          query GetMetrics {
            stats {
              totalNbBadges
              totalNbAddresses
            }
            _meta {
              deployment
              hasIndexingErrors
              block {
                number
                timestamp
              }
            }
          }
        `,
      },
    });
    if (dataMetrics?.errors) {
      throw new Error(
        dataMetrics?.errors?.map((error) => error?.message).join(", ")
      );
    }
    const block = dataMetrics?.data?._meta.block.number;
    const totalNbAttestations = dataMetrics?.data?.stats[0]?.totalNbBadges;
    return {
      block,
      totalNbAttestations,
    };
  };
}
