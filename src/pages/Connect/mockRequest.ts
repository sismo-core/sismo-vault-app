import {
  ZkConnectRequest,
  ZkConnectRequestContent,
  DataRequest,
} from "./localTypes";

export const devConfig = {
  enabled: true,
  modalOutput: "typescript",
  devGroups: [
    {
      groupId: "0xe9ed316946d3d98dfcd829a53ec9822e",
      groupTimestamp: "latest",
      data: {
        "0x938f169352008d35e065F153be53b3D3C07Bcd90": 4,
      },
    },
    {
      groupId: "0x8d5e3ee2049c1c7d363ea88b2b424877",
      groupTimestamp: "latest",
      data: {
        "0x938f169352008d35e065F153be53b3D3C07Bcd90": 3,
      },
    },
  ],
};

export const dataRequestMock1: DataRequest = {
  claimRequest: {
    groupId: "0xe9ed316946d3d98dfcd829a53ec9822e",
    groupTimestamp: "latest",
    value: 1,
    claimType: 1,
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
// export const dataRequestMock3: DataRequest = {
//   claimRequest: {
//     groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
//     groupTimestamp: "latest",
//     value: 5,
//     claimType: 2,
//     extraData: "",
//   },
//   messageSignatureRequest: "my custom message",
// };
// export const dataRequestMock4: DataRequest = {
//   claimRequest: {
//     groupId: "0x682544d549b8a461d7fe3e589846bb7b",
//     groupTimestamp: "latest",
//     value: 2,
//     claimType: 1,
//     extraData: "",
//   },
//   messageSignatureRequest: "my custom message",
// };

export const zkConnectRequestContentMock: ZkConnectRequestContent = {
  dataRequests: [
    dataRequestMock1,
    dataRequestMock2,
    // dataRequestMock3,
    // dataRequestMock4,
  ],
  operators: ["AND"],
};

export const zkConnectRequestMock: ZkConnectRequest = {
  appId: "0x37bb3224298ac0e3ac3cb78a1caa292b",
  namespace: "main",
  callbackPath: null,
  version: "zk-connect-v2",
};

const url = new URL("http://localhost:3000/connect");
const searchParams = url.searchParams;
searchParams.set("version", zkConnectRequestMock.version);
searchParams.set("appId", zkConnectRequestMock.appId);
searchParams.set("namespace", zkConnectRequestMock.namespace);
searchParams.set("callbackPath", zkConnectRequestMock.callbackPath);
searchParams.set("requestContent", JSON.stringify(zkConnectRequestContentMock));
searchParams.set("devConfig", JSON.stringify(devConfig));

export const zkConnectRequestMockUrl = url.toString();

export function getMockUrl() {
  console.log(zkConnectRequestMockUrl);
}
