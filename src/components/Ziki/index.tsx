type ZikiProps = {
  style?: React.CSSProperties;
  name:
    | "ziki1"
    | "ziki2"
    | "ziki3"
    | "ziki4"
    | "ziki5"
    | "ziki6"
    | "ziki7"
    | "ziki8"
    | "ziki15"
    | "zikiEth"
    | "zikiInfo";
};

const fileName = {
  ziki1: "ziki1.svg",
  ziki2: "ziki2.svg",
  ziki3: "ziki3.svg",
  ziki4: "ziki4.svg",
  ziki5: "ziki5.svg",
  ziki6: "ziki6.svg",
  ziki7: "ziki7.svg",
  ziki8: "ziki8.svg",
  ziki15: "ziki15.svg",
  zikiEth: "ziki-eth.svg",
  zikiInfo: "ziki-info.svg",
};

//ziki ziki ziki ziki ziki ziki ziki ziki ziki ziki ziki ziki

export default function Ziki({ style, name }: ZikiProps): JSX.Element {
  return <img src={`/zikies/${fileName[name]}`} style={style} alt={name} />;
}
