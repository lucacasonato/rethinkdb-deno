export class ReQLError extends Error {}
export class ReQLDriverError extends Error {}
export class ReQLAuthError extends ReQLError {}

export function handshakeError(code: number, error: string): ReQLError {
  if (code >= 10 || code <= 20) return new ReQLAuthError(error);
  return new ReQLDriverError(error);
}
