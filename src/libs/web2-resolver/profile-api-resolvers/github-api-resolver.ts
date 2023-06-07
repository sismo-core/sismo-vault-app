import { ProfileApiResolver } from "./profile-api-resolver";
import { OctokitResponse } from "@octokit/types";
import axios from "axios";
import { IndexDbCache } from "../../cache-service/indexdb-cache";
import { Profile } from "../../vault-client";

//api url: https://api.github.com/users/{username}

type GitHubUser = {
  login: string;
  id: number;
  name: string;
  avatar_url: string;
};

export class GithubApiResolver extends ProfileApiResolver {
  private _apiUrl: string;
  protected _cache: IndexDbCache;

  constructor({ apiUrl }: { apiUrl: string }) {
    super();
    this._apiUrl = apiUrl;
    this._cache = new IndexDbCache();
  }

  protected async _getProfile(identifier: string): Promise<Profile> {
    const cachedProfile = await this._cache.get(`github:${identifier}`);
    if (cachedProfile) {
      return cachedProfile;
    }

    const res = (await axios.get(
      `${this._apiUrl}/users/${identifier}`
    )) as OctokitResponse<GitHubUser>;

    const profile: Profile = {
      login: res.data.login,
      id: res.data.id,
      name: res.data.name,
      avatar: res.data.avatar_url,
    };

    await this._cache.set(`github:${identifier}`, profile);
    return profile;
  }
}
