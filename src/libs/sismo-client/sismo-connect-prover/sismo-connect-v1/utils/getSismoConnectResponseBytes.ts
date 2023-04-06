import { BigNumber, ethers } from "ethers";
import {
  AuthRequest,
  AuthType,
  ClaimRequest,
  ClaimType,
  SismoConnectResponse,
} from "../types";

export type SismoConnectProof = {
  auths?: AuthRequest[];
  claims?: ClaimRequest[];
  provingScheme: string;
  proofData: string;
  extraData: any;
};

export const getSismoConnectResponseBytes = (
  sismoConnectResponse: SismoConnectResponse
) => {
  if (!sismoConnectResponse) return null;

  const AbiCoder = new ethers.utils.AbiCoder();
  const zkResponseABIEncoded = AbiCoder.encode(
    [
      `tuple(
        bytes16 appId, 
        bytes16 namespace, 
        bytes32 version, 
        bytes signedMessage, 
        tuple(
          tuple(
            uint8 authType, 
            bool isAnon, 
            uint256 userId, 
            bytes extraData
            )[] auths, 
          tuple(
            uint8 claimType, 
            bytes16 groupId, 
            bytes16 groupTimestamp, 
            uint256 value, 
            bytes extraData
            )[] claims, 
          bytes32 provingScheme,
          bytes proofData,
          bytes extraData
        )[] proofs
      ) sismoConnectResponse`,
    ],
    [
      {
        appId: ethers.utils.hexZeroPad(
          ethers.utils.hexlify(sismoConnectResponse?.appId),
          16
        ),
        namespace: ethers.utils.hexDataSlice(
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(sismoConnectResponse?.namespace ?? "main")
          ),
          0,
          16
        ),
        version: ethers.utils.hexZeroPad(
          ethers.utils.formatBytes32String(sismoConnectResponse?.version),
          32
        ),
        signedMessage:
          sismoConnectResponse?.signedMessage ??
          ethers.utils.formatBytes32String(""), // WHAT IN CASE OF USER INPUT ?

        proofs: sismoConnectResponse.proofs.map((proof) => {
          const auths = proof.auths.map((auth) => {
            const authForEncoding = {
              authType: auth?.authType,
              isAnon: auth?.isAnon ?? false,
              userId: auth?.userId ?? 0,
              extraData: ethers.utils.toUtf8Bytes(auth?.extraData ?? ""),
            } as AuthRequest;

            return authForEncoding;
          });

          const claims = proof.claims.map((claim) => {
            const claimForEncoding = {
              claimType: claim?.claimType,
              groupId: ethers.utils.hexZeroPad(
                ethers.utils.hexlify(claim?.groupId ?? "0x00"),
                16
              ),
              groupTimestamp:
                proof?.claims[0]?.groupTimestamp === "latest"
                  ? BigNumber.from(
                      ethers.utils.formatBytes32String("latest")
                    ).shr(128)
                  : proof?.claims[0]?.groupTimestamp ??
                    BigNumber.from(
                      ethers.utils.formatBytes32String("latest")
                    ).shr(128),
              value: claim?.value ?? 1,
              extraData: ethers.utils.toUtf8Bytes(claim?.extraData ?? ""),
            } as ClaimRequest;

            return claimForEncoding;
          });

          return {
            auths,
            claims,
            provingScheme: ethers.utils.hexZeroPad(
              ethers.utils.formatBytes32String(
                proof?.provingScheme ?? "hydra-s2.1"
              ),
              32
            ),
            proofData: proof.proofData,
            extraData: ethers.utils.toUtf8Bytes(proof?.extraData ?? ""),
          };
        }),
      },
    ]
  );
  return zkResponseABIEncoded;
};
