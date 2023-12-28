export const extractCookie = (name: string, setCookieHeader: string[]): string => {
  for (const cookie of setCookieHeader)
    if (cookie.startsWith(name))
      return cookie.slice(0, cookie.indexOf(';'));
  return '';
};
