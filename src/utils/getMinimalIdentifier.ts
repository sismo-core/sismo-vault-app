export const getMinimalIdentifier = (identifier: string): string => {
  if (identifier) {
    if (identifier.length <= 20) return identifier;

    const last = identifier?.slice(-4);
    const start = identifier?.slice(0, 6);
    return start + "..." + last;
  } else return "...";
};
