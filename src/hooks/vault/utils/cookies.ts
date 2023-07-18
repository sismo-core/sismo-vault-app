export const setCookie = (cookieName: string, cookieValue: string, expireHours: number) => {
  const d = new Date();
  d.setTime(d.getTime() + expireHours * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/; secure";
};

export const deleteCookie = (cookieName: string) => {
  document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure";
};

export const getCookie = (cookieName: string) => {
  let name = cookieName + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
};
