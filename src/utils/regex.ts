export const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
export const isValidEthAddress = (address) => {
  return String(address).match(/^0x[a-fA-F0-9]{40}$/);
};

export const isValidEns = (input: string) => {
  const regex = new RegExp(/^([a-z0-9]+(-[a-z0-9]+)*\.)+eth$/);
  return regex.test(input);
};
