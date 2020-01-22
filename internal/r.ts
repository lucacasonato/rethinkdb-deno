import { Session } from "./session.ts";
import { ReQLError } from "./errors.ts";
import { ResponseType, ResponseNote, TermType } from "./proto.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

abstract class Term {
  protected abstract get query(): any[];
}

interface ReQLResponse {
  t: ResponseType;
  r?: any[];
  b?: unknown;
  n: ResponseNote[];
}

abstract class Readable<T> extends Term {
  public async run(session: Session): Promise<T[]> {
    const start = [1, this.query, {}];
    const data = JSON.stringify(start);
    const buffer = encoder.encode(data);
    const respBuffer = await session.dispatch(buffer);
    const resp = decoder.decode(respBuffer);
    try {
      const { t: type, b: backtrace, r }: ReQLResponse = JSON.parse(resp);
      if (type === ResponseType.RUNTIME_ERROR) {
        throw new ReQLError(
          `A runtime error occurred${backtrace ? ": " + backtrace : ""}"."`
        );
      }
      if (type === ResponseType.COMPILE_ERROR) {
        throw new ReQLError(
          `A compile error occurred${backtrace ? ": " + backtrace : ""}"."`
        );
      }
      if (type === ResponseType.CLIENT_ERROR) {
        throw new ReQLError(
          `A client error occurred${backtrace ? ": " + backtrace : ""}"."`
        );
      }
      if (
        type === ResponseType.SUCCESS_ATOM ||
        type === ResponseType.SUCCESS_SEQUENCE
      ) {
        return r;
      }
      throw new ReQLError(
        `The returned response type is not implemented (${type})`
      );
    } catch (err) {
      throw new ReQLError(`Failed to parse response: ${err}`);
    }
  }
}

export const r = {
  db(database: string): DB {
    return new DB(database);
  }
};

class DB extends Term {
  constructor(private database: string) {
    super();
  }
  get query() {
    return [TermType.DB, [this.database]];
  }
  table<T = any>(table: string) {
    return new Table<T>(this, table);
  }
}

class Table<T> extends Readable<T[]> {
  constructor(private db: DB, private table: string) {
    super();
  }
  get query() {
    return [TermType.TABLE, [this.db.query, this.table]];
  }
}