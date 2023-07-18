import styled from "styled-components";
import Icon from "../Icon";
import colors from "../../theme/colors";
import { useNotifications } from "./provider";

const Container = styled.div`
  position: fixed;
  bottom: 60px;
  right: 60px;
  z-index: 4000;
`;

const Notification = styled.div<{ backgroundColor: string }>`
  max-width: 290px;
  min-width: 100px;
  padding: 10px 20px;
  background-color: ${(props) => props.backgroundColor};
  border-radius: 5px;
  margin-top: 10px;
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

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
`;

const NotificationText = styled.div`
  font-size: 14px;
  color: ${(props) => props.color};
  margin-left: 10px;
  padding-right: 10px;
`;

const Close = styled.div`
  position: absolute;
  right: 12px;
  cursor: pointer;
`;

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
            <Notification backgroundColor={backgroundColor} key={"notif" + notif.id}>
              {notif.type === "success" && (
                <Icon name={"confirmNotif-outline-blue"} style={{ marginTop: 5 }} />
              )}
              <NotificationText color={color}>{notif.text}</NotificationText>
              <Close onClick={() => notificationDeleted(notif.id)}>
                <Icon name={"cross-outline-blue"} />
              </Close>
            </Notification>
          );
        })}
    </Container>
  );
}
