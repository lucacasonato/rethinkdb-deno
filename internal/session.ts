import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { deferred } from "https://deno.land/std/util/async.ts";
import { ReQLError, ReQLDriverError } from "./errors.ts";

const sessionClosedError = new Error("Session is already closed.");

export interface Session {
  read(length: number): Promise<Uint8Array>;
  readNullTerminatedJSON(): Promise<any>;
  write(p: Uint8Array, nullTerminate?: boolean): Promise<number>;
  writeJSON(d: any, nullTerminate?: boolean): Promise<number>;
  dispatch(data: Uint8Array): Promise<Uint8Array>;
  close(): void;
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export class SessionImpl implements Session {
  private nextID = 2;
  private conn: Deno.Conn;
  private reader: BufReader;
  private closed = false;
  private closer = deferred<Deno.EOF>();
  private completers: { [id: number]: (data: Uint8Array) => void } = {};
  private listening = false;

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

  private writeText(s: string, nullTerminate = false): Promise<number> {
    if (this.closed) throw sessionClosedError;
    const p = encoder.encode(s);
    return this.write(p, nullTerminate);
  }

  writeJSON(d: any, nullTerminate = false): Promise<number> {
    if (this.closed) throw sessionClosedError;
    const s = JSON.stringify(d);
    return this.writeText(s, nullTerminate);
  }

  private tryStartListening() {
    if (!this.listening) this.startListening();
  }

  private async startListening(): Promise<void> {
    this.listening = true;
    while (!this.closed && Object.keys(this.completers).length > 0) {
      const header = await Promise.race([this.read(12), this.closer]);
      if (header === Deno.EOF) break;
      const view = new DataView(header.buffer);
      const id = view.getUint32(4);
      const size = view.getUint32(8, true);
      const data = await this.read(size);
      if (typeof this.completers[id] === "function") {
        this.completers[id](data);
        delete this.completers[id];
      }
    }
    this.listening = false;
  }

  async dispatch(data: Uint8Array): Promise<Uint8Array> {
    const id = this.nextID;
    this.nextID++;
    const sender = new Uint8Array(12 + data.length);
    const view = new DataView(sender.buffer);
    view.setUint32(4, id);
    view.setUint32(8, data.length, true);
    sender.set(data, 12);
    const promise = new Promise<Uint8Array>(resolve => {
      this.completers[id] = resolve;
      this.tryStartListening();
      this.write(sender);
    });
    return promise;
  }

  close() {
    this.closed = true;
    this.closer.resolve(Deno.EOF);
    this.conn.close();
  }
}
