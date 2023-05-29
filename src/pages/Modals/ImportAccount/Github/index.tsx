import ConnectGithub from "./components/ConnectGithub";
import GenerateAccount from "./components/GenerateAccount";

type Props = {
  code?: string;
};

export default function ImportGithub({ code }: Props): JSX.Element {
  return code ? <GenerateAccount code={code} /> : <ConnectGithub />;
}
