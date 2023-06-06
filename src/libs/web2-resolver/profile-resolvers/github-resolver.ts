import { Account, ProfileResolver } from "./profile-resolver";
import { OctokitResponse } from "@octokit/types";
import axios from "axios";

//api url: https://api.github.com/users/{username}

type GitHubUser = {
  login: string;
  id: number;
  name: string;
  avatar_url: string;
};

export class GithubResolver extends ProfileResolver {
  private _apiUrl: string;

  constructor({ apiUrl }: { apiUrl: string }) {
    super();
    this._apiUrl = apiUrl;
  }

  protected async _getProfile(identifier: string): Promise<Account> {
    const res = (await axios.get(
      `${this._apiUrl}/users/${identifier}`
    )) as OctokitResponse<GitHubUser>;

    const account: Account = {
      profile: {
        login: res.data.login,
        id: res.data.id,
        name: res.data.name,
        avatar: res.data.avatar_url,
      },
    };

    return account;
  }
}
