import {
  AuthRequest,
  AuthType,
  ClaimRequest,
  ClaimType,
  SignatureRequest,
  SismoConnectRequest,
} from "../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

export const devConfig = {
  enabled: true,
  displayRawResponse: true,
  devGroups: [
    {
      groupId: "0xd138c33e8a6a450336a6c5dda990cf95",
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

export const claims: ClaimRequest[] = [
  {
    claimType: ClaimType.GTE,
    groupId: "0xd138c33e8a6a450336a6c5dda990cf95",
    groupTimestamp: "latest",
    isOptional: false,
    isSelectableByUser: true,
    value: 1,
    extraData: "",
  } as ClaimRequest,
];

export const auths: AuthRequest[] = [
  {
    authType: AuthType.VAULT,
    isAnon: false,
    userId: "0x938f169352008d35e065F153be53b3D3C07Bcd90",
    isOptional: false,
    isSelectableByUser: false,
    extraData: "",
  },
  {
    authType: AuthType.EVM_ACCOUNT,
    isAnon: false,
    userId: "0x441fB4f061bFC5f16EaF8BF932885c9711EBB1a2",
    isOptional: false,
    isSelectableByUser: true,
    extraData: "",
  },
  // {
  //   authType: AuthType.TWITTER,
  //   isAnon: false,
  //   userId: "971701818",
  //   isOptional: false,
  //   isSelectableByUser: false,
  //   extraData: "",
  // },
];

export const signature: SignatureRequest = {
  message: "0x00",
  isSelectableByUser: false,
  extraData: "",
};

export const sismoConnectRequestMock: SismoConnectRequest = {
  appId: "0x97f25a024703a13d6cf18b84639e4c02",
  namespace: "main",
  callbackPath: null,
  version: "sismo-connect-v1",
};

//const url = new URL("http://dev.vault-beta.sismo.io/connect");
const url = new URL("http://localhost:3000/connect");
const searchParams = url.searchParams;

searchParams.set("version", sismoConnectRequestMock.version);
searchParams.set("appId", sismoConnectRequestMock.appId);
searchParams.set("namespace", sismoConnectRequestMock.namespace);
searchParams.set("callbackPath", sismoConnectRequestMock.callbackPath);
searchParams.set("auths", JSON.stringify(auths));
searchParams.set("claims", JSON.stringify(claims));
//searchParams.set("signature", JSON.stringify(signature));
searchParams.set("devConfig", JSON.stringify(devConfig));

export const sismoConnectRequestMockUrl = url.toString();

export function getMockUrl() {
  console.log(sismoConnectRequestMockUrl);
}
