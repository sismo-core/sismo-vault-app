import * as Sentry from "@sentry/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import env from "../../environment";
import { useVault } from "../vault";
import packageJson from "../../../package.json";
import {
  ChainIdToName,
  HydraS1AccountboundAttesterContract,
} from "../sismo-client";
import { getWeb3Provider } from "../web3-providers";
import { getMainMinified } from "../../utils/getMain";

export default function EnvsMonitoring({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [registryRoot, setRegistryRoot] = useState(null);
  const [commitmentMapperPubKey, setCommitmentMapperPubKey] = useState(null);
  const vault = useVault();

  useEffect(() => {
    const logEnvironment = async () => {
      const { data: dataMapper } = await axios.get(
        `${env.commitmentMapperUrl}/sismo-address-commitment`
      );
      /*
      const { data: dataSigner } = await axios.get(
        `${env.synapsApiUrl}/get-public-key`
      );
      const commitmentSignerSynapsPubKey = dataSigner.commitmentSignerPubKey;
      */
      setCommitmentMapperPubKey(dataMapper.commitmentMapperPubKey);
      (window as any).env = {
        ...env,
        //synapsPubKey: commitmentSignerSynapsPubKey,
        commitmentMapperPubKey: dataMapper.commitmentMapperPubKey,
        hydraS1Version: packageJson.dependencies["@sismo-core/hydra-s1"],
        pythia1Version: packageJson.dependencies["@sismo-core/pythia-1"],
      };

      let _registryRoot = {};
      let availableData = {};
      for (let chainId of env.chainIds) {
        let url = `${env.hydraApiUrl}/available-data/${ChainIdToName[chainId]}/hydra-s1-accountbound?latest=true&isOnChain=true`;
        const { data: availableData } = await axios.get(url);
        if (env.name === "LOCAL" && availableData.items.length === 0) {
          console.error(
            `Error: No available data found. Please follow https://docs.sismo.io/sismo-docs/devs-tutorials/create-your-zk-badge-in-15-minutes to see how to resolve this.`
          );
        }
        _registryRoot[chainId] = availableData.items[0]
          ? availableData.items[0].identifier
          : null;
        availableData[chainId] = {
          transactionHash: availableData.items[0]
            ? availableData.items[0].transactionHash
            : null,
          registryRoot: availableData.items[0]
            ? availableData.items[0].identifier
            : null,
        };
      }
      setRegistryRoot(_registryRoot);

      (window as any).env = {
        ...(window as any).env,
        availableData: availableData,
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
    if (!registryRoot) return;
    const test = async (chainId: number) => {
      try {
        const contract = new HydraS1AccountboundAttesterContract({
          chainId,
          signerOrProvider: getWeb3Provider(chainId),
        });
        const isAvailable = await contract.isRootAvailableForAttester(
          registryRoot[chainId]
        );
        if (!isAvailable) {
          const msg = `Error: RegistryRoot ${registryRoot[chainId]} not available in the attester chainId ${chainId}`;
          if (chainId === 31337) {
            console.error(
              `${msg}. Please follow https://docs.sismo.io/sismo-docs/devs-tutorials/create-your-zk-badge-in-15-minutes to see how to resolve this.`
            );
          } else {
            console.error(msg);
            Sentry.captureMessage(msg);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    for (const chainId of env.chainIds) {
      test(chainId);
    }
  }, [registryRoot]);

  useEffect(() => {
    if (!commitmentMapperPubKey) return;
    const test = async (chainId: number) => {
      try {
        const contract = new HydraS1AccountboundAttesterContract({
          chainId,
          signerOrProvider: getWeb3Provider(chainId),
        });
        const pubKey = await contract.getCommitmentMapperPubKey();
        if (!pubKey) {
          const msg = `Error: No pubKey on Commitment Mapper Registry chainId ${chainId}`;
          console.error(msg);
          Sentry.captureMessage(msg);
          return;
        }
        if (
          !pubKey[0].eq(commitmentMapperPubKey[0]) ||
          !pubKey[1].eq(commitmentMapperPubKey[1])
        ) {
          const msg = `Error: CommitmentMapperPubKeys mismatch between env and attester chainId ${chainId}\nenv pubKey = [${
            (window as any).env.commitmentMapperPubKey
          }] \nattester pubKey = [${pubKey[0].toHexString()}${pubKey[0].toHexString()}]`;
          console.error(msg);
          Sentry.captureMessage(msg);
        }
      } catch (e) {
        console.error(e);
      }
    };
    for (const chainId of env.chainIds) {
      test(chainId);
    }
  }, [commitmentMapperPubKey]);

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
