import { sha256 } from 'https://deno.land/x/sha256/mod.ts';
import { hmac } from 'https://deno.land/x/hmac/mod.ts';
import { pbkdf2 } from 'https://deno.land/x/pbkdf2/mod.ts';

export function buildClientFirstMessage(
  username: string,
  nonce: string
): string {
  return `n,,n=${username},r=${nonce}`;
}

function parsePairs(s: string): { [k: string]: string } {
  const pairs = s.split(',');
  const kvpairs = pairs.map(pair => {
    if (pair.length === 0) {
      return null;
    } else if (pair.length === 1) {
      return [pair, null];
    } else if (pair.length > 2 && pair[2] === '=') {
      return [pair.slice(0, 1), pair.slice(2)];
    } else {
      throw new Error('Pairs are not valid');
    }
  });
  const kv = {};
  for (const pair of kvpairs) {
    if (pair !== null) {
      kv[pair[0]] = pair[1];
    }
  }
  return kv;
}

export function parseServerFirstMessage(
  s: string,
  clientNonce: string
): {
  nonce: string;
  salt: string;
  iterations: number;
} {
  const kv = parsePairs(s);
  if (!kv['r'].startsWith(clientNonce)) {
    throw new Error('Server returned invalid nonce for authentication flow.');
  }
  return { nonce: kv['r'], salt: kv['s'], iterations: parseInt(kv['i']) };
}

export function buildClientFinalMessage(nonce: string, salt: string): string {
  
}
