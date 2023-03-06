export type AccountType = "ethereum" | "github" | "twitter";
export type Network = "goerli" | "polygon" | "mumbai" | "gnosis";

export type Filters = {
  chainIds?: number[];
  collectionIds?: number[];
  curated?: boolean;
  status?: {
    eligible: boolean;
    notEligible: boolean;
    minted: boolean;
    upgradable: boolean;
  };
  searchValue?: string;
};

export type OrderBy = {
  field: string;
  direction: "none" | "asc" | "desc";
};

export type SortParameters = {
  filters?: Filters;
  orderBy?: OrderBy;
};

export type Account = {
  identifier: string;
};

export const enum FilterField {
  COLLECTION_ID = "collectionId",
  NAME = "name",
  HOLDERS = "holders",
  PRIVACY = "PRIVACY",
  TRUSTLESSNESS = "TRUSTLESSNESS",
  SYBIL_RESISTANCE = "SYBIL_RESISTANCE",
  ELIGIBILITY = "eligibility",
}

export const enum BadgeAttribute {
  PRIVACY = "PRIVACY",
  TRUSTLESSNESS = "TRUSTLESSNESS",
  SYBIL_RESISTANCE = "SYBIL_RESISTANCE",
}

export const enum BadgeAttributeValue {
  VERY_HIGH = "Very High",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export interface Badge {
  collectionId: number;
  networks: Network[];
  name: string;
  description: string;
  attributes: {
    trait_type: BadgeAttribute;
    value: BadgeAttributeValue;
  }[];
  eligibility: {
    shortDescription: string;
    specification: string;
  };
  image: string;
  publicContacts: {
    contact: string;
    type: AccountType;
  }[];
  links: {
    label: string;
    logoUrl: string;
    url: string;
  }[];
  path: string;
  group: {
    name: string;
    accountTypes: AccountType[];
    lastGeneratedAt: number;
    dataUrl: string;
    groupGenerator: {
      name: string;
      frequency: string;
      lastGeneratedAt: number;
    };
    stats: {
      totalAccounts: number;
      totalAccountsByLevel: {
        [level: number]: number;
      };
    };
  };
  stats: {
    totalHolders: number;
    totalHoldersByChain: {
      [network: string]: number;
    };
  };
}

export type MintedBadge = {
  badge: Badge;
  owner: Account;
  network: Network;
  value: string;
};

export type EligibleBadge = {
  badge: Badge;
  source: Account;
  networks: Network[];
  value: string;
};

export type SeedsById = {
  collectionId: number;
  seeds: string[];
};

export type UserBadge = {
  metadata: Badge;
  mintedInfo: {
    mintedOwner: Account;
    mintedNetwork: Network;
    mintedValue: string;
  }[];
  eligibility: {
    eligibleSource: Account;
    eligibleNetworks: Network[];
    eligibleValue: string;
  }[];
};
