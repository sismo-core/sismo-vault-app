import styled from "styled-components";
import Avatar from "../../../../../../components/Avatar";
import { useMainMinified } from "../../../../../../libs/wallet/hooks/useMainMinified";

const Container = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 5px;

  background-color: ${(props) => props.theme.colors.blue9};
  border-radius: 2px;
  padding: 1px 5px;
`;

const AvatarWrapper = styled.div`
  align-self: center;
`;

const AddressOrEns = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 22px;
`;

type Props = {
  destination: string;
  className?: string;
};

export default function IdentifierTag({ destination, className }: Props) {
  const { mainMinified } = useMainMinified(destination);

  return (
    <Container className={className}>
      <AvatarWrapper>
        <Avatar account={{ identifier: destination }} width={16} />
      </AvatarWrapper>
      <AddressOrEns>{mainMinified}</AddressOrEns>
    </Container>
  );
}
