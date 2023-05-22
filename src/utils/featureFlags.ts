import env from "../environment";

class FeatureFlagProvider {
  isTwitterV2Enabled = (): boolean => {
    return env.featureFlags?.twitterV2 === true;
  };
}

export const featureFlagProvider = new FeatureFlagProvider();
