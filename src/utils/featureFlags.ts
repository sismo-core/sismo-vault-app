import env from "../environment";

class FeatureFlagProvider {
  isTwitterV2Enabled = (): boolean => {
    return env.featureFlags?.twitterV2 === true;
  };
  isTelegramEnabled = (): boolean => {
    return env.featureFlags?.telegram === true;
  };
}

export const featureFlagProvider = new FeatureFlagProvider();
