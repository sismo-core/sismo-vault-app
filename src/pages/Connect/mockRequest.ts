import {
  AuthRequest,
  AuthType,
  ClaimRequest,
  ClaimType,
  SignatureRequest,
  SismoConnectRequest,
} from "../../libs/sismo-connect-provers/sismo-connect-prover-v1";

export const devConfig = {
  enabled: true,
  displayRawResponse: true,
  devGroups: [
    {
      groupId: "0xe9ed316946d3d98dfcd829a53ec9822e",
      groupTimestamp: "latest",
      data: {
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": 2,
        "0x938f169352008d35e065F153be53b3D3C07Bcd90": 2,
      },
    },
    {
      groupId: "0xa92d84058abdb05961ada4de0f902b0c",
      groupTimestamp: "latest",
      data: {
        "0x938f169352008d35e065F153be53b3D3C07Bcd90": 3,
      },
    },
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

export const sismoConnectRequestMock: SismoConnectRequest = {
  appId: "0x73316ca511efe1e14a63fcebdc9d8b24",
  namespace: "main",
  displayRawResponse: true,
  callbackPath: null,
  version: "sismo-connect-v1",
};

export const vault = {
  impersonate: [
    "0x938f169352008d35e065F153be53b3D3C07Bcd90",
    "github:leosayous21",
    // "github:baoufa",
    "twitter:VitalikButerin:295218901",
    // "github:DONOTEXIST_123456789",
  ],
};

export const auths: AuthRequest[] = [
  {
    authType: AuthType.GITHUB,
    isAnon: false,
    userId: "11630545",
    isOptional: false,
    isSelectableByUser: true,
    extraData: "",
  },
];

export const claims: ClaimRequest[] = [
  {
    // Sismo Contributors
    claimType: ClaimType.GTE,
    groupId: "0xe9ed316946d3d98dfcd829a53ec9822e",
    groupTimestamp: "latest",
    isOptional: false,
    isSelectableByUser: true,
    value: 2,
    extraData: "",
  } as ClaimRequest,
  {
    claimType: ClaimType.GTE,
    // twitter ethereum influencers : groupId 0xa92d84058abdb05961ada4de0f902b0c
    groupId: "0xa92d84058abdb05961ada4de0f902b0c",
    groupTimestamp: "latest",
    isOptional: false,
    isSelectableByUser: true,
    value: 2,
    extraData: "",
  } as ClaimRequest,
];

export const signature: SignatureRequest = {
  message:
    "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of usin",
  isSelectableByUser: true,
  extraData: "",
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
// searchParams.set("signature", JSON.stringify(signature));
//searchParams.set("devConfig", JSON.stringify(devConfig));
searchParams.set("vault", JSON.stringify(vault));
searchParams.set(
  "displayRawResponse",
  sismoConnectRequestMock.displayRawResponse.toString()
);

export const sismoConnectRequestMockUrl = url.toString();

export function getMockUrl() {
  // console.log(sismoConnectRequestMockUrl);
}
