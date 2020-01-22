// Loosely based on https://github.com/rethinkdb/rethinkdb-go/blob/c04e2e4c4c40866139d96497a9d06b01578c1e9e/connection_handshake.go

import { sha256 } from "https://deno.land/x/sha256/mod.ts";
import { hmac } from "https://deno.land/x/hmac/mod.ts";
import { pbkdf2 } from "https://deno.land/x/pbkdf2/mod.ts";
import * as base64 from "https://deno.land/x/base64/mod.ts";

import { Session, SessionImpl } from "./session.ts";
import { V1_0, protocolVersion } from "./constants.ts";
import {
  ReQLError,
  handshakeError,
  ReQLDriverError,
  ReQLAuthError
} from "./errors.ts";

export async function handshake(
  session: Session,
  username: string,
  password: string
): Promise<void> {
  // Preform a V1_0 version handshake and protocol version check.
  await versionHandshake(session);

  // Generate client nonce
  const clientNonce = generateNonce();

  // Send first client message
  let oldAuthMessage = await writeFirstMessage(session, username, clientNonce);

  // Read first server message
  const [i, salt, serverNonce, am] = await readFirstMessage(session);
  oldAuthMessage += "," + am;

  // Check server nonce
  if (!serverNonce.startsWith(clientNonce)) {
    throw new ReQLAuthError("Invalid nonce from server");
  }

  // Generate proof
  const saltedPass = saltPassword(password, i, salt);
  const clientProof = calculateProof(saltedPass, serverNonce, oldAuthMessage);
  const serverSignature = calculateServerSignature(
    saltedPass,
    serverNonce,
    oldAuthMessage
  );

  // Send client final message
  await writeFinalMessage(session, serverNonce, clientProof);

  await readFinalMessage(session, serverSignature);
}

interface VersionHandshakeResponse {
  success: boolean;
  min_protocol_version: number;
  max_protocol_version: number;
  server_version: string;
}

async function versionHandshake(session: Session) {
  // Send V1_0 magic number
  session.write(V1_0);
  const resp: VersionHandshakeResponse = await session.readNullTerminatedJSON();
  if (!resp.success) {
    throw new ReQLError(`Handshake failed.`);
  }
  if (
    resp.min_protocol_version > protocolVersion ||
    resp.max_protocol_version < protocolVersion
  ) {
    throw new ReQLError(
      `Handshake failed because the server does not support protocol version ${protocolVersion}. The minimum supported version is ${resp.min_protocol_version} and the maxiumum supported version is ${resp.max_protocol_version}.`
    );
  }
}

function generateNonce(): string {
  var array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return base64.fromUint8Array(array);
}

const authenticationMethod = "SCRAM-SHA-256";

async function writeFirstMessage(
  session: Session,
  username: string,
  clientNonce: string
): Promise<string> {
  const authMessage = `n=${username},r=${clientNonce}`;
  await session.writeJSON(
    {
      protocol_version: protocolVersion,
      authentication: `n,,${authMessage}`,
      authentication_method: authenticationMethod
    },
    true
  );
  return authMessage;
}

function parsePairs(s: string): { [k: string]: string } {
  const pairs = s.split(",");
  const kvpairs = pairs.map(pair => {
    if (pair.length === 0) {
      return null;
    } else if (pair.length === 1) {
      return [pair, null];
    } else if (pair.length > 2 && pair[1] === "=") {
      return [pair.slice(0, 1), pair.slice(2)];
    } else {
      throw new ReQLDriverError("Authentication string pairs are not valid");
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

interface AuthMessageResp {
  success: boolean;
  authentication: string;
  error: string;
  error_code: number;
}

async function readFirstMessage(
  session: Session
): Promise<[number, Uint8Array, string, string]> {
  const resp: AuthMessageResp = await session.readNullTerminatedJSON();
  if (!resp.success) {
    throw handshakeError(resp.error_code, resp.error);
  }
  const auth = parsePairs(resp.authentication);
  return [
    parseInt(auth.i),
    base64.toUint8Array(auth.s),
    auth.r,
    resp.authentication
  ];
}

async function writeFinalMessage(
  session: Session,
  serverNonce: string,
  clientProof: string
): Promise<void> {
  const authMessage = `c=biws,r=${serverNonce},p=${clientProof}`;
  await session.writeJSON(
    {
      authentication: authMessage
    },
    true
  );
}

async function readFinalMessage(
  session: Session,
  serverSignature: string
): Promise<void> {
  const resp: AuthMessageResp = await session.readNullTerminatedJSON();
  if (!resp.success) {
    throw handshakeError(resp.error_code, resp.error);
  }
  const auth = parsePairs(resp.authentication);
  // Validate server response
  if (auth.v != serverSignature)
    throw new ReQLAuthError("Invalid server signature");
  return;
}

const encoder = new TextEncoder();

function saltPassword(
  password: string,
  i: number,
  salt: Uint8Array
): Uint8Array {
  const pw = encoder.encode(password);
  const hash = pbkdf2("sha256", pw, salt, null, null, 32, i) as Uint8Array;
  return hash;
}

function calculateProof(
  saltedPass: Uint8Array,
  serverNonce: string,
  oldAuthMessage: string
): string {
  const clientKey = hmac(
    "sha256",
    saltedPass,
    encoder.encode("Client Key")
  ) as Uint8Array;

  const storedKey = sha256(clientKey, null, null) as Uint8Array;

  const fullAuthMessage = `${oldAuthMessage},c=biws,r=${serverNonce}`;
  const clientSignature = hmac(
    "sha256",
    storedKey,
    encoder.encode(fullAuthMessage)
  ) as Uint8Array;
  const clientProof = clientKey.map((v, i) => v ^ clientSignature[i]);
  return base64.fromUint8Array(clientProof);
}

function calculateServerSignature(
  saltedPass: Uint8Array,
  serverNonce: string,
  oldAuthMessage: string
): string {
  const serverKey = hmac(
    "sha256",
    saltedPass,
    encoder.encode("Server Key")
  ) as Uint8Array;

  const fullAuthMessage = `${oldAuthMessage},c=biws,r=${serverNonce}`;
  const serverSignature = hmac(
    "sha256",
    serverKey,
    encoder.encode(fullAuthMessage)
  ) as Uint8Array;
  return base64.fromUint8Array(serverSignature);
}
