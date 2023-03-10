import * as Sentry from "@sentry/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import env from "../../environment";
import { useVault } from "../vault";
import packageJson from "../../../package.json";
import { getMainMinified } from "../../utils/getMain";

export default function EnvsMonitoring({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  // const [registryRoot, setRegistryRoot] = useState(null);
  const [commitmentMapperPubKey, setCommitmentMapperPubKey] = useState(null);
  const vault = useVault();

  useEffect(() => {
    const logEnvironment = async () => {
      const { data: dataMapper } = await axios.get(
        `${env.commitmentMapperUrl}/sismo-address-commitment`
      );

      setCommitmentMapperPubKey(dataMapper.commitmentMapperPubKey);
      (window as any).env = {
        ...env,
        //synapsPubKey: commitmentSignerSynapsPubKey,
        commitmentMapperPubKey: dataMapper.commitmentMapperPubKey,
        hydraS1Version: packageJson.dependencies["@sismo-core/hydra-s1"],
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
    if (!commitmentMapperPubKey) return;
    if (!vault.importedAccounts) return;
    const test = () => {
      for (let account of [...vault.importedAccounts]) {
        if (
          commitmentMapperPubKey[0] !== account.commitmentMapperPubKey[0] ||
          commitmentMapperPubKey[1] !== account.commitmentMapperPubKey[1]
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
  }, [commitmentMapperPubKey, vault.importedAccounts]);

  return <div>{children}</div>;
}
