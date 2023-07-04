export const getAccountTypeAppId = (accountType: string) => {
  const match = accountType.match(/sismo-connect-app\(appid=(0x[a-fA-F0-9]+)\)/i);
  if (match) {
    const appId = match[1];
    return appId;
  }
  return null;
};
