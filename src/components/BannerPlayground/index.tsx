import styled from "styled-components";
// import { X } from "phosphor-react";
import { DateTime } from "luxon";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  width: 100%;
  background-color: ${(props) => props.theme.colors.error};

  color: ${(props) => props.theme.colors.blue10};
  font-family: ${(props) => props.theme.fonts.semibold};
  font-size: 24px;
  line-height: 28px;

  padding: 70px 20px;
  box-sizing: border-box;
`;

const InnerContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 20px;

  max-width: 1060px;
`;

const Highlighted = styled.a`
  color: white;
  text-decoration: none;
  cursor: pointer;
`;

const ReadMore = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 3.5px;
  color: ${(props) => props.theme.colors.blue8};
  font-size: 18px;
  line-height: 28px;
  text-decoration: none;
  cursor: pointer;
`;

// const XWrapper = styled.div`
//   position: absolute;
//   top: 20px;
//   right: 20px;
//   cursor: pointer;
// `;

type Props = {
  onClose: () => void;
  isOpen: boolean;
};

export default function BannerPlayground({ onClose, isOpen }: Props): JSX.Element {
  const remainingDays = DateTime.fromISO("2023-01-16").diffNow("days")?.days?.toFixed(0);

  return (
    <Container>
      {/* <XWrapper onClick={onClose}>
        <X size={24} weight="bold" />
      </XWrapper> */}

      <InnerContainer>
        <div>
          Playground will be deprecated in {remainingDays <= 0 ? 0 : remainingDays}day
          {remainingDays < 2 ? "" : "s"}.
        </div>
        <div>
          Contact the Sismo Core Team on{" "}
          <Highlighted href="https://discord.gg/sismo" target="_blank" rel="noreferrer">
            Discord
          </Highlighted>{" "}
          if you want your badge on the main app.
          <br />
          This interface and the smart contracts will be frozen and remain accessible here.{" "}
          <ReadMore
            href="https://snapshot.org/#/sismo.eth/proposal/0xcbb49810ada2ed4dab220cdc82d764862fc215b6e5990a470fb26c572830e60b"
            target="_blank"
            rel="noreferrer"
          >
            Read more{" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 6.25L13.4995 2.5005L9.75 2.5"
                stroke="#343D65"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.99805 7.00195L13.498 2.50195"
                stroke="#343D65"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.5 9V13C11.5 13.1326 11.4473 13.2598 11.3536 13.3536C11.2598 13.4473 11.1326 13.5 11 13.5H3C2.86739 13.5 2.74021 13.4473 2.64645 13.3536C2.55268 13.2598 2.5 13.1326 2.5 13V5C2.5 4.86739 2.55268 4.74021 2.64645 4.64645C2.74021 4.55268 2.86739 4.5 3 4.5H7"
                stroke="#343D65"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ReadMore>
        </div>
      </InnerContainer>
    </Container>
  );
}
