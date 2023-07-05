import styled from "styled-components";
import colors from "../../../../theme/colors";
import { Warning } from "phosphor-react";

const WarningWrapper = styled.div`
  flex-shrink: 0;
`;

const ImpersonatedBanner = styled.div`
  display: flex;
  gap: 12px;

  width: 100%;
  padding: 12px 16px;

  background-color: ${(props) => props.theme.colors.orange2};
  color: ${(props) => props.theme.colors.orange5};
  border-radius: 5px;
  font-size: 14px;

  box-sizing: border-box;
  margin-bottom: 24px;
`;

const ImpersonatedDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ImpersonatedTitle = styled.div`
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: 14px;
`;

const ImpersonatedText = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
`;

export default function ImpersonationBanner() {
  return (
    <ImpersonatedBanner>
      <WarningWrapper>
        <Warning size={28} color={colors.orange5} />
      </WarningWrapper>
      <ImpersonatedDescription>
        <ImpersonatedTitle>Impersonation mode</ImpersonatedTitle>
        <ImpersonatedText>
          The generated proof is based on impersonated accounts. It should not be used in
          production.
        </ImpersonatedText>
      </ImpersonatedDescription>
    </ImpersonatedBanner>
  );
}
