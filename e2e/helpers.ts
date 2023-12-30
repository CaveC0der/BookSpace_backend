import { TokenPayloadT } from '../src/tokens/types/token-payload.type';
import { Algorithm, sign } from 'jsonwebtoken';

export const extractCookie = (name: string, setCookieHeader: string[]): string => {
  for (const cookie of setCookieHeader)
    if (cookie.startsWith(name))
      return cookie.slice(0, cookie.indexOf(';'));
  return '';
};

export const signToken = (payload: TokenPayloadT,
                          secret: string,
                          algorithm: Algorithm,
                          expiresIn: string): string =>
  sign(payload, secret, { algorithm, expiresIn });
