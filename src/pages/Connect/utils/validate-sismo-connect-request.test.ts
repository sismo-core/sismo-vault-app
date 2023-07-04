import { SismoConnectRequest } from "../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import {
  RequestValidationStatus,
  validateSismoConnectRequest,
} from "./validate-sismo-connect-request";

describe("Request validation tests", () => {
  const request: SismoConnectRequest = {
    appId: "0xdc8cf347fc27755ebab5c25ae7087b60",
    namespace: "main",
    devConfig: { enabled: true },
    callbackUrl: "http://localhost:3001/level-1-register-user",
    version: "sismo-connect-v1.1",
    claims: [
      {
        groupId: "0x1",
      },
    ],
    compressed: true,
  };

  it("Should return a status success when the version is valid", async () => {
    const requestValidation = validateSismoConnectRequest(request);
    expect(requestValidation.status).toEqual(RequestValidationStatus.Success);
  });

  it("Should return a status error when the version is invalid", async () => {
    const requestValidation = validateSismoConnectRequest({
      ...request,
      version: "sismo-connect-v20",
    });
    expect(requestValidation.status).toEqual(RequestValidationStatus.Error);
    expect(requestValidation.message).toEqual(`Invalid version query parameter: sismo-connect-v20`);
  });
});
