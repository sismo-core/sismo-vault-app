import axios from "axios";

export type FactoryApp = {
  creatorId: string;
  name: string;
  description: string;
  authorizedDomains: string[];
  logoUrl: string;
  id: string;
  createdAt: number;
  lastUpdatedAt: number;
};

// FactoryApiService
export class FactoryProvider {
  private factoryApiUrl: string;

  constructor({ factoryApiUrl }) {
    this.factoryApiUrl = factoryApiUrl;
  }

  public async getFactoryApp(appId: string): Promise<FactoryApp> {
    let currentSearch = "";
    if (window) currentSearch = window.location.search;

    const factoryApp = await axios
      .get(`${this.factoryApiUrl}/apps/${appId}${currentSearch}`)
      .then((res) => res.data);
    return factoryApp;
  }
}
