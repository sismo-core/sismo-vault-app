import * as Sentry from "@sentry/react";
import axios from "axios";
import React, { useEffect } from "react";
import env from "../../environment";
import { useVault } from "../../hooks/vault";
import packageJson from "../../../package.json";
import { getMainMinified } from "../../utils/getMain";

const COMMITMENT_MAPPER_PUBKEY = env.sismoDestination.commitmentMapperPubKey;

export default function EnvsMonitoring({
  isImpersonated,
  children,
}: {
  isImpersonated: boolean;
  children: React.ReactNode;
}): JSX.Element {
  const vault = useVault();

  useEffect(() => {
    const logEnvironment = async () => {
      (window as any).env = {
        ...env,
        //synapsPubKey: commitmentSignerSynapsPubKey,
        commitmentMapperPubKey: COMMITMENT_MAPPER_PUBKEY,
        hydraS2Version: packageJson.dependencies["@sismo-core/hydra-s2"],
        pythia1Version: packageJson.dependencies["@sismo-core/pythia-1"],
      };
    };

    logEnvironment();
  }, []);

  useEffect(() => {
    const test = async () => {
      if (env.name === "LOCAL") {
        try {
          await axios.post("http://localhost:8545", {});
        } catch (e) {
          if (e.code === "ERR_NETWORK") {
            console.error(
              `Error: Local chain not launched. Please enter "docker compose up" in your sismo-hub to launch it.`
            );
          } else {
            console.log("");
          }
        }
      }
    };
    test();
  }, []);

  useEffect(() => {
    if (!vault.importedAccounts) return;
    if (env.name === "DEMO") return;
    if (isImpersonated) return;
    const test = () => {
      for (let account of [...vault.importedAccounts]) {
        if (
          COMMITMENT_MAPPER_PUBKEY[0] !== account.commitmentMapperPubKey[0] ||
          COMMITMENT_MAPPER_PUBKEY[1] !== account.commitmentMapperPubKey[1]
        ) {
          const msg = `Error: CommitmentMapperPubKeys mismatch between env and vault ${getMainMinified(
            account
          )}\nenv pubKey = [${
            (window as any).env.commitmentMapperPubKey
          }]\nvault pubKey = [${account.commitmentMapperPubKey}]`;
          console.error(msg);
          Sentry.captureMessage(msg);
        }
      }
    };
    test();
  }, [vault.importedAccounts, isImpersonated]);

  return <div>{children}</div>;
}
