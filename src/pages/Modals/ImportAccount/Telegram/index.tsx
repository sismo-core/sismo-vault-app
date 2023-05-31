import ConnectTelegram from "./components/ConnectTelegram";
import GenerateAccount from "./components/GenerateAccount";

type Props = {
  payload?: string;
};

export default function ImportTelegram({ payload }: Props): JSX.Element {
  return payload ? <GenerateAccount payload={payload} /> : <ConnectTelegram />;
}
