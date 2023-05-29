import env from "../environment";
import { featureFlagProvider } from "./featureFlags";

const CALLBACK_SOURCE_QUERY_PARAM_NAME = "callback_source";
const SISMO_REDIRECT_URI_LOCAL_STORAGE_KEY = "sismo_redirect_uri";

export const getGitHubCallbackURL = (): string => {
  const callbackURL = new URL(`${window.location.origin}/redirect.html`);
  callbackURL.searchParams.append(CALLBACK_SOURCE_QUERY_PARAM_NAME, "github");
  return callbackURL.toString();
};

export const getTwitterCallbackURL = (): string => {
  const callbackURL = new URL(`${window.location.origin}/redirect.html`);
  callbackURL.searchParams.append(
    CALLBACK_SOURCE_QUERY_PARAM_NAME,
    featureFlagProvider.isTwitterV2Enabled() ? "twitter-v2" : "twitter-v1"
  );
  return callbackURL.toString();
};

export const goToGitHubAuth = (): void => {
  localStorage.setItem(
    SISMO_REDIRECT_URI_LOCAL_STORAGE_KEY,
    `${window.location.origin}${window.location.pathname}${window.location.search}`
  );
  const callbackURL = encodeURIComponent(getGitHubCallbackURL());
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${env.githubOauthClientId}&redirect_uri=${callbackURL}`;
};

export const goToTwitterAuth = (): void => {
  localStorage.setItem(
    SISMO_REDIRECT_URI_LOCAL_STORAGE_KEY,
    `${window.location.origin}${window.location.pathname}${window.location.search}`
  );
  const callbackURL = encodeURIComponent(getTwitterCallbackURL());
  const commitmentMapperPath = featureFlagProvider.isTwitterV2Enabled()
    ? "get-twitter-v2-url"
    : "request-twitter-token";
  window.location.href = `${env.commitmentMapperUrlV2}/${commitmentMapperPath}?oauth_callback=${callbackURL}`;
};

export const goToTelegramAuth = (): void => {
  console.log("TODO: Go to telegram auth page");
};
