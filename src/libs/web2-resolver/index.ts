import { ImportedAccount } from "../vault-client-v1";
import { ProfileApiResolver, GithubApiResolver } from "./profile-api-resolvers";

type Account = Partial<ImportedAccount>;

export enum IdentifierType {
  GITHUB = "0x1001",
  TWITTER = "0x1002",
  TELEGRAM = "0x1003",
}

export class Web2Resolver {
  private _githubResolver: ProfileApiResolver;

  constructor() {
    this._githubResolver = new GithubApiResolver({
      apiUrl: "https://api.github.com",
    });
  }

  public async resolve(identifier: string): Promise<Account> {
    const identifierType = this.getIdentifierType(identifier);
    const parsedProfileId = this._parseIdFromWeb2(identifier);
    const parsedProfileHandle = this._parseHandleFromWeb2(identifier);

    let account: Account;
    switch (identifierType) {
      case IdentifierType.GITHUB:
        account = await this._githubResolver.getProfile(parsedProfileHandle);
        account.identifier = this._toSismoIdentifier({
          identifier: account.profile.id.toString(),
          identifierType,
        });
        account.type = "github";

        break;
      case IdentifierType.TWITTER:
        if (!parsedProfileId) {
          throw new Error(
            `Invalid identifier: ${identifier} - Please use the following format: twitter:{handle}:{id}`
          );
        }

        account = {
          identifier: this._toSismoIdentifier({
            identifier: parsedProfileId,
            identifierType,
          }),
          type: "twitter",
          profile: {
            login: parsedProfileId,
            id: parseInt(parsedProfileId),
            name: parsedProfileId,
            avatar: "",
          },
        };
        break;
      case IdentifierType.TELEGRAM:
        if (!parsedProfileId) {
          throw new Error(
            `Invalid identifier: ${identifier} - Please use the following format: telegram:{handle}:{id}`
          );
        }
        account = {
          identifier: this._toSismoIdentifier({
            identifier: parsedProfileId,
            identifierType,
          }),
          type: "telegram",
          profile: {
            login: parsedProfileId,
            id: parseInt(parsedProfileId),
            name: parsedProfileId,
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

  public getIdentifierType(identifier: string): IdentifierType {
    const profileType = identifier.split(":")[0];

    if (!profileType) {
      throw new Error("Web2Resolver: Invalid identifier");
    }

    switch (profileType) {
      case "github":
        return IdentifierType.GITHUB;
      case "twitter":
        return IdentifierType.TWITTER;
      case "telegram":
        return IdentifierType.TELEGRAM;
      default:
        throw new Error(
          "Unsupported identifier type. Please use github, twitter or telegram."
        );
    }
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
    identifierType: IdentifierType;
  }): string {
    let prefix = identifierType;
    let suffix = "0".repeat(36 - identifier.length) + identifier;
    let id = prefix + suffix;
    return id;
  }
}
