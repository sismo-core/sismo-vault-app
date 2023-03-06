export const getExtraMinimalIdentifier = (identifier: string): string => {
  if (identifier) {
    if (identifier.length <= 20) return identifier;

    const last = identifier?.slice(-2);
    const start = identifier?.slice(0, 4);
    return start + "..." + last;
  } else return "...";
};
