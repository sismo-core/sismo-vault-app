import styled from "styled-components";
import Blockies from "react-blockies";

const OuterCircle = styled.div<{ color: string; size: number }>`
  ${(props) => `
    height: ${props.size}px;
    width: ${props.size}px;
    border-radius: ${props.size}px;
  `}

  background-color: #13203d;
  border: 1px solid ${(props) => props.color};

  display: flex;
  justify-content: center;
  align-items: center;
`;

const InnerCircle = styled.div<{ color: string; size: number }>`
  ${(props) => `
    height: ${props.size - 6}px;
    width: ${props.size - 6}px;
    border-radius: ${props.size - 6}px;
  `}
  background-color: ${(props) => props.color};
`;

const BlockiesContainer = styled.div<{ size: number }>`
  ${(props) => `
    height: ${props.size - 6}px;
    width: ${props.size - 6}px;
    border-radius: ${props.size - 6}px;
  `}
  overflow: hidden;
`;

type DestinationAvatarProps = {
  isActive?: boolean;
  address?: string | null;
  size?: "small" | "big";
};

export default function DestinationAvatar({
  isActive,
  address,
  size = "small",
}: DestinationAvatarProps): JSX.Element {
  return (
    <OuterCircle color={isActive ? "#C08AFF" : "#D0D7FB"} size={size === "small" ? 30 : 62}>
      {address ? (
        <BlockiesContainer size={size === "small" ? 30 : 62}>
          <Blockies seed={address} size={8} scale={size === "small" ? 3 : 7} />
        </BlockiesContainer>
      ) : (
        <InnerCircle color={"#D0D7FB"} size={size === "small" ? 30 : 62} />
      )}
    </OuterCircle>
  );
}
