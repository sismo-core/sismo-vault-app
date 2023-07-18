import { BigNumber, ethers } from "ethers";
import { AuthRequest, ClaimRequest, SismoConnectResponse } from "../types";
import { isHexlify } from "./isHexlify";

export const getSismoConnectResponseBytes = (sismoConnectResponse: SismoConnectResponse) => {
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
            bool isSelectableByUser,
            uint256 userId, 
            bytes extraData
            )[] auths, 
          tuple(
            uint8 claimType, 
            bytes16 groupId, 
            bytes16 groupTimestamp, 
            bool isSelectableByUser,
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
        appId: ethers.utils.hexZeroPad(ethers.utils.hexlify(sismoConnectResponse?.appId), 16),
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
        signedMessage: sismoConnectResponse?.signedMessage
          ? isHexlify(sismoConnectResponse?.signedMessage)
            ? sismoConnectResponse?.signedMessage
            : ethers.utils.toUtf8Bytes(sismoConnectResponse?.signedMessage)
          : ethers.utils.formatBytes32String(""),

        proofs: sismoConnectResponse.proofs.map((proof) => {
          let _proof = {
            auths: [],
            claims: [],
            provingScheme: ethers.utils.hexZeroPad(
              ethers.utils.formatBytes32String(proof?.provingScheme ?? "hydra-s3.1"),
              32
            ),
            proofData: proof.proofData,
            extraData: ethers.utils.toUtf8Bytes(proof?.extraData ?? ""),
          } as any;

          if (proof.auths?.length) {
            const auths = proof?.auths?.map((auth) => {
              const authForEncoding = {
                authType: auth?.authType,
                isAnon: auth?.isAnon ?? false,
                isSelectableByUser: auth?.isSelectableByUser ?? false,
                userId: auth?.userId ?? 0,
                extraData: ethers.utils.toUtf8Bytes(auth?.extraData ?? ""),
              } as AuthRequest;

              return authForEncoding;
            });

            _proof = {
              ..._proof,
              auths: auths,
            };
          }

          if (proof.claims?.length) {
            const claims = proof?.claims?.map((claim) => {
              const claimForEncoding = {
                claimType: claim?.claimType,
                groupId: ethers.utils.hexZeroPad(
                  ethers.utils.hexlify(claim?.groupId ?? "0x00"),
                  16
                ),
                groupTimestamp:
                  proof?.claims[0]?.groupTimestamp === "latest"
                    ? BigNumber.from(ethers.utils.formatBytes32String("latest")).shr(128)
                    : proof?.claims[0]?.groupTimestamp ??
                      BigNumber.from(ethers.utils.formatBytes32String("latest")).shr(128),
                isSelectableByUser: claim?.isSelectableByUser ?? false,
                value: claim?.value ?? 1,
                extraData: ethers.utils.toUtf8Bytes(claim?.extraData ?? ""),
              } as ClaimRequest;

              return claimForEncoding;
            });

            _proof = {
              ..._proof,
              claims: claims,
            };
          }

          return _proof;
        }),
      },
    ]
  );
  return zkResponseABIEncoded;
};
