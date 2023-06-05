import styled from "styled-components";
import { Account } from "../../libs/sismo-client";
import { ImportedAccount } from "../../libs/vault-client";
import Avatar from "../Avatar";

const Container = styled.div<{
  accountCount: number;
  size: "default" | "small";
}>`
  height: 29px;
  width: calc(29px + ${(props) => (props.accountCount - 1) * 8}px);
  position: relative;

  ${(props) =>
    props.size === "small" &&
    `
    height: 24px;
    width: calc(24px + ${(props) => (props.accountCount - 1) * 8}px);
  `}
`;

const AvatarContainer = styled.div<{ index: number; accountCount: number }>`
  right: ${(props) => (props.accountCount - 1 - props.index) * 8}px;
  position: absolute;
`;

type Props = {
  accounts: ImportedAccount[] | Account[];
  size?: "default" | "small";
};

export default function HorizontalAvatars({
  accounts,
  size = "default",
}: Props): JSX.Element {
  return (
    <Container accountCount={accounts.slice(0, 15).length} size={size}>
      {accounts
        .slice(0, 15)
        .reverse()
        .map((account, index) => {
          return (
            <AvatarContainer
              title={account.identifier}
              key={"account" + account.identifier + index}
              index={index}
              accountCount={accounts.slice(0, 15).length}
            >
              <Avatar account={account} width={size === "small" ? 22 : 27} />
            </AvatarContainer>
          );
        })}
    </Container>
  );
}
