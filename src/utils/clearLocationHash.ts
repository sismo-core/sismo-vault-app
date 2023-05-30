export const clearLocationHash = () => {
  window.history.pushState(
    "new url",
    document.title,
    window.location.pathname + window.location.search
  );
};
