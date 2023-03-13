export const overrideEligibleGroupDataFormatter = (devAddresses) => {
  const lowerCaseOverrideGroupData = Object.keys(devAddresses).reduce(
    (acc, key) => {
      acc[key.toLowerCase()] = devAddresses[key];
      return acc;
    },
    {} as { [accountIdentifier: string]: number }
  );
  return lowerCaseOverrideGroupData;
};
