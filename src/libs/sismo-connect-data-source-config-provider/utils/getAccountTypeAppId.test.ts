import { getAccountTypeAppId } from "./getAccountTypeAppId";

describe("getAccountTypeAppId", () => {
  it("should return appId when accountType matches the pattern", () => {
    const accountType = "sismo-connect-app(appid=0x1234567890abcdef)";
    const expectedAppId = "0x1234567890abcdef";

    const result = getAccountTypeAppId(accountType);

    expect(result).toEqual(expectedAppId);
  });

  it("should return null when accountType does not match the pattern", () => {
    const accountType = "invalid-account-type";

    const result = getAccountTypeAppId(accountType);

    expect(result).toBeNull();
  });

  it("should be case insensitive", () => {
    const accountType = "SISMO-CONNECT-APP(APPID=0XABCDEF1234567890)";
    const expectedAppId = "0XABCDEF1234567890";

    const result = getAccountTypeAppId(accountType);

    expect(result).toEqual(expectedAppId);
  });
});
