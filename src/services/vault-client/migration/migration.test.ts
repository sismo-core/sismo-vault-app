import migration from "./migration";
import migrators from "./migrators";

describe("Migration script", () => {
  let latestVaults: any;

  beforeAll(() => {
    const maxVersion = Math.max(...migrators.map((migrator) => migrator.currentVersion));
    latestVaults = migrators.find(
      (migrator) => migrator.currentVersion === maxVersion
    ).testedVaults;
  });

  it("E2E migration test", async () => {
    for (let migrator of migrators) {
      const testedVaults = migrator.testedVaults;
      for (let i = 0; i < testedVaults.length; i++) {
        const vaultMigrated = migration(testedVaults[i], 1666532889777);
        expect(JSON.stringify(vaultMigrated)).toEqual(JSON.stringify(latestVaults[i]));
      }
    }
  });
});
