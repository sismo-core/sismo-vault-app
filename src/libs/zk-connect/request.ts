import { GroupMetadata } from "../../pages/Pws";
import { ZkConnectRequest } from "./../sismo-client/provers/types";
export class ZkConnectRequestHandler {
  public zkConnectRequest: ZkConnectRequest;

  constructor(zkConnectRequest: ZkConnectRequest) {
    this.zkConnectRequest = zkConnectRequest;
  }

  // public async isVaultIdentifierRequested(): Promise<boolean> {
  //   return true;
  // }

  // public async getRequestedGroups(): Promise<GroupMetadata[]> {
  //   return ["0x1"];
  // }
}
