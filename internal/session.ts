import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { ReQLError, ReQLDriverError } from "./errors.ts";

const sessionClosedError = new Error("Session is already closed.");

export interface Session {
  read(length: number): Promise<Uint8Array>;
  readNullTerminatedJSON(): Promise<any>;
  write(p: Uint8Array, nullTerminate?: boolean): Promise<number>;
  writeText(s: string, nullTerminate?: boolean): Promise<number>;
  writeJSON(d: any, nullTerminate?: boolean): Promise<number>;
  close(): void;
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export class SessionImpl implements Session {
  private conn: Deno.Conn;
  private reader: BufReader;
  private closed = false;

  constructor(conn: Deno.Conn) {
    this.conn = conn;
    this.reader = new BufReader(conn);
  }

  async read(length: number): Promise<Uint8Array> {
    const slice = new Uint8Array(length);
    if ((await this.reader.read(slice)) == Deno.EOF)
      throw Error("Reader has reached end of file.");
    return slice;
  }

  async readNullTerminatedJSON(): Promise<any> {
    const slice = await this.reader.readSlice(0);
    if (slice == Deno.EOF) throw Error("Reader has reached end of file.");
    const buffer = slice.slice(0, slice.length - 1);
    const msg = decoder.decode(buffer);
    if (msg.startsWith("ERROR:")) {
      throw new ReQLError(msg);
    }
    try {
      const data = JSON.parse(msg);
      return data;
    } catch (err) {
      throw new ReQLDriverError(`Failed to parse response: ${err}`);
    }
  }

  write(p: Uint8Array, nullTerminate = false): Promise<number> {
    if (this.closed) throw sessionClosedError;
    if (nullTerminate) p = new Uint8Array([...p, 0]);
    return this.conn.write(p);
  }

  writeText(s: string, nullTerminate = false): Promise<number> {
    if (this.closed) throw sessionClosedError;
    const p = encoder.encode(s);
    return this.write(p, nullTerminate);
  }

  writeJSON(d: any, nullTerminate = false): Promise<number> {
    if (this.closed) throw sessionClosedError;
    const s = JSON.stringify(d);
    return this.writeText(s, nullTerminate);
  }

  close() {
    this.closed = true;
    this.conn.close();
  }
}
