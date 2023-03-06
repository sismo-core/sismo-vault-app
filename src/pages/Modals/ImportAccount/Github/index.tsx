import ConnectGithub from "./components/ConnectGithub";
import GenerateAccount from "./components/GenerateAccount";

type Props = {
  code?: string;
  isOpen: boolean;
};

export default function ImportGithub({ code, isOpen }: Props): JSX.Element {
  return code ? (
    <GenerateAccount code={code} isOpen={isOpen} />
  ) : (
    <ConnectGithub />
  );
}
