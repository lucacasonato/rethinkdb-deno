import { V1_0, protocolVersion } from './constants';
import { BufReader } from 'https://deno.land/std/io/bufio.ts';

export interface Session {
  write(p: Uint8Array): Promise<number>;
  close(): void;
}

export interface ConnectOptions {
  hostname: string;
  port?: number;
  username?: string;
  password?: string;
}

/**
 * Connect to a RethinkDB database and setup the connection.
 *
 * @param hostname The address where the server is located.
 * @param port The RethinkDB driver port. Default is 28015.
 * @param username The username used to connect to the server. Default is 'admin'.
 * @param password The password used to connect to the server. (optional)
 */
export async function connect({
  hostname,
  port = 28015,
  username = 'admin',
  password,
}: ConnectOptions): Promise<Session> {
  const conn = await Deno.dial({ hostname, port, transport: 'tcp' });
  const session = new SessionImpl(conn);
  session.write(V1_0);
  const resp = decoder.decode(await session.read());
  let handshakeResponse: {
    success: boolean;
    min_protocol_version: number;
    max_protocol_version: number;
    server_version: string;
  };
  try {
    handshakeResponse = JSON.parse(resp);
  } catch {
    throw new Error(`Failed to connect to RethinkDB: ${resp}`);
  }
  if (!handshakeResponse.success) {
    throw new Error(`Failed to connect to RethinkDB.`);
  }
  if (
    handshakeResponse.min_protocol_version > protocolVersion ||
    handshakeResponse.max_protocol_version < protocolVersion
  ) {
    throw new Error(
      `The RethinkDB database does not support protocol version ${protocolVersion}. The minimum supported version is ${handshakeResponse.min_protocol_version} and the maxiumum supported version is ${handshakeResponse.max_protocol_version}.`
    );
  }

  return session;
}

const sessionClosedError = new Error('Session is already closed.');
const decoder = new TextDecoder();

class SessionImpl implements Session {
  private conn: Deno.Conn;
  private reader: BufReader;
  private closed = false;

  constructor(conn: Deno.Conn) {
    this.conn = conn;
    this.reader = new BufReader(conn);
  }

  read(): Promise<Uint8Array> {
    return this.reader.readSlice(0);
  }

  write(p: Uint8Array): Promise<number> {
    if (this.closed) throw sessionClosedError;
    return this.conn.write(p);
  }

  close() {
    this.closed = true;
    this.conn.close();
  }
}
