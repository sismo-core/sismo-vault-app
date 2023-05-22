export const clearQueryParams = (...params: string[]) => {
  const url = new URL(window.location.href);
  params.forEach((param) => url.searchParams.delete(param));
  window.history.replaceState(null, "new url", url);
};
