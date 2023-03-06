import styled from "styled-components";
import CheckedVault from "../../../components/CheckedVault";
import Logo, { LogoType } from "../../../../../../components/Logo";

const Container = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 8px;

  width: 314.01px;
`;

const TopLine = styled.div`
  display: flex;
  align-items: center;
  width: 313px;
  font-size: 12px;
  line-height: 18px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

const BlueText = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.blue4};

  &:first-child {
    margin-right: 69px;
  }
`;

const AbsoluteBlueText = styled.div`
  position: absolute;
  text-align: center;
  left: calc(-47px / 2);
  top: -44px;
  font-size: 12px;
  line-height: 18px;
  color: ${(props) => props.theme.colors.blue4};
  white-space: nowrap;
`;

const GoldenText = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.orange1};
`;

const BottomLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const CircleWrapper = styled.div`
  margin: 0 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 46.94px;
  height: 4px;
`;

const AppLogoWrapper = styled.div`
  position: relative;
  width: 47px;
  height: 47px;
`;

const AppLogoLarge = styled.img`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  width: 47px;
  height: 47px;
  object-fit: cover;
`;

type Props = {
  referrerName: string;
  logoUrl: string;
};

export default function MintSchema({
  referrerName,
  logoUrl,
}: Props): JSX.Element {
  return (
    <Container>
      <TopLine>
        <BlueText>
          Prove
          <br />
          Eligibility
        </BlueText>
        <GoldenText>
          Generate
          <br />
          ZK Proof
        </GoldenText>
      </TopLine>

      <BottomLine>
        <CheckedVault />
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 30.1 7.4"
          enableBackground="new 0 0 30.1 7.4"
          style={{ marginRight: 20, marginLeft: 20, width: 29.75 }}
        >
          <path
            fill="#E9ECFF"
            d="M30,4c0.2-0.2,0.2-0.5,0-0.7l-3.2-3.2c-0.2-0.2-0.5-0.2-0.7,0c-0.2,0.2-0.2,0.5,0,0.7l2.8,2.8l-2.8,2.8
	c-0.2,0.2-0.2,0.5,0,0.7c0.2,0.2,0.5,0.2,0.7,0L30,4z M0,4.2h29.6v-1H0V4.2z"
          />
        </svg>

        <Logo type={LogoType.PROOF} size={54.75} color={"#E2C488"} />

        <CircleWrapper>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 46.9 4"
            enableBackground="new 0 0 46.9 4"
          >
            <ellipse fill="#7C87C4" cx="0.8" cy="2" rx="0.8" ry="0.8" />
            <ellipse fill="#7C87C4" cx="11.5" cy="2" rx="1.6" ry="1.6" />
            <ellipse fill="#7C87C4" cx="23.5" cy="2" rx="2" ry="2" />
            <ellipse fill="#7C87C4" cx="35.4" cy="2" rx="1.6" ry="1.6" />
            <ellipse fill="#7C87C4" cx="46.1" cy="2" rx="0.8" ry="0.8" />
          </svg>
        </CircleWrapper>

        <AppLogoWrapper>
          <AbsoluteBlueText>
            Redirecting to
            <br />
            {referrerName}
          </AbsoluteBlueText>
          {logoUrl && (
            <AppLogoLarge src={logoUrl} alt={"badge.name"} onClick={() => {}} />
          )}
        </AppLogoWrapper>
      </BottomLine>
    </Container>
  );
}
