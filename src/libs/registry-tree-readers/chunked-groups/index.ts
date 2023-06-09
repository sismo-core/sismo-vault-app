import { Cache } from "../../cache-service";
import { MerkleTreeData } from "@sismo-core/hydra-s2";
import { fetchDataTree } from "../services/available-data";

export class ChunkedGroups {
  private cache: Cache;

  constructor({ cache }: { cache: Cache }) {
    this.cache = cache;
  }

  public async get(url: string): Promise<MerkleTreeData> {
    let data = await this.cache.get(url);
    if (!data) {
      data = await fetchDataTree(url);
      this.cache.set(url, data);
    }
    return data;
  }
}
