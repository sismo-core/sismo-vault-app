import { AttesterRanges, Contracts, RelayerByChain } from "../..";
import { Cache } from "../../caches";
import { HydraS1 } from "./HydraS1";

export class HydraS1Accountbound extends HydraS1 {
  constructor({
    relayers,
    cache,
  }: {
    relayers?: RelayerByChain;
    cache: Cache;
  }) {
    super({
      ranges: AttesterRanges.HydraS1AccountboundAttester,
      name: "hydra-s1-accountbound",
      contract: Contracts.HydraS1AccountboundAttester,
      relayers: relayers,
      cache,
    });
  }
}
