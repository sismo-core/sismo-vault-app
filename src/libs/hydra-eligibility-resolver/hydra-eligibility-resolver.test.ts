import { DevRegistryTreeReader } from "../registry-tree-readers/dev-registry-tree-reader";
import { DevGroup } from "../sismo-connect-provers";
import { HydraEligibilityResolver } from "./hydra-eligibility-resolver";

describe("Hydra Eligibility resolver", () => {
  let hydraEligibilityResolver: HydraEligibilityResolver;
  let devGroup: DevGroup;

  beforeAll(() => {
    devGroup = {
      groupId: "0x0",
      groupTimestamp: "latest",
      data: {
        "0x1": 1,
        "0x2": 2,
        "0x3": 3,
        "0x4": 4,
      },
    };
  });

  beforeEach(() => {
    const registryTreeReader = new DevRegistryTreeReader({ devGroups: [devGroup] });
    hydraEligibilityResolver = new HydraEligibilityResolver({ registryTreeReader });
  });

  it("Should retrieve the value of the corresponding identifier", async () => {
    expect(
      await hydraEligibilityResolver.getEligibleValue({ identifier: "0x1", groupId: "0x0" })
    ).toEqual("1");
    expect(
      await hydraEligibilityResolver.getEligibleValue({ identifier: "0x2", groupId: "0x0" })
    ).toEqual("2");
    expect(
      await hydraEligibilityResolver.getEligibleValue({ identifier: "0x3", groupId: "0x0" })
    ).toEqual("3");
    expect(
      await hydraEligibilityResolver.getEligibleValue({ identifier: "0x4", groupId: "0x0" })
    ).toEqual("4");
  });

  it("Should return null if the identifier is not in the group", async () => {
    expect(
      await hydraEligibilityResolver.getEligibleValue({ identifier: "0x5", groupId: "0x0" })
    ).toEqual(null);
  });
});
