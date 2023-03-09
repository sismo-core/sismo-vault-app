export const overrideEligibleGroupDataFormatter = (
  devModeOverrideEligibleGroupData
) => {
  const lowerCaseOverrideGroupData = Object.keys(
    devModeOverrideEligibleGroupData
  ).reduce((acc, key) => {
    acc[key.toLowerCase()] = devModeOverrideEligibleGroupData[key];
    return acc;
  }, {} as { [accountIdentifier: string]: number });
  return lowerCaseOverrideGroupData;
};
