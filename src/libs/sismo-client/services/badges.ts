import axios, { AxiosResponse } from "axios";
import { Badge, ChainIdToName, ChainNameToId } from "..";
import {
  FilterField,
  BadgeAttribute,
  BadgeAttributeValue,
  Network,
} from "../types";
import { SortParameters } from "..";
import env from "../../../environment";
import FuzzySet from "fuzzyset";
import environment from "../../../environment";
import { AccountType } from "../../vault-client";
import { fetchAvailableGroups } from "./available-data";
import { Attesters } from "../attesters";
import { getNumberOfHolders } from "./stats";
import { AvailableGroups } from "../attesters/hydraS1/types";

//Badge format currently return by the sismo hub
export type BadgeSismoHub = {
  attributes: any;
  collectionId: number;
  description: string;
  eligibility: { shortDescription: string; specification: string };
  groupGeneratorName: string;
  image: string;
  isCurated: boolean;
  links: [];
  name: string;
  network: Network;
  networks: Network[];
  publicContacts: { type: AccountType; contact: string }[];
};

const promiseCache = new Map();
const cache = new Map();
export const fetchBadges = async (
  attesters: Attesters,
  sortParameters?: SortParameters
): Promise<Badge[]> => {
  const key = `${JSON.stringify(sortParameters)}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const { filters, orderBy } = sortParameters || {};
  const { chainIds, collectionIds, searchValue } = filters || {};
  const { field, direction } = orderBy || {};

  let allBadges;
  const promiseKey = `${env.badgesApiUrl}`;
  if (!promiseCache.has(promiseKey)) {
    promiseCache.set(promiseKey, getAllBadges(attesters, env.chainIds));
  }
  allBadges = await promiseCache.get(promiseKey);

  // STEP 1 : FILTERING BY RADIO AND CHECKBOX
  let filteredBadges = allBadges.filter((badge) => {
    if (collectionIds && !collectionIds.includes(badge.collectionId))
      return false;
    return true;
  });

  // STEP 1.5 : FILTERING BY CHAIN
  if (chainIds) {
    filteredBadges = filteredBadges.filter((badge) => {
      for (let badgeNetwork of badge.networks) {
        if (chainIds.includes(ChainNameToId[badgeNetwork])) return true;
      }
      return false;
    });
  }

  // STEP 1.6 : FILTERING BY CURATED
  if (sortParameters?.filters?.curated) {
    filteredBadges = filteredBadges.filter((badge) => {
      return badge?.attributes?.length > 0;
    });
  }
  // STEP 2 : FILTERING BY SEARCH
  let searchedBadges = filteredBadges;

  if (searchValue?.length > 0) {
    const fuzzySet = FuzzySet();
    for (const filteredBadge of filteredBadges) {
      fuzzySet.add(`${filteredBadge.collectionId} ${filteredBadge.name}`);
    }
    const searchResult = fuzzySet.get(searchValue, false, 0);
    if (!searchResult) {
      searchedBadges = filteredBadges;
    } else {
      searchResult?.sort((a: [[number, string]], b: [[number, string]]) => {
        if (a[0] < b[0]) return 1;
        if (a[0] > b[0]) return -1;
        return 0;
      });

      searchedBadges = searchResult.map((result) => {
        return filteredBadges.find((badge) => result[1].includes(badge.name));
      });
    }
  } else {
    searchedBadges = filteredBadges;
  }
  function getAttributeScore(
    badge: Badge,
    attribute: BadgeAttribute | FilterField
  ) {
    const valueString = badge.attributes.find(
      (attr) => attr.trait_type === attribute
    )?.value;

    const value =
      BadgeAttributeValue.VERY_HIGH === valueString
        ? 4
        : BadgeAttributeValue.HIGH === valueString
        ? 3
        : BadgeAttributeValue.MEDIUM === valueString
        ? 2
        : BadgeAttributeValue.LOW === valueString
        ? 1
        : 0;
    return value;
  }

  // STEP 3 : SORTING BY COLUMN
  if (field && direction) {
    if (field === FilterField.ELIGIBILITY) {
      return searchedBadges;
    } else if (
      field === FilterField.PRIVACY ||
      field === FilterField.SYBIL_RESISTANCE ||
      field === FilterField.TRUSTLESSNESS
    ) {
      searchedBadges.sort((a, b) => {
        if (direction === "asc") {
          if (
            getAttributeScore(a, field) < getAttributeScore(b, field) ||
            !getAttributeScore(a, field)
          )
            return -1;
          if (
            getAttributeScore(a, field) > getAttributeScore(b, field) ||
            !getAttributeScore(b, field)
          )
            return 1;
          return 0;
        } else if (direction === "desc") {
          if (
            getAttributeScore(a, field) > getAttributeScore(b, field) ||
            !getAttributeScore(b, field)
          )
            return -1;
          if (
            getAttributeScore(a, field) < getAttributeScore(b, field) ||
            !getAttributeScore(a, field)
          )
            return 1;
          return 0;
        } else {
          return 0;
        }
      });
    } else if (field === FilterField.HOLDERS) {
      searchedBadges.sort((a, b) => {
        if (direction === "asc") {
          if (
            !a?.stats?.totalHolders ||
            +a?.stats?.totalHolders < +b?.stats?.totalHolders
          )
            return -1;
          if (
            !b?.stats?.totalHolders ||
            +a?.stats?.totalHolders > +b?.stats?.totalHolders
          )
            return 1;
          return 0;
        } else if (direction === "desc") {
          if (
            !b?.stats?.totalHolders ||
            +a?.stats?.totalHolders > +b?.stats?.totalHolders
          )
            return -1;
          if (
            !a?.stats?.totalHolders ||
            +a?.stats?.totalHolders < +b?.stats?.totalHolders
          )
            return 1;
          return 0;
        } else {
          return 0;
        }
      });
    } else {
      searchedBadges.sort((a, b) => {
        if (direction === "asc") {
          if (a[field] < b[field] || !a[field]) return -1;
          if (a[field] > b[field] || !b[field]) return 1;
          return 0;
        } else if (direction === "desc") {
          if (a[field] > b[field] || !b[field]) return -1;
          if (a[field] < b[field] || !a[field]) return 1;
          return 0;
        } else {
          return 0;
        }
      });
    }
  }
  cache.set(key, searchedBadges);
  return searchedBadges;
};

const getAllBadges = async (
  attesters: Attesters,
  chainIds: number[]
): Promise<Badge[]> => {
  const groupsLatestPromise: Promise<Group[]> = axios
    .get(`${environment.badgesApiUrl}/groups/latests`)
    .then((res) => res.data.items);

  const dataGroupGeneratorsPromise: Promise<GroupGenerator[]> = axios
    .get(`${environment.badgesApiUrl}/group-generators`)
    .then((res) => res.data.items as GroupGenerator[]);

  const getBadgesPromise: Promise<BadgeSismoHub[][]> = Promise.all(
    chainIds.map((chainId) => {
      return axios
        .get(`${env.badgesApiUrl}/badges/${ChainIdToName[chainId]}`)
        .then(async (res: AxiosResponse<{ items: BadgeSismoHub[] }>) => {
          const badgesSismoHub = res.data.items;
          return badgesSismoHub;
        });
    })
  );

  const [badges, groupsLatest, groupGenerators] = await Promise.all([
    getBadgesPromise,
    groupsLatestPromise,
    dataGroupGeneratorsPromise,
  ]);

  /*****************************************/
  /**************  GET GROUPS  *************/
  /*****************************************/

  let groupsPromiseAll = [];
  for (let [index, chainId] of chainIds.entries()) {
    const groupsPromise = fetchGroups(
      attesters,
      badges[index],
      chainId,
      groupsLatest
    );
    groupsPromiseAll.push(groupsPromise);
  }
  const groupsByChain = await Promise.all(groupsPromiseAll);
  /*****************************************/
  /****************  FORMAT  ***************/
  /*****************************************/

  let allBadges: Badge[] = [];
  for (let [index, chainId] of chainIds.entries()) {
    const badgesSismoHub = badges[index];
    const groupsByBadge = groupsByChain[index];
    const groupGeneratorsByBadges = badges[index].map((badge) => {
      return groupGenerators.find(
        (groupGenerator) => groupGenerator.name === badge.groupGeneratorName
      );
    });

    for (let [index, badgeSismoHub] of badgesSismoHub.entries()) {
      const badgeNbHolders = await getNumberOfHolders(
        badgeSismoHub.collectionId,
        chainId
      );

      const indexOfBadge = allBadges.findIndex(
        (el) => el.collectionId === badgeSismoHub.collectionId
      );
      if (indexOfBadge === -1) {
        const group =
          groupGeneratorsByBadges[index] && groupsByBadge[index]
            ? {
                name: groupGeneratorsByBadges[index].name,
                groupGenerator: {
                  name: groupGeneratorsByBadges[index].name,
                  frequency: groupGeneratorsByBadges[index].generationFrequency,
                  lastGeneratedAt:
                    groupGeneratorsByBadges[index].generationTimestamp,
                },
                lastGeneratedAt: groupsByBadge[index].timestamp,
                dataUrl: groupsByBadge[index].dataUrl,
                stats: {
                  totalAccounts: groupsByBadge[index].properties.accountsNumber,
                  totalAccountsByLevel:
                    groupsByBadge[index].properties.tierDistribution,
                },
                accountTypes: groupsByBadge[index].accountSources,
              }
            : null;

        const stats = {
          totalHolders: badgeNbHolders,
          totalHoldersByChain: {
            [badgeSismoHub.network]: badgeNbHolders,
          },
        };

        allBadges.push({
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
        });
      } else {
        allBadges[indexOfBadge].networks.push(badgeSismoHub.network);
        if (badgeNbHolders) {
          allBadges[indexOfBadge].stats = {
            totalHolders:
              allBadges[indexOfBadge].stats.totalHolders + badgeNbHolders,
            totalHoldersByChain: {
              ...allBadges[indexOfBadge].stats.totalHoldersByChain,
              [badgeSismoHub.network]: badgeNbHolders,
            },
          };
        }
      }
    }
  }
  return allBadges;
};

export type Group = {
  accountSources: AccountType[];
  dataUrl: string;
  generatedBy: string;
  name: string;
  properties: {
    accountsNumber: number;
    tierDistribution: { [level: number]: number };
  };
  tags: string[];
  timestamp: number;
  valueType: "Info" | "Score";
};

export const fetchGroups = async (
  attesters: Attesters,
  badges: BadgeSismoHub[],
  chainId: number,
  latestGroups: Group[]
): Promise<Group[]> => {
  const { availableGroups } = (await fetchAvailableGroups(
    "hydra-s1-accountbound",
    chainId
  )) as { availableGroups: AvailableGroups };

  return badges.map((badge) => {
    const badgeAttester = attesters.getAttester(badge.collectionId);

    let groupName;
    for (const accountTree of availableGroups?.accountTrees) {
      const collectionId = badgeAttester?.getCollectionId(
        accountTree.groupProperties.internalCollectionId
      );
      if (collectionId === badge.collectionId) {
        groupName = accountTree?.metadata?.groupName;
        break;
      }
    }
    if (!groupName) return null;

    return latestGroups.find((group) => group.name === groupName);
  });
};

export type GroupGenerator = {
  generationFrequency: string;
  generationTimestamp: number;
  name: string;
};
