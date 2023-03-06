import styled from "styled-components";
import { Check } from "phosphor-react";
import colors from "../../../../theme/colors";

const VaultIconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 52px;
  height: 45px;
`;

const VaultIcon = styled.img`
  width: 45px;
  height: 45px;
`;

const CheckWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;

  bottom: 0;
  right: 0;

  justify-content: center;
  background-color: ${(props) => props.theme.colors.green1};
  border-radius: 50%;
  width: 24px;
  height: 24px;
`;

type Props = {
  style?: React.CSSProperties;
};

export default function CheckedVault({ style }: Props): JSX.Element {
  return (
    <VaultIconWrapper style={style}>
      <VaultIcon src="/assets/sismo-vault-v2.svg" alt="vault" />
      <CheckWrapper>
        <Check size={12.73} weight="bold" color={colors.blue10} />
      </CheckWrapper>
    </VaultIconWrapper>
  );
}
