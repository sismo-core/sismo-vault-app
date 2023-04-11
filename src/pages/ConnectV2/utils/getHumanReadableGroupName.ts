export const getHumanReadableGroupName = (groupName: string) => {
  return groupName
    ?.replace(/-/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};
