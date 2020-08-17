import { Session, SessionImpl } from "./session.ts";
import { handshake } from "./handshake.ts";

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
  username = "admin",
  password = "",
}: ConnectOptions): Promise<Session> {
  const conn = await Deno.connect({ hostname, port, transport: "tcp" });
  const session = new SessionImpl(conn);

  await handshake(session, username, password);

  return session;
}
