import ConnectTwitter from "./components/ConnectTwitter";
import GenerateAccount from "./components/GenerateAccount";

type Props = {
  oauth?: { oauthToken: string; oauthVerifier: string };
  oauthV2?: { callback: string; twitterCode: string };
};

export default function ImportTwitter({ oauth, oauthV2 }: Props): JSX.Element {
  const hasOAuth = oauth || oauthV2;
  return hasOAuth ? <GenerateAccount oauth={oauth} oauthV2={oauthV2} /> : <ConnectTwitter />;
}
