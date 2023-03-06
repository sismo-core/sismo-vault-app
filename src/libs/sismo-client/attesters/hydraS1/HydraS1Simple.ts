import { AttesterRanges, Contracts, RelayerByChain } from "../..";
import { Cache } from "../../caches";
import { HydraS1 } from "./HydraS1";

export class HydraS1Simple extends HydraS1 {
  constructor({ relayers, cache }: { relayers: RelayerByChain; cache: Cache }) {
    super({
      ranges: AttesterRanges.HydraS1SimpleAttester,
      name: "hydra-s1-simple",
      contract: Contracts.HydraS1SimpleAttester,
      relayers: relayers,
      cache,
    });
  }
}
