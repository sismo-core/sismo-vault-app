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
        "0x938f169352008d35e065F153be53b3D3C07Bcd90": 4,
        "0x35Af38bAC1793642D2fd3d71807aA54A56ed8183": 3,
        "0xEeE99560F6ccfa8e12994872725a10f80E8a4FFa": 3,
        "0x25fcc2A4B8e5387649ba3B6DeDDcAC343D8E11B6": 11,
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
    value: 3,
    extraData: "",
  } as ClaimRequest,
  {
    claimType: ClaimType.GTE,
    groupId: "0xd138c33e8a6a450336a6c5dda990cf95",
    groupTimestamp: "latest",
    isOptional: false,
    isSelectableByUser: true,
    value: 10,
    extraData: "",
  } as ClaimRequest,
  {
    claimType: ClaimType.EQ,
    groupId: "0xd138c33e8a6a450336a6c5dda990cf95",
    groupTimestamp: "latest",
    isOptional: true,
    isSelectableByUser: true,
    value: 3,
    extraData: "",
  } as ClaimRequest,
];

//0x1878EA9134D500A3cEF3E89589ECA3656EECf48f

export const auths: AuthRequest[] = [
  {
    authType: AuthType.VAULT,
    isAnon: false,
    userId: "0x938f169352008d35e065F153be53b3D3C07Bcd90",
    isOptional: false,
    isSelectableByUser: true,
    extraData: "",
  },
  {
    authType: AuthType.EVM_ACCOUNT,
    isAnon: false,
    userId: "0x25fcc2A4B8e5387649ba3B6DeDDcAC343D8E11B6",
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
  // {
  //   authType: AuthType.GITHUB,
  //   isAnon: false,
  //   userId: "124567",
  //   isOptional: false,
  //   isSelectableByUser: false,
  //   extraData: "",
  // },
  {
    authType: AuthType.EVM_ACCOUNT,
    isAnon: false,
    userId: "0x938f169352008d35e065F153be53b3D3C07Bcd90",
    isOptional: true,
    isSelectableByUser: false,
    extraData: "",
  },
  {
    authType: AuthType.EVM_ACCOUNT,
    isAnon: false,
    userId: "0x938f169352008d35e065F153be53b3D3C07Bcd90",
    isOptional: true,
    isSelectableByUser: true,
    extraData: "",
  },
  // {
  //   authType: AuthType.TWITTER,
  //   isAnon: false,
  //   userId: "971701818",
  //   isOptional: true,
  //   isSelectableByUser: false,
  //   extraData: "",
  // },
];

export const signature: SignatureRequest = {
  message:
    "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
  isSelectableByUser: true,
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
searchParams.set("signature", JSON.stringify(signature));
searchParams.set("devConfig", JSON.stringify(devConfig));

export const sismoConnectRequestMockUrl = url.toString();

export function getMockUrl() {
  console.log(sismoConnectRequestMockUrl);
}
