import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import type {
  ConnectOptions,
  DisconnectOptions,
  WalletState,
  ConnectedChain,
} from "@web3-onboard/core";
import walletConnectModule from "@web3-onboard/walletconnect";
import { useCallback, useEffect, useMemo, useState } from "react";
import { logo, icon } from "../assets/onboardAssets";
import { SupportedChainId } from "../../sismo-client";
import { getMinimalEns } from "../../../utils/getMinimalEns";
import { getMinimalIdentifier } from "../../../utils/getMinimalIdentifier";
import { Ens } from "../../sismo-client";
import { ethers } from "ethers";

const walletConnect = walletConnectModule();

const injected = injectedModule();

const web3Onboard = Onboard({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: "0x7A69",
      token: "ETH",
      label: "Local",
      rpcUrl: "http://localhost:8545",
    },
    {
      id: "0x5",
      token: "rETH",
      label: "Ethereum Goerli Testnet",
      rpcUrl: "https://goerli.infura.io/v3/6f9a75d029ce430794e3155621e2d620",
    },
    {
      id: "0x89",
      token: "MATIC",
      label: "Polygon Mainnet",
      rpcUrl: " https://polygon-rpc.com",
    },
  ],
  appMetadata: {
    name: "Sismo",
    icon: icon,
    logo: logo,
    description: "Curate your identities with privacy",
    recommendedInjectedWallets: [
      //  { name: "MetaMask", url: "https://metamask.io" },
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "Rabby", url: "https://rabby.io/" },
    ],
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});

export type OnboardHook = {
  isConnected: boolean;
  connected: WalletState | null;
  connecting: boolean;
  connect: (options: ConnectOptions) => Promise<WalletState>;
  disconnect: (options: DisconnectOptions) => Promise<void>;
  connectedList: WalletState[];
  activeAddress: string | undefined;
  activeMainMinified: string;
  chainId: number | null;
  setChain: (chainId: SupportedChainId) => Promise<void>;
  isInjectedWallet: boolean;
  getWalletConnectName: () => string;
  getEns: (address: string) => Promise<Ens>;
  resolveEns: (ens: string) => Promise<string>;
};

const EnsCache = {};

export const useOnboard = (): OnboardHook => {
  //const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [wallet, setConnectedWallet] = useState<WalletState>(null);
  const [connecting, setConnecting] = useState(false);
  const [wallets, setConnectedWallets] = useState<WalletState[]>(
    () => web3Onboard.state.get().wallets
  );

  const [connectedChain, setConnectedChain] = useState<ConnectedChain | null>(
    () => {
      const initialWallets = web3Onboard.state.get().wallets;
      if (initialWallets.length === 0) return null;
      return initialWallets[0].chains[0] || null;
    }
  );

  const [activeMainMinified, setActiveMainMinified] = useState(null);

  const mainnetProvider = useMemo(
    () =>
      new ethers.providers.InfuraProvider(
        1,
        "6f9a75d029ce430794e3155621e2d620"
      ),
    []
  );

  const getEns = useCallback(
    async (address) => {
      try {
        if (!mainnetProvider) return null;
        if (EnsCache[address]) {
          return EnsCache[address];
        }
        const name = await mainnetProvider.lookupAddress(address);
        let ens = null;
        if (name) {
          ens = {
            name,
          };
          EnsCache[address] = ens;
        }
        return ens;
      } catch (e) {
        return null;
      }
    },
    [mainnetProvider]
  );

  const resolveEns = useCallback(
    async (ens) => {
      try {
        if (!mainnetProvider) return null;
        if (EnsCache[ens]) {
          return EnsCache[ens];
        }
        const res = await mainnetProvider.resolveName(ens);
        EnsCache[ens] = res;
        return res;
      } catch (e) {
        return null;
      }
    },
    [mainnetProvider]
  );

  useEffect(() => {
    const subscription = web3Onboard.state
      .select("wallets")
      .subscribe((wallets) => {
        const _wallet = wallets[0];
        _wallet && setConnectedChain(_wallet.chains[0]);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const wallets$ = web3Onboard.state.select("wallets");
    const subscription = wallets$.subscribe(setConnectedWallets);
    return () => subscription.unsubscribe();
  }, []);

  const updateActiveMain = useCallback(
    async (address) => {
      setActiveMainMinified(getMinimalIdentifier(address));
      const res = await getEns(address);
      if (res && res.name) {
        setActiveMainMinified(getMinimalEns(res.name));
      }
    },
    [getEns]
  );

  useEffect(() => {
    if (wallet?.accounts[0] && wallet?.accounts[0].address) {
      updateActiveMain(wallet?.accounts[0].address);
    } else {
      setActiveMainMinified(null);
    }
  }, [wallet?.accounts, updateActiveMain]);

  useEffect(() => {
    const subscription = web3Onboard.state
      .select("wallets")
      .subscribe((wallets) => {
        if (!wallet) return;
        const updatedWallet = wallets.find(
          ({ label }) => label === wallet.label
        );
        updatedWallet && setConnectedWallet(updatedWallet);
      });
    return () => subscription.unsubscribe();
  }, [wallet]);

  const connect = useCallback(async (options) => {
    setConnecting(true);
    const [connectedWallet] = await web3Onboard.connectWallet(options);
    setConnecting(false);
    setConnectedWallet(connectedWallet || null);
    return connectedWallet;
  }, []);

  const disconnect = useCallback(async ({ label }) => {
    setConnecting(true);
    if (web3Onboard) await web3Onboard.disconnectWallet({ label });
    setConnectedWallet(null);
    setConnecting(false);
  }, []);

  const setChain = async (chainId: SupportedChainId) => {
    if (!wallet) return;
    let _chainId;
    if (chainId === 5) {
      _chainId = "0x5";
    }
    if (chainId === 137) {
      _chainId = "0x89";
    }
    if (chainId === 31337) {
      _chainId = "0x7A69";
    }
    await web3Onboard.setChain({
      chainId: _chainId,
    });
  };

  const getWalletConnectName = () => {
    const walletConnectStorage = (window as any).localStorage.getItem(
      "walletconnect"
    );
    if (!walletConnectStorage) return "WalletConnect";
    const walletConnect = JSON.parse(walletConnectStorage);
    return walletConnect.peerMeta.name;
  };

  return {
    isConnected: Boolean(wallets.length > 0),
    connected: wallet,
    getEns,
    connecting,
    connect,
    disconnect,
    connectedList: wallets,
    activeAddress: wallet?.accounts[0].address.toLowerCase(),
    activeMainMinified,
    chainId: connectedChain && parseInt(connectedChain.id, 16),
    setChain,
    isInjectedWallet: wallet && wallet.label !== "WalletConnect",
    getWalletConnectName,
    resolveEns,
  };
};
