import { isValidEns } from "../../utils/regex";
import { ImportedAccount } from "../vault-client-v1";
import {
  SismoIdentifierApiResolver,
  HubApiResolver,
} from "./sismo-identifier-api-resolvers";

type Account = Partial<ImportedAccount>;

export enum AccountIdentifierType {
  ENS_NAME = "0x1000",
  GITHUB = "0x1001",
  TWITTER = "0x1002",
  TELEGRAM = "0x1003",
}

export enum HumanReadableIdentifierType {
  ENS_NAME = "ens_name",
  GITHUB = "github",
  TWITTER = "twitter",
  TELEGRAM = "telegram",
}

export class AccountResolver {
  private _hubResolver: SismoIdentifierApiResolver;

  constructor() {
    this._hubResolver = new HubApiResolver({
      apiUrl: "https://hub.sismo.io",
    });
  }

  public fromAccountIdTypeToHumanReadable(
    idType: AccountIdentifierType
  ): string {
    switch (idType) {
      case AccountIdentifierType.ENS_NAME:
        return HumanReadableIdentifierType.ENS_NAME;
      case AccountIdentifierType.GITHUB:
        return HumanReadableIdentifierType.GITHUB;
      case AccountIdentifierType.TWITTER:
        return HumanReadableIdentifierType.TWITTER;
      case AccountIdentifierType.TELEGRAM:
        return HumanReadableIdentifierType.TELEGRAM;
      default:
        throw new Error("Invalid identifier: Unsupported identifier type");
    }
  }

  public fromHumanReadableToAccountIdType(
    humanReadableIdType: HumanReadableIdentifierType
  ): AccountIdentifierType {
    switch (humanReadableIdType) {
      case HumanReadableIdentifierType.ENS_NAME:
        return AccountIdentifierType.ENS_NAME;
      case HumanReadableIdentifierType.GITHUB:
        return AccountIdentifierType.GITHUB;
      case HumanReadableIdentifierType.TWITTER:
        return AccountIdentifierType.TWITTER;
      case HumanReadableIdentifierType.TELEGRAM:
        return AccountIdentifierType.TELEGRAM;
      default:
        throw new Error("Invalid identifier: Unsupported identifier type");
    }
  }

  public getIdentifierType(identifier: string): AccountIdentifierType | null {
    const profileType = identifier.split(":")[0] as HumanReadableIdentifierType;

    if (!profileType) {
      throw new Error("AccountResolver: Invalid identifier");
    }

    if (isValidEns(profileType)) {
      return AccountIdentifierType.ENS_NAME;
    }
    return this.fromHumanReadableToAccountIdType(profileType);
  }

  public async resolve(identifier: string): Promise<Account> {
    const identifierType = this.getIdentifierType(identifier);
    let account: Account;

    switch (identifierType) {
      case AccountIdentifierType.ENS_NAME:
        let sismoIdentifierFromHub = await this._hubResolver.getSismoIdentifier(
          identifier
        );
        if (!sismoIdentifierFromHub) {
          throw new Error(
            `Invalid identifier: ${identifier} - unable to resolve your ENS profile`
          );
        }
        account = {
          identifier: sismoIdentifierFromHub?.toLowerCase(),
          type: "ethereum",
          ens: {
            name: identifier,
          },
        };
        break;

      default:
        let sismoIdentifier = await this._hubResolver.getSismoIdentifier(
          identifier
        );
        if (!sismoIdentifier) {
          throw new Error(
            `Invalid identifier: ${identifier} - unable to resolve your web2 profile`
          );
        }
        account = {
          identifier: sismoIdentifier,
          profile: {
            id: 0,
            name: identifier?.split(":")?.[1] || "",
            login: identifier?.split(":")?.[1] || "",
            avatar: "",
          },
          type: this.fromAccountIdTypeToHumanReadable(identifierType),
        };
    }
    return account;
  }
}
