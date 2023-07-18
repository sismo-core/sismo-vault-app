import { useState } from "react";
import styled from "styled-components";
import Icon from "../Icon";
import EligibleExplanationModal from "./components/EligibleExplanationModal";

const Container = styled.div`
  font-size: 12px;
  color: #d0d7fb;
  cursor: pointer;
`;

type HelpLinkSourceProps = {
  style: React.CSSProperties;
};

export default function HelpLinkSource({ style }: HelpLinkSourceProps): JSX.Element {
  const [sourceExpIsOpen, setSourceExpIsOpen] = useState(false);

  return (
    <>
      <EligibleExplanationModal
        isOpen={sourceExpIsOpen}
        onClose={() => setSourceExpIsOpen(false)}
      />
      <Container onClick={() => setSourceExpIsOpen(true)} style={style}>
        Source accounts
        <Icon
          name="question-outline-lightBlue"
          style={{ width: 18, marginBottom: -5, marginLeft: 2 }}
        />
      </Container>
    </>
  );
}
