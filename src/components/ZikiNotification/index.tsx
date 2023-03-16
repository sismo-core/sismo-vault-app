import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as animationData from "./ziki-jobs.json";
import lottie, { AnimationItem } from "lottie-web";
import { X } from "phosphor-react";
import env from "../../environment";

const Container = styled.div<{ isClose: boolean }>`
  position: fixed;
  right: 80px;
  bottom: 100px;
  z-index: 100;

  box-sizing: border-box;

  @media (max-width: 1200px) {
    right: 40px;
  }

  @media (max-width: 1000px) {
    right: 20px;
  }

  transition: all 2.5s linear;
  transition-delay: 0.5s;

  ${(props) =>
    props.isClose &&
    `
        right: -500px;

        @media (max-width: 1200px) {
            right: -500px;
        }

        @media (max-width: 1000px) {
            right: -500px;
        }
    `}
`;

const Notification = styled.div<{
  color: string;
  isDisplay: boolean;
}>`
  position: relative;
  padding: 10px 27.2px 10px 23px;
  background-color: ${(props) => props.theme.colors.green1};
  border-radius: 5px;
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  box-sizing: border-box;

  ${(props) =>
    props.isDisplay
      ? `
        animation: comeFromRight 1s linear;
    `
      : `display:none;`}

  @keyframes comeFromRight {
    0% {
      transform: translate3d(340px, 0, 0);
    }
    100% {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes jump {
    0% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -30px, 0);
    }
    100% {
      transform: translate3d(0, 0, 0);
    }
  }

  @media (max-width: 800px) {
    cursor: pointer;
  }
`;

const NotificationText = styled.a`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  font-size: 14px;
  line-height: 21px;
  color: ${(props) => props.theme.colors.blue11};

  cursor: pointer;
  text-decoration: none;
`;

const Close = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 9.2px;
  height: 9.2px;
  position: absolute;
  right: 8.5px;
  top: 7.65px;
  cursor: pointer;
  @media (max-width: 800px) {
    display: none;
  }
`;

const ZikiRun = styled.div<{ isDev: boolean }>`
  width: 70px;
  height: 70px;
  position: absolute;
  top: 70px;
  right: ${(props) => (props.isDev ? "123px" : "100px")};
`;

const Bold = styled.span`
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: 16px;
  line-height: 24px;
`;

const SmallLink = styled.span`
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.semibold};
  color: ${(props) => props.theme.colors.blue8};
  text-decoration: none;
`;

const Heart = styled.span`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 13px;
  line-height: 21px;
`;

type Props = {
  onClose?: () => void;
};

export default function AlphaNotification({ onClose }: Props): JSX.Element {
  const [isDisplay, setIsDisplay] = useState(false);
  const [isClose, setIsClose] = useState(false);
  const color = "#13203D";
  const zikiRunElement = useRef<HTMLDivElement>(null);
  const lottieInstance = useRef<AnimationItem>();

  useEffect(() => {
    lottieInstance.current = lottie.loadAnimation({
      animationData,
      container: zikiRunElement.current,
      autoplay: true,
      loop: false,
    });
    setTimeout(() => {
      setIsDisplay(true);
      setTimeout(() => {
        lottieInstance.current.stop();
      }, 1000);
    }, 500);
  }, []);

  const close = () => {
    lottieInstance.current.play();
    setTimeout(() => {
      lottieInstance.current.stop();
    }, 3000);
    notificationJump();
    setIsClose(true);
    onClose && onClose();
  };

  const notificationJump = () => {
    document.getElementById("notifjobs").style.animation = "jump 0.5s";
    document.getElementById("notifjobs").style.animationDelay = "0.2s";
    setTimeout(() => {
      document.getElementById("notifjobs").style.animation = "none 0.5s";
    }, 800);
  };

  return (
    <Container isClose={isClose}>
      <Notification
        color={color}
        id="notifjobs"
        isDisplay={isDisplay}
        onClick={() => {
          window.innerWidth <= 800 && close();
        }}
      >
        {env.name === "DEMO" && (
          <NotificationText
            color={color}
            href="https://forms.gle/gYeyffjvH7kvdzbJ7"
            target="_blank"
            rel="noreferrer"
          >
            This is a demo.
            <Bold>Let us know your feedback!</Bold>
            <SmallLink>
              <Heart> 💜</Heart>
            </SmallLink>
          </NotificationText>
        )}
        {env.name === "DEV_BETA" && (
          <NotificationText
            color={color}
            href="https://builders.sismo.io/"
            target="_blank"
            rel="noreferrer"
          >
            Need help?
            <Bold>Join our Telegram group for devs!</Bold>
            <SmallLink>
              <Heart> 💜</Heart>
            </SmallLink>
          </NotificationText>
        )}
        {env.name !== "DEV_BETA" && env.name !== "DEMO" && (
          <NotificationText
            color={color}
            href="https://forms.gle/gYeyffjvH7kvdzbJ7"
            target="_blank"
            rel="noreferrer"
          >
            This is a Beta.
            <Bold>Let us know your feedback!</Bold>
            <SmallLink>
              <Heart> 💜</Heart>
            </SmallLink>
          </NotificationText>
        )}
        <Close
          onClick={(e) => {
            close();
            e.stopPropagation();
          }}
        >
          <X weight="bold" size={9.2} />
        </Close>
        <ZikiRun
          style={{ transform: isClose ? "scaleX(-1)" : "" }}
          isDev={env.name === "DEV_BETA"}
        >
          <div
            ref={zikiRunElement}
            style={{
              width: 70,
              height: 70,
            }}
          />
        </ZikiRun>
      </Notification>
    </Container>
  );
}
