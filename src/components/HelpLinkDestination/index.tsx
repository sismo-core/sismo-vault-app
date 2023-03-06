import { useState } from "react";
import styled from "styled-components";
import Icon from "../Icon";
import DestinationExplanationModal from "./components/DestinationExplanationModal";

const Container = styled.div`
  font-size: 12px;
  color: #d0d7fb;
  cursor: pointer;
`;

type Props = {
  style: React.CSSProperties;
};

export default function HelpLinkDestination({ style }: Props): JSX.Element {
  const [sourceExpIsOpen, setSourceExpIsOpen] = useState(false);

  return (
    <>
      <DestinationExplanationModal
        isOpen={sourceExpIsOpen}
        onClose={() => setSourceExpIsOpen(false)}
      />
      <Container onClick={() => setSourceExpIsOpen(true)} style={style}>
        Destination accounts
        <Icon
          name="question-outline-lightBlue"
          style={{ width: 18, marginBottom: -5, marginLeft: 2 }}
        />
      </Container>
    </>
  );
}
