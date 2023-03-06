import { V0Migrator } from "./v0/v0";
import { V1Migrator } from "./v1";
import { V2Migrator } from "./v2";
import { V3Migrator } from "./v3";
import { V4Migrator } from "./v4";

const migrators = [
  new V0Migrator(),
  new V1Migrator(),
  new V2Migrator(),
  new V3Migrator(),
  new V4Migrator(),
];

export default migrators;
