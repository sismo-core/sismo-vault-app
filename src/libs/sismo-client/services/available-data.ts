import { JsonMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s1";
import axios from "axios";
import { ChainIdToName } from "..";
import env from "../../../environment";
import { OffchainAvailableGroups } from "../registry-tree-readers/types";
import { AvailableData, AvailableGroups } from "../attesters/hydraS1/types";

const promiseAvailableDataCache = new Map();
const EXPIRATION_DURATION = 1000 * 60 * 10;
//TODO persist on indexDB
export const fetchAvailableGroups = async (
  attesterName: string,
  chainId: number,
  ignoreCache: boolean = false
): Promise<{
  availableGroups: AvailableGroups | OffchainAvailableGroups;
  timestamp: number;
}> => {
  const key = `${env.hydraApiUrl}_${ChainIdToName[chainId]}_${attesterName}`;
  if (
    !promiseAvailableDataCache.has(key) ||
    ignoreCache ||
    promiseAvailableDataCache.get(key).expiration < Date.now()
  ) {
    promiseAvailableDataCache.set(key, {
      promise: getAvailableGroups(chainId, attesterName),
      expiration: Date.now() + EXPIRATION_DURATION,
    });
  }
  return await promiseAvailableDataCache.get(key).promise;
};

const getAvailableGroups = async (chainId, attesterName) => {
  let url = `${env.hydraApiUrl}/available-data/${ChainIdToName[chainId]}/${attesterName}?latest=true&isOnChain=true`;
  const availableData: AvailableData = await axios
    .get(url)
    .then((res) => res.data.items[0]);

  if (!availableData) {
    return {
      availableGroups: null,
      timestamp: null,
    };
  }

  let availableGroupsUrl = availableData.url.startsWith("http")
    ? availableData.url
    : `${env.hydraApiUrl}${availableData.url}`;

  const availableGroups: AvailableGroups | OffchainAvailableGroups = await axios
    .get(availableGroupsUrl)
    .then((res) => res.data);

  return {
    availableGroups,
    timestamp: availableData.timestamp,
  };
};

//TODO persist on indexDB
const promiseJsonTreeCache = new Map();
export const fetchJsonTree = async (treeUrl): Promise<JsonMerkleTree> => {
  if (!promiseJsonTreeCache.has(treeUrl)) {
    promiseJsonTreeCache.set(
      treeUrl,
      axios.get(
        treeUrl.startsWith("http") ? treeUrl : `${env.hydraApiUrl}${treeUrl}`
      )
    );
  }
  const { data } = await promiseJsonTreeCache.get(treeUrl);
  return data;
};

//TODO persist on indexDB
const promiseDataCache = new Map();
export const fetchDataTree = async (
  dataUrl: string
): Promise<MerkleTreeData> => {
  if (!promiseDataCache.has(dataUrl)) {
    promiseDataCache.set(
      dataUrl,
      axios.get(
        dataUrl.startsWith("http") ? dataUrl : `${env.hydraApiUrl}${dataUrl}`
      )
    );
  }
  const { data } = await promiseDataCache.get(dataUrl);
  return data;
};
