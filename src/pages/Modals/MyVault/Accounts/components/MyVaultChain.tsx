import { useRef, useState } from "react";
import styled from "styled-components";
import env from "../../../../../environment";
import { ChainIdToLabel } from "../../../../../libs/sismo-client";
import colors from "../../../../../theme/colors";
import useOnClickOutside from "../../../../../utils/useClickOutside";
import { CaretDown } from "phosphor-react";
import Logo, { LogoType } from "../../../../../components/Logo";

const Container = styled.div`
  position: relative;
`;

const Header = styled.div<{ disabled: boolean; insideModal: boolean }>`
  ${(props) =>
    !props.disabled &&
    `
    cursor: pointer;
    background-color: ${colors.blue10}; 
  `}

  ${(props) =>
    !props.insideModal
      ? `
    height: 40px;
    width: 57.79px;
    border-radius: 5px;
    gap: 5px;
  `
      : `
      height: 20px;
      padding: 2px 3px;
    background-color: ${colors.blue9};
    border-radius: 2px;
    gap: 2px;
      `}

  display: flex;

  justify-content: center;
  align-items: center;

  position: relative;
  box-sizing: border-box;
`;

const Menu = styled.div<{ insideModal: boolean; disabled: boolean }>`
  position: absolute;
  padding: 5px;
  border-radius: 5px;
  z-index: 5;

  ${(props) =>
    !props.insideModal
      ? `
      background-color: ${props.theme.colors.blue10};
      top: 45px;
      right: 0px;
     `
      : `
      background-color: ${props.theme.colors.blue9};
      top: 26px;
      right: 0px;
      `}
`;

const CaretWrapper = styled.div<{
  isOpen: boolean;
  insideModal: boolean;
  disabled: boolean;
}>`
  display: ${(props) => (props.disabled ? "none" : "flex")};
  align-items: center;
  color: ${(props) => props.theme.colors.blue0};
  margin-top: 7px;

  ${(props) =>
    !props.insideModal
      ? `
      margin-top: 7px;
  `
      : `
      margin-top: 0px;
      `}

  transform: rotateX(${(props) => (props.isOpen ? "180deg" : "0deg")});
`;

const ChainLogo = styled(Logo)<{ isSelected?: boolean }>`
  fill: ${(props) =>
    !props.isSelected
      ? props.theme.colors.blue1
      : `${props.theme.colors.green1} !important`};
`;

const Line = styled.div<{ selected?: boolean; insideModal: boolean }>`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 5px 8px;
  border-radius: 2px;
  cursor: pointer;
  gap: 10px;
  color: ${(props) => props.theme.colors.blue1};
  &:hover {
    color: ${(props) => props.theme.colors.blue0};

    ${(props) =>
      !props.insideModal
        ? `
      background-color: ${props.theme.colors.blue8};
  `
        : `
      background-color: ${props.theme.colors.blue8};
      `}

    &:hover ${ChainLogo} {
      fill: ${(props) => props.theme.colors.blue0};
    }
  }
  transition: background-color 0.1s ease-in-out;
`;

const ChainText = styled.div`
  font-size: 16px;
  line-height: 24px;
`;

type Props = {
  chainId: number;
  chainIds?: number[];
  onChange: (chainId: number) => void;
  style?: React.CSSProperties;
  disabled: boolean;
  insideModal?: boolean;
};

export default function MyVaultChain({
  style,
  chainId,
  chainIds,
  onChange,
  disabled,
  insideModal = false,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    setIsOpen(false);
  });

  if (
    (!chainIds || chainIds?.length < 2) &&
    env.chainIds &&
    env.chainIds.length < 2
  )
    return <></>;

  return (
    <Container style={style} ref={ref}>
      <Header
        insideModal={insideModal}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {chainId < 8 && (
          <Logo type={LogoType.ETHEREUM} size={!insideModal ? 18 : 16} />
        )}
        {(chainId === 137 || chainId === 80001) && (
          <Logo type={LogoType.POLYGON} size={!insideModal ? 18 : 16} />
        )}
        {(chainId === 100 || chainId === 10200) && (
          <Logo type={LogoType.GNOSIS} size={!insideModal ? 18 : 16} />
        )}
        <CaretWrapper
          isOpen={isOpen}
          insideModal={insideModal}
          disabled={disabled}
        >
          <CaretDown size={12.3} weight="bold" />
        </CaretWrapper>
      </Header>
      {isOpen && (
        <Menu insideModal={insideModal} disabled={disabled}>
          {chainIds
            ? chainIds.map((el) => (
                <Line
                  insideModal={insideModal}
                  key={"chainSelect" + el}
                  selected={el === chainId}
                  onClick={() => {
                    if (el === chainId) {
                      setIsOpen(false);
                    } else {
                      setIsOpen(false);
                      onChange(el);
                    }
                  }}
                >
                  {el > 0 && el < 8 && (
                    <ChainLogo
                      type={LogoType.ETHEREUM}
                      size={18}
                      isSelected={el === chainId}
                    />
                  )}
                  {(el === 137 || el === 80001) && (
                    <ChainLogo
                      type={LogoType.POLYGON}
                      size={18}
                      isSelected={el === chainId}
                    />
                  )}
                  {el === 100 && (
                    <ChainLogo
                      type={LogoType.GNOSIS}
                      size={18}
                      isSelected={el === chainId}
                    />
                  )}

                  <ChainText>{ChainIdToLabel[el]}</ChainText>
                </Line>
              ))
            : env.chainIds.map((el) => (
                <Line
                  insideModal={insideModal}
                  key={"chainSelect" + el}
                  selected={el === chainId}
                  onClick={() => {
                    if (el === chainId) {
                      setIsOpen(false);
                    } else {
                      setIsOpen(false);
                      onChange(el);
                    }
                  }}
                >
                  {el > 0 && el < 8 && (
                    <ChainLogo
                      type={LogoType.ETHEREUM}
                      size={18}
                      isSelected={el === chainId}
                    />
                  )}
                  {(el === 137 || el === 80001) && (
                    <ChainLogo
                      type={LogoType.POLYGON}
                      size={18}
                      isSelected={el === chainId}
                    />
                  )}
                  {el === 100 && (
                    <ChainLogo
                      type={LogoType.GNOSIS}
                      size={18}
                      isSelected={el === chainId}
                    />
                  )}

                  <ChainText>{ChainIdToLabel[el]}</ChainText>
                </Line>
              ))}
        </Menu>
      )}
    </Container>
  );
}
