export const isHexadecimal = (str) => {
  const hexRegex = /^0x[0-9A-Fa-f]+$/;
  return hexRegex.test(str);
};
