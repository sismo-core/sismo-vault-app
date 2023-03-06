import axios, { AxiosResponse } from "axios";
import { Badge, ChainIdToName } from "..";
import env from "../../../environment";
import environment from "../../../environment";
import { Attesters } from "../attesters";
import { fetchAvailableGroups } from "./available-data";
import { GroupGenerator, BadgeSismoHub } from "./badges";
import { getNumberOfHolders } from "./stats";
import { AvailableGroups } from "../attesters/hydraS1/types";

const cache = new Map();
export const fetchBadge = async (
  attesters: Attesters,
  collectionId: number,
  chainId: number
): Promise<Badge> => {
  const key = `${env.badgesApiUrl}_${chainId}_${collectionId}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  /***************************************************/
  /********************* GET BADGE *******************/
  /***************************************************/

  const badgesSismoHub = await axios
    .get(
      `${env.badgesApiUrl}/badges/${ChainIdToName[chainId]}/details/${collectionId}`
    )
    .then(
      async (res: AxiosResponse<{ items: BadgeSismoHub[] }>) => res.data.items
    );
  const badgeSismoHub = badgesSismoHub[0];

  /***************************************************/
  /**************** GET GROUP NAME *******************/
  /***************************************************/

  const { availableGroups } = (await fetchAvailableGroups(
    "hydra-s1-accountbound",
    chainId
  )) as { availableGroups: AvailableGroups };
  const badgeAttester = attesters.getAttester(badgeSismoHub.collectionId);

  let groupName = null;
  for (const accountTree of availableGroups?.accountTrees) {
    const collectionId = badgeAttester.getCollectionId(
      accountTree.groupProperties.internalCollectionId
    );
    if (collectionId === badgeSismoHub.collectionId) {
      groupName = accountTree?.metadata?.groupName;
      break;
    }
  }

  /***************************************************/
  /********************* GET GROUP *******************/
  /***************************************************/

  const groupLatest = await axios
    .get(`${environment.badgesApiUrl}/groups/${groupName}?latest=true`)
    .then((res) => res.data.items[0]);

  /***************************************************/
  /************** GET GROUP GENERATOR ****************/
  /***************************************************/

  const groupGenerator = await axios
    .get(
      `${environment.badgesApiUrl}/group-generators/${groupLatest.generatedBy}`
    )
    .then((res) => res.data.items[0] as GroupGenerator);

  /***************************************************/
  /************** GET NB BADGE HOLDERS ***************/
  /***************************************************/

  const badgeNbHolders = await getNumberOfHolders(collectionId, chainId);

  const group =
    groupGenerator && groupLatest
      ? {
          name: groupGenerator.name,
          groupGenerator: {
            name: groupGenerator.name,
            frequency: groupGenerator.generationFrequency,
            lastGeneratedAt: groupGenerator.generationTimestamp,
          },
          lastGeneratedAt: groupLatest.timestamp,
          dataUrl: groupLatest.dataUrl,
          stats: {
            totalAccounts: groupLatest.properties.accountsNumber,
            totalAccountsByLevel: groupLatest.properties.tierDistribution,
          },
          accountTypes: groupLatest.accountSources,
        }
      : null;

  const stats = {
    totalHolders: badgeNbHolders,
    totalHoldersByChain: {
      [badgeSismoHub.network]: badgeNbHolders,
    },
  };

  const badge = {
    collectionId: badgeSismoHub.collectionId,
    name: badgeSismoHub.name,
    description: badgeSismoHub.description,
    attributes: badgeSismoHub.attributes,
    eligibility: badgeSismoHub.eligibility,
    image: badgeSismoHub.image,
    publicContacts: badgeSismoHub.publicContacts,
    links: badgeSismoHub.links,
    networks: [badgeSismoHub.network],
    group,
    stats,
    path: badgeSismoHub.name.replace(/ /g, "-").toLowerCase(),
  };

  cache.set(key, badge);
  return badge;
};
