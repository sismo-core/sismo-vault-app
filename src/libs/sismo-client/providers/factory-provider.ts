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

export class FactoryProvider {
  private factoryApiUrl: string;

  constructor({ factoryApiUrl }) {
    this.factoryApiUrl = factoryApiUrl;
  }

  public async getFactoryApp(appId: string): Promise<FactoryApp> {
    const factoryApp = await axios
      .get(`${this.factoryApiUrl}/apps/${appId}`)
      .then((res) => res.data);
    return factoryApp;
  }
}
