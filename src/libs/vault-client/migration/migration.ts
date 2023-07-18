import { version } from "..";
import migrators from "./migrators";

const migration = (vault: any, forceTimestamp?: number) => {
  if (!vault) return null;
  if (!vault.version && vault.version !== 0)
    throw new Error("Vault migrate: no version number in the current vault");
  if (vault.version > version)
    throw new Error("Vault version invalid, please hard refresh the page");
  const migrator = migrators.find((migrator) => migrator.prevVersion === vault.version);
  if (!migrator) return vault;
  return migration(migrator.migrate(vault, forceTimestamp), forceTimestamp);
};

export default migration;
