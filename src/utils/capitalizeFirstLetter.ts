export const capitalizeFirstLetter = (str: string) => {
  try {
    if (typeof str !== "string") {
      throw new Error("The parameter must be a string");
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (err) {
    console.error(err);
    return str;
  }
};
