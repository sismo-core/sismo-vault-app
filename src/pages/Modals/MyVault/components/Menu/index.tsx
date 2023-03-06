import styled from "styled-components";
import Icon, { IconProps } from "../../../../../components/Icon";
import Tabs from "./components/Tabs";

const Container = styled.div<{ visible: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 190px;
  @media (max-width: 800px) {
    display: fixed;
    width: 100vw;
    padding: 10px;
    ${(props) =>
      !props.visible &&
      `
            display: none;
        `}
    margin-top: 50px;
  }
`;

const Title = styled.div`
  font-size: 20px;
  line-height: 150%;
  color: #e9ecff;
  display: flex;
  align-items: center;
  height: 75px;
  box-sizing: border-box;
  padding: 10px;
  position: fixed;
  @media (max-width: 800px) {
    width: calc(100% - 40px);
    box-sizing: border-box;
    justify-content: center;
  }
`;

type Props = {
  tabs: {
    id: string;
    label: string;
    icon: IconProps["name"];
  }[];
  visible: boolean;
  activeTab: string;
  onSwitchTab: (tabId: string) => void;
};

export default function Menu({
  visible,
  tabs,
  activeTab,
  onSwitchTab,
}: Props): JSX.Element {
  return (
    <Container visible={visible}>
      <Title>
        <Icon
          name="vault-outline-white"
          style={{ width: 40, marginRight: 15 }}
        />
        Vault
      </Title>
      <Tabs tabs={tabs} onSwitchTab={onSwitchTab} activeTab={activeTab} />
    </Container>
  );
}
