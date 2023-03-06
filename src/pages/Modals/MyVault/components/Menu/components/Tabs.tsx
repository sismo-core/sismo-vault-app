import styled from "styled-components";
import Icon, { IconProps } from "../../../../../../components/Icon";
import colors from "../../../../../../theme/colors";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 190px;
  position: fixed;
  margin-top: 105px;
  @media (max-width: 800px) {
    width: calc(100% - 40px);
  }
`;

const Tab = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 52px;
  padding: 0px 15px;
  box-sizing: border-box;
  font-size: 16px;
  line-height: 22px;
  display: flex;
  align-items: center;
  color: ${colors.blue0};
  border-radius: 5px;
  ${(props) =>
    props.selected &&
    `
        background-color: ${colors.blue9}; 
    `}
  @media (max-width: 800px) {
    background-color: transparent;
  }
`;

const TabLogo = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = {
  tabs: {
    id: string;
    label: string;
    icon: IconProps["name"];
  }[];
  activeTab: string;
  onSwitchTab: (tabId: string) => void;
};

export default function Tabs({
  tabs,
  onSwitchTab,
  activeTab,
}: Props): JSX.Element {
  return (
    <Container>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          onClick={() => onSwitchTab(tab.id)}
          selected={activeTab === tab.id}
        >
          <TabLogo>
            <Icon name={tab.icon} style={{ width: 16 }} />
          </TabLogo>
          {tab.label}
        </Tab>
      ))}
    </Container>
  );
}
