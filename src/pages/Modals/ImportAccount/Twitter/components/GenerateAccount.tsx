import { featureFlagProvider } from "../../../../../utils/featureFlags";
import styled from "styled-components";
import colors from "../../../../../theme/colors";
import { useEffect } from "react";
import { useImportAccount } from "../../provider";
import Icon from "../../../../../components/Icon";
import Button from "../../../../../components/Button";
import { useGenerateRecoveryKey } from "../../../GenerateRecoveryKey/provider";

const Content = styled.div`
  width: calc(312px - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
`;

const Header = styled.div`
  display: flex;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.blue0};
  width: 100%;

  font-size: 14px;
  line-height: 20px;
  text-align: center;
`;

const Purple = styled.span`
  color: #c08aff;
`;

const Points = styled.ul`
  font-size: 14px;
  line-height: 20px;
  padding: 0px 0px 0px 20px;
  margin: 0px;
  color: ${colors.blue0};
`;

const Point = styled.li``;

const Backup = styled.div`
  color: #b1bcf1;
  font-size: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

export interface ImportingAccount {
  isSource: boolean;
  isDestination: boolean;
  isOwner: boolean;
}

type Props = {
  oauth?: { oauthToken: string; oauthVerifier: string };
  oauthV2?: { callback: string; twitterCode: string };
  isOpen: boolean;
};

export default function GenerateAccount({
  oauth,
  oauthV2,
  isOpen,
}: Props): JSX.Element {
  const importAccount = useImportAccount();
  const generateRecoveryKey = useGenerateRecoveryKey();

  useEffect(() => {
    if (!featureFlagProvider.isTwitterV2Enabled()) return;
    if (!isOpen) {
      const url = new URL(window.location.href);
      if (url.searchParams.has("code")) {
        url.searchParams.delete("code");
        window.history.replaceState(null, "New badge details url", url);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (featureFlagProvider.isTwitterV2Enabled()) return;
    if (!isOpen) {
      const url = new URL(window.location.href);
      if (url.searchParams.has("oauth_token")) {
        url.searchParams.delete("oauth_token");
        window.history.replaceState(null, "New badge details url", url);
      }
    }
  }, [isOpen]);

  const submit = () => {
    if (featureFlagProvider.isTwitterV2Enabled()) {
      setTimeout(() => importAccount.importTwitterV2(oauthV2), 300);
    } else {
      setTimeout(() => importAccount.importTwitter(oauth), 300);
    }
    importAccount.close();
  };

  return (
    <Content>
      <Header style={{ marginBottom: 10 }}>
        <Icon
          name="logoTwitter-fill-white"
          style={{ width: 33, marginRight: 10 }}
        />
        <img
          src="/assets/import-in-vault.svg"
          alt="Importing account in the vault"
        />
        <Icon
          name="vault-outline-white"
          style={{ width: 41, marginLeft: 10 }}
        />
      </Header>
      <Title style={{ marginBottom: 20 }}>
        <p>
          Import your Twitter <br />
          <Purple>as an eligible account</Purple>
        </p>
      </Title>
      <Points style={{ marginBottom: 5 }}>
        <Point>A Twitter account can only be imported into one Vault</Point>
      </Points>
      <Backup
        style={{ marginBottom: 30 }}
        onClick={() => generateRecoveryKey.open()}
      >
        Backup my Vault
        <Icon name="arrowRight-outline-lightBlue" style={{ marginLeft: 5 }} />
      </Backup>
      <Button style={{ width: "100%" }} primary onClick={() => submit()}>
        Import
      </Button>
    </Content>
  );
}
