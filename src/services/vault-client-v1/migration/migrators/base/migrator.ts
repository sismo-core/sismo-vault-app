export abstract class Migrator<T> {
  public prevVersion: number;
  public currentVersion: number;
  public testedVaults: T[];

  constructor(prevVersion, currentVersion, testedVaults) {
    this.prevVersion = prevVersion;
    this.currentVersion = currentVersion;
    this.testedVaults = testedVaults;
  }

  abstract migrate(vaultPrevVersion, forceTimestamp?: number): T;
}
