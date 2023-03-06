import { ethers } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import env from "../../environment";

const providers = new Map();

export const getWeb3Provider = (chainId: number): Provider => {
  if (providers.has(chainId)) {
    return providers.get(chainId);
  } else {
    let _provider = null;
    if (env?.rpc[chainId]?.urlOverride) {
      _provider = new ethers.providers.JsonRpcProvider(
        env.rpc[chainId]?.urlOverride,
        chainId
      );
      providers.set(chainId, _provider);
      return _provider;
    }
    if (chainId === 31337) {
      _provider = new ethers.providers.JsonRpcProvider(
        "http://localhost:8545",
        31337
      );
      _provider.pollingInterval = 8000;
      providers.set(chainId, _provider);
      return _provider;
    }
    if (chainId === 100) {
      // _provider = new ethers.providers.WebSocketProvider(
      //   "wss://rpc.gnosischain.com/wss",
      //   100
      // );
      // "https://rpc.gnosischain.com/",
      _provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.gnosis.gateway.fm",
        100
      );
      _provider.pollingInterval = 8000;
      providers.set(chainId, _provider);

      return _provider;
    }

    if (chainId === 137) {
      _provider = new ethers.providers.JsonRpcProvider(
        "https://polygon-rpc.com",
        chainId
      );
      _provider.pollingInterval = 8000;
      providers.set(chainId, _provider);
      return _provider;
    }

    if (chainId === 80001) {
      _provider = new ethers.providers.JsonRpcProvider(
        "https://matic-mumbai.chainstacklabs.com",
        chainId
      );
      _provider.pollingInterval = 8000;
      providers.set(chainId, _provider);
      return _provider;
    }
    _provider = new ethers.providers.InfuraProvider(
      chainId,
      "6f9a75d029ce430794e3155621e2d620"
    );
    _provider.pollingInterval = 8000;
    providers.set(chainId, _provider);
    return _provider;
  }
};
