import { ethers, BigNumber } from "ethers";
import { ZkConnectResponse } from "../localTypes";
import { Auth, Claim, AuthType, ClaimType } from "../localTypes";

export default function getZkConnectResponseABIEncode(
  zkConnectResponse: ZkConnectResponse
) {
  if (!zkConnectResponse) return null;

  const AbiCoder = new ethers.utils.AbiCoder();

  const zkResponseABIEncoded = AbiCoder.encode(
    [
      "tuple(bytes16 appId, bytes16 namespace, bytes32 version, tuple(tuple(bytes16 groupId, bytes16 groupTimestamp, uint256 value, uint8 claimType, bytes extraData) claim, tuple(uint8 authType, bool anonMode, uint256 userId, bytes extraData) auth, bytes signedMessage, bytes32 provingScheme,bytes proofData,bytes extraData)[] proofs) zkConnectResponse",
    ],
    [
      {
        appId: ethers.utils.hexZeroPad(
          ethers.utils.hexlify(zkConnectResponse?.appId),
          16
        ),
        namespace: ethers.utils.hexDataSlice(
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(zkConnectResponse?.namespace ?? "main")
          ),
          0,
          16
        ),
        version: ethers.utils.hexZeroPad(
          ethers.utils.formatBytes32String(zkConnectResponse?.version),
          32
        ),
        proofs: zkConnectResponse.proofs.map((proof) => {
          const claimForEncoding = {
            groupId: ethers.utils.hexZeroPad(
              ethers.utils.hexlify(proof?.claim?.groupId ?? "0x0"),
              16
            ),
            groupTimestamp:
              proof?.claim?.groupTimestamp === "latest"
                ? BigNumber.from(
                    ethers.utils.formatBytes32String("latest")
                  ).shr(128)
                : proof?.claim?.groupTimestamp,
            value: proof?.claim?.value ?? 1,
            claimType: proof?.claim?.claimType ?? ClaimType.EMPTY,
            extraData: ethers.utils.toUtf8Bytes(proof?.claim?.extraData ?? ""),
          } as Claim;

          const authForEncoding = {
            authType: proof?.auth?.authType ?? AuthType.EMPTY,
            anonMode: proof?.auth?.anonMode ?? false,
            userId: proof?.auth?.userId ?? 0,
            extraData: ethers.utils.toUtf8Bytes(proof.auth?.extraData ?? ""),
          } as Auth;

          return {
            claim: claimForEncoding,
            auth: authForEncoding,
            signedMessage: ethers.utils.toUtf8Bytes(proof?.signedMessage ?? ""),
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
}
