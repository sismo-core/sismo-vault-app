import { VaultProvider } from ".";
import { LocalStore } from "../stores/local-store";

describe("Vault provider", () => {
  let provider: VaultProvider;
  let vault: string;
  let seed: string;

  beforeAll(() => {
    const localStore = new LocalStore();
    provider = new VaultProvider({
      store: localStore,
    });
    vault = "This is my personal secret";
    seed = "0x123456";
  });

  it("Should add data in the vault", async () => {
    await provider.post(seed, vault, 1);
  });

  it("Should retrieve an encrypted data in the vault", async () => {
    const res = await provider.get(seed);
    expect(res).toEqual(vault);
  });

  it("Should return null with a random seed", async () => {
    const randomSeed = "0x111111111";
    const vault = await provider.get(randomSeed);
    expect(vault).toBeNull();
  });
});
