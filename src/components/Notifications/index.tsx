import styled from "styled-components";
import Icon from "../Icon";
import colors from "../../theme/colors";
import { useNotifications } from "./provider";
import { CircleWavyWarning } from "phosphor-react";

const Container = styled.div`
  position: fixed;
  bottom: 60px;
  right: 60px;
  z-index: 4000;
`;

const Notification = styled.div<{ backgroundColor: string; withCode: boolean }>`
  max-width: 290px;
  min-width: 100px;
  padding: 10px 25px 10px 10px;
  background-color: ${(props) => props.backgroundColor};
  border-radius: 5px;
  margin-top: 10px;
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;

  transition: all 0.3s;

  animation: comeFromRight 0.3s linear;

  @keyframes comeFromRight {
    0% {
      transform: translate3d(350px, 0, 0);
    }
    100% {
      transform: translate3d(0, 0, 0);
    }
  }
  ${(props) =>
    props.withCode &&
    `
    padding-bottom: 20px;
  `}
`;

const NotificationText = styled.div`
  font-size: 14px;
  color: ${(props) => props.color};
`;

const NotificationCode = styled.div`
  position: absolute;
  bottom: 5px;
  right: 20px;
  font-size: 9px;
  color: ${(props) => props.color};
`;

const Close = styled.div`
  position: absolute;
  right: 5px;
  top: 2px;
  cursor: pointer;
`;

const IconContainer = styled.div``;

export default function Notifications(): JSX.Element {
  const color = "#13203D";
  const { notifications, notificationDeleted } = useNotifications();

  return (
    <Container>
      {notifications &&
        notifications.map((notif) => {
          let backgroundColor = colors.success;
          if (notif.type === "error") {
            backgroundColor = colors.error;
          }
          return (
            <Notification
              backgroundColor={backgroundColor}
              key={"notif" + notif.id}
              withCode={Boolean(notif.code)}
            >
              <IconContainer>
                {notif.type === "success" && (
                  <Icon name={"confirmNotif-outline-blue"} style={{ marginTop: 5, width: 17 }} />
                )}
                {notif.type === "error" && <CircleWavyWarning size="21" color={color} />}
              </IconContainer>
              <NotificationText color={color}>{notif.text}</NotificationText>
              <NotificationCode color={color}>{notif.code}</NotificationCode>
              <Close onClick={() => notificationDeleted(notif.id)}>
                <Icon name={"cross-outline-blue"} style={{ width: 12, height: 12 }} />
              </Close>
            </Notification>
          );
        })}
    </Container>
  );
}
