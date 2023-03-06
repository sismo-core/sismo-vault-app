export const getMinimalEns = (ens: string): string => {
  if (ens) {
    if (ens.length <= 20) return ens;

    const last = ens?.slice(-11);
    const start = ens?.slice(0, 6);
    return start + "..." + last;
  }
  return "...";
};
