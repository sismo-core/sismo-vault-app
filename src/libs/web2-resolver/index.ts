import { ImportedAccount } from "../vault-client-v1";
import { ProfileApiResolver, GithubApiResolver } from "./profile-api-resolvers";

type Account = Partial<ImportedAccount>;

export enum Web2IdentifierType {
  GITHUB = "0x1001",
  TWITTER = "0x1002",
  TELEGRAM = "0x1003",
}

export enum HumanReadableIdentifierType {
  GITHUB = "github",
  TWITTER = "twitter",
  TELEGRAM = "telegram",
}

export class Web2Resolver {
  private _githubResolver: ProfileApiResolver;

  constructor() {
    this._githubResolver = new GithubApiResolver({
      apiUrl: "https://api.github.com",
    });
  }

  public fromWeb2IdTypeToHumanReadable(idType: Web2IdentifierType): string {
    switch (idType) {
      case Web2IdentifierType.GITHUB:
        return HumanReadableIdentifierType.GITHUB;
      case Web2IdentifierType.TWITTER:
        return HumanReadableIdentifierType.TWITTER;
      case Web2IdentifierType.TELEGRAM:
        return HumanReadableIdentifierType.TELEGRAM;
      default:
        throw new Error("Unsupported identifier type");
    }
  }

  public fromHumanReadableToWeb2IdType(
    humanReadableIdType: HumanReadableIdentifierType
  ): Web2IdentifierType {
    switch (humanReadableIdType) {
      case HumanReadableIdentifierType.GITHUB:
        return Web2IdentifierType.GITHUB;
      case HumanReadableIdentifierType.TWITTER:
        return Web2IdentifierType.TWITTER;
      case HumanReadableIdentifierType.TELEGRAM:
        return Web2IdentifierType.TELEGRAM;
      default:
        throw new Error("Unsupported identifier type");
    }
  }

  public getIdentifierType(identifier: string): Web2IdentifierType | null {
    const profileType = identifier.split(":")[0] as HumanReadableIdentifierType;

    if (!profileType) {
      throw new Error("Web2Resolver: Invalid identifier");
    }

    return this.fromHumanReadableToWeb2IdType(profileType);
  }

  public async resolve(identifier: string): Promise<Account> {
    const identifierType = this.getIdentifierType(identifier);
    const parsedProfileId = this._parseIdFromWeb2(identifier);
    const parsedProfileHandle = this._parseHandleFromWeb2(identifier);

    let account: Account;
    switch (identifierType) {
      case Web2IdentifierType.GITHUB:
        let profile = await this._githubResolver.getProfile(
          parsedProfileHandle
        );
        account = {
          identifier: this._toSismoIdentifier({
            identifier: profile.id.toString(),
            identifierType,
          }),
          type: "github",
          profile,
        };

        break;
      case Web2IdentifierType.TWITTER:
        if (!parsedProfileId) {
          throw new Error(
            `Invalid identifier: ${identifier} - Please use the following format: ${this.fromWeb2IdTypeToHumanReadable(
              identifierType
            )}:{handle}:{id}`
          );
        }
        account = {
          identifier: this._toSismoIdentifier({
            identifier: parsedProfileId,
            identifierType,
          }),
          type: "twitter",
          profile: {
            login: parsedProfileHandle,
            id: parseInt(parsedProfileId),
            name: parsedProfileHandle,
            avatar: "",
          },
        };
        break;
      default:
        throw new Error(
          "Unsupported identifier type. Please use github, twitter or telegram."
        );
    }
    return account;
  }

  private _parseIdFromWeb2(identifier): string | null {
    const profileId = identifier.split(":")[2];
    if (!profileId) {
      return null;
    }
    return profileId;
  }

  private _parseHandleFromWeb2(identifier): string {
    const profileHandle = identifier.split(":")[1];
    return profileHandle;
  }

  private _toSismoIdentifier({
    identifier,
    identifierType,
  }: {
    identifier: string;
    identifierType: Web2IdentifierType;
  }): string {
    let prefix = identifierType;
    let suffix = "0".repeat(36 - identifier.length) + identifier;
    let id = prefix + suffix;
    return id;
  }
}
