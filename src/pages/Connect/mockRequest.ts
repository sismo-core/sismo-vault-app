import {
  SismoConnectRequest,
  SismoConnectRequestContent,
  DataRequest,
  AuthType,
} from "./localTypes";

export const devConfig = {
  enabled: true,
  displayRawResponse: true,
  devGroups: [
    {
      groupId: "0x1fc668d70de74cf8c130af52182113f4",
      groupTimestamp: "latest",
      data: {
        "0x0E75b92ED9f77aC17A6e7fE6B171A3a66C6b638B": 4,
      },
    },
    // {
    //   groupId: "0x8d5e3ee2049c1c7d363ea88b2b424877",
    //   groupTimestamp: "latest",
    //   data: {
    //     "0x938f169352008d35e065F153be53b3D3C07Bcd90": 3,
    //   },
    // },
    // {
    //   groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
    //   groupTimestamp: "latest",
    //   data: {
    //     "0x938f169352008d35e065F153be53b3D3C07Bcd90": 3,

    //   },
    // },
    // {
    //   groupId: "0x682544d549b8a461d7fe3e589846bb7b",
    //   groupTimestamp: "latest",
    //   data: {
    //     "0x938f169352008d35e065F153be53b3D3C07Bcd90": 3,
    //   },
    // },
  ],
};

export const dataRequestMockError: DataRequest = {
  claimRequest: {
    groupId: "0xd138c33e8a6a450336a6c5dda990cf95",
  } as any,
  authRequest: {
    authType: AuthType.ANON,
  } as any,
};
export const dataRequestMock1: DataRequest = {
  claimRequest: {
    groupId: "0xe9ed316946d3d98dfcd829a53ec9822e",
    groupTimestamp: "latest",
    value: 1,
    claimType: 1,
    extraData: "",
  },
  authRequest: {
    authType: 4,
    anonMode: false,
    userId: "0",
    extraData: "",
  },
  messageSignatureRequest: "my custom message",
};
export const dataRequestMock2: DataRequest = {
  claimRequest: {
    groupId: "0x8d5e3ee2049c1c7d363ea88b2b424877",
    groupTimestamp: "latest",
    value: 1,
    claimType: 1,
    extraData: "",
  },
  messageSignatureRequest: "my custom message",
};
export const dataRequestMock3: DataRequest = {
  claimRequest: {
    groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
    groupTimestamp: "latest",
    value: 5,
    claimType: 3,
    extraData: "",
  },
  messageSignatureRequest: "my custom message",
};
export const dataRequestMock4: DataRequest = {
  claimRequest: {
    groupId: "0x682544d549b8a461d7fe3e589846bb7b",
    groupTimestamp: "latest",
    value: 2,
    claimType: 1,
    extraData: "",
  },
  messageSignatureRequest: "my custom message",
};

export const dataRequestMock5: DataRequest = {
  authRequest: {
    authType: 4,
    anonMode: false,
    userId: "0",
    extraData: "",
  },
  messageSignatureRequest: "my custom message",
};

export const sismoConnectRequestContentMock: SismoConnectRequestContent = {
  dataRequests: [
    dataRequestMockError,
    //dataRequestMock1,
    //dataRequestMock2,
    // dataRequestMock3,
    // dataRequestMock4,
    //  dataRequestMock5,
  ],
  operators: ["AND"],
};

export const sismoConnectRequestMock: SismoConnectRequest = {
  appId: "0x97f25a024703a13d6cf18b84639e4c02",
  namespace: "main",
  callbackPath: null,
  version: "zk-connect-v2",
};

//const url = new URL("http://dev.vault-beta.sismo.io/connect");
const url = new URL("http://localhost:3000/connect");
const searchParams = url.searchParams;
searchParams.set("version", sismoConnectRequestMock.version);
searchParams.set("appId", sismoConnectRequestMock.appId);
searchParams.set("namespace", sismoConnectRequestMock.namespace);
searchParams.set("callbackPath", sismoConnectRequestMock.callbackPath);
searchParams.set(
  "requestContent",
  JSON.stringify(sismoConnectRequestContentMock)
);
//searchParams.set("devConfig", JSON.stringify(devConfig));

export const sismoConnectRequestMockUrl = url.toString();

export function getMockUrl() {
  console.log(sismoConnectRequestMockUrl);
}
