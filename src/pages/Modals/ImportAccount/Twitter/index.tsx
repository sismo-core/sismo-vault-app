import ConnectTwitter from "./components/ConnectTwitter";
import GenerateAccount from "./components/GenerateAccount";

type Props = {
  oauth?: { oauthToken: string; oauthVerifier: string };
  isOpen: boolean;
};

export default function ImportTwitter({ oauth, isOpen }: Props): JSX.Element {
  return oauth ? (
    <GenerateAccount oauth={oauth} isOpen={isOpen} />
  ) : (
    <ConnectTwitter />
  );
}
