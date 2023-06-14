import styled, { keyframes } from "styled-components";
import { SismoConnectRequest } from "../../../libs/sismo-connect-provers";
import { CaretUp, CheckCircle } from "phosphor-react";
import colors from "../../../theme/colors";
import Toggle from "../Flow/components/Toggle";

export const SkeletonKeyframes = keyframes`
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: -200%;
  }
`;

const SkeletonColor = styled.div`
  background: linear-gradient(
    90deg,
    rgba(42, 53, 87, 0.3) 5%,
    rgba(42, 53, 87, 0.6) 25%,
    rgba(42, 53, 87, 0.3) 50%
  );
  background-size: 200% 100%;
  animation: ${SkeletonKeyframes};
  animation-duration: 1.5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  box-sizing: border-box;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding: 40px 24px;
  background: ${(props) => props.theme.colors.blue11};
  border-radius: 10px;
  z-index: 2;
  box-sizing: border-box;
`;

const Title = styled(SkeletonColor)`
  height: 20px;
  width: 300px;
  border-radius: 5px;
`;

const ContentTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

const AppLogo = styled(SkeletonColor)`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: 12px;
`;

const SecondLine = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  font-family: ${(props) => props.theme.fonts.semibold};
  color: ${(props) => props.theme.colors.blue0};
  font-size: 20px;
  line-height: 24px;
`;

const SkeletonTitle = styled(SkeletonColor)`
  height: 24px;
  width: 300px;
  border-radius: 5px;
`;

const CallToAction = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 252px;
  align-self: center;
  gap: 10px;
`;

const LinkWrapper = styled(SkeletonColor)`
  align-self: flex-end;
  width: 148px;
  height: 18px;
  border-radius: 5px;
`;

const DataRequests = styled.div`
  border: 1px solid ${(props) => props.theme.colors.blue7};
  border-radius: 6px;
  margin-bottom: 24px;
`;
const RequiredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
`;

const OptListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 0px;
`;

const Line = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0px;
`;

const Request = styled(SkeletonColor)<{ width: number }>`
  width: ${(props) => props.width}px;
  height: 24px;
  border-radius: 5px;
`;

const CheckCircleIcon = styled(CheckCircle)`
  flex-shrink: 0;
`;

const OptionalSeparator = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.colors.blue7};
`;

const ItemSeparator = styled.div`
  height: 1px;
  background: ${(props) => props.theme.colors.blue9};
`;

const OptionalWrapper = styled.div`
  padding: 0px 16px;
`;

const OptionalList = styled.div<{ isFolded: boolean }>`
  display: flex;
  flex-direction: column;
  visibility: ${(props) => (props.isFolded ? "hidden" : "visible")};
  height: ${(props) => (props.isFolded ? "0px" : "auto")};
`;

const OptionalTitle = styled.div<{ folded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue3};
  padding-top: 16px;
  padding-bottom: ${(props) => (!props.folded ? "16px" : "0px")};
`;

const CaretWrapper = styled.div<{ folded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${(props) => (props.folded ? "rotateX(0deg)" : "rotateX(180deg)")};
  cursor: pointer;
`;

const ButtonSkeleton = styled(SkeletonColor)`
  width: 252px;
  height: 40px;
  border-radius: 5px;
`;

const ImpersonatedBanner = styled(SkeletonColor)`
  width: 100%;
  height: 81px;
  padding: 12px 16px;
  border-radius: 5px;
  box-sizing: border-box;
  margin-bottom: 24px;
`;

const SignatureWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const SignatureTitle = styled(SkeletonColor)`
  width: 200px;
  height: 20px;
  border-radius: 5px;
`;
const TextArea = styled(SkeletonColor)`
  border-radius: 5px;
  height: 78px;
`;

type Props = {
  sismoConnectRequest: SismoConnectRequest;
};

export default function Skeleton({ sismoConnectRequest }: Props) {
  const requiredRequests = [];
  const optionalRequests = [];
  const isImpersonated = sismoConnectRequest?.vault?.impersonate?.length > 0;
  const isSignature = sismoConnectRequest?.signature?.message?.length > 0;

  for (const claim of sismoConnectRequest?.claims) {
    if (!claim?.isOptional) {
      requiredRequests.push(claim);
    } else {
      optionalRequests.push(claim);
    }
  }

  for (const auth of sismoConnectRequest?.auths) {
    if (!auth?.isOptional) {
      requiredRequests.push(auth);
    } else {
      optionalRequests.push(auth);
    }
  }

  return (
    <Container>
      <ContentTitle>
        <AppLogo />
        <SecondLine>
          <SkeletonTitle />
        </SecondLine>
      </ContentTitle>

      {isImpersonated && <ImpersonatedBanner />}

      <Title style={{ marginBottom: 8 }} />

      <DataRequests>
        {requiredRequests.map((request, index) => (
          <RequiredWrapper key={index + "/required"}>
            {" "}
            {index !== 0 && <ItemSeparator />}
            <Line>
              <CheckCircleIcon size={24} color={colors.blue6} />
              <Request width={320} />
            </Line>
          </RequiredWrapper>
        ))}

        {optionalRequests?.length > 0 && (
          <>
            {" "}
            <OptionalSeparator />
            <OptionalWrapper>
              <OptionalTitle folded={true} onClick={() => {}}>
                <div>Optional</div>
                <CaretWrapper folded={true}>
                  <CaretUp size={16} color={colors.blue3} />
                </CaretWrapper>
              </OptionalTitle>

              {optionalRequests.map((request, index) => (
                <OptListWrapper key={index + "/optional"}>
                  {" "}
                  {index !== 0 && <ItemSeparator />}
                  <Line key={index}>
                    <Toggle
                      isDisabled={true}
                      value={false}
                      onChange={() => {}}
                    />
                    <Request width={304} />
                  </Line>
                </OptListWrapper>
              ))}

              <OptionalList isFolded={true}></OptionalList>
            </OptionalWrapper>{" "}
          </>
        )}
      </DataRequests>

      {isSignature && (
        <SignatureWrapper>
          <SignatureTitle />
          <TextArea />
        </SignatureWrapper>
      )}

      <CallToAction>
        <LinkWrapper />
        <ButtonSkeleton />
      </CallToAction>
    </Container>
  );
}
