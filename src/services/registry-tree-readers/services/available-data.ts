import { JsonMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s2";
import axios from "axios";
import { ChainIdToName } from "../../../libs/sismo-client";
import env from "../../../environment";
import { OffchainAvailableGroups } from "../types";
import { AvailableData, AvailableGroups } from "./types";
import pako from "pako";

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
  const key = `${env.hubApiUrl}_${ChainIdToName[chainId]}_${attesterName}`;
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
  let url = `${env.hubApiUrl}/available-data/${ChainIdToName[chainId]}/${attesterName}?latest=true&isOnChain=true`;
  const availableData: AvailableData = await axios.get(url).then((res) => res.data.items[0]);

  if (!availableData) {
    return {
      availableGroups: null,
      timestamp: null,
    };
  }

  let availableGroupsUrl = availableData.url.startsWith("http")
    ? availableData.url
    : `${env.hubApiUrl}${availableData.url}`;

  const availableGroups: AvailableGroups | OffchainAvailableGroups = await axios
    .get(availableGroupsUrl)
    .then((res) => res.data);

  return {
    availableGroups,
    timestamp: availableData.timestamp,
  };
};

//TODO persist on indexDB
const promiseCompressedTreeV1Cache = new Map();
export const fetchJsonTree = async (treeUrl): Promise<JsonMerkleTree> => {
  if (!promiseCompressedTreeV1Cache.has(treeUrl)) {
    promiseCompressedTreeV1Cache.set(
      treeUrl,
      axios.get(treeUrl.startsWith("http") ? treeUrl : `${env.hubApiUrl}${treeUrl}`)
    );
  }
  const { data } = await promiseCompressedTreeV1Cache.get(treeUrl);
  return data;
};

export const fetchCompressedTreeV1 = async (treeUrl): Promise<string[][]> => {
  const res = await fetch(treeUrl.startsWith("http") ? treeUrl : `${env.hubApiUrl}${treeUrl}`);
  let rawCompressedData = await res.arrayBuffer();
  return JSON.parse(pako.inflate(rawCompressedData, { to: "string" }));
};

//TODO persist on indexDB
const promiseDataCache = new Map();
export const fetchDataTree = async (dataUrl: string): Promise<MerkleTreeData> => {
  if (!promiseDataCache.has(dataUrl)) {
    promiseDataCache.set(
      dataUrl,
      axios.get(dataUrl.startsWith("http") ? dataUrl : `${env.hubApiUrl}${dataUrl}`)
    );
  }
  const { data } = await promiseDataCache.get(dataUrl);
  return data;
};
