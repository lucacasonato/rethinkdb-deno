import { Session } from "../session.ts";
import { ReQLError } from "../errors.ts";
import { ResponseType, ResponseNote } from "../proto.ts";
import { ReQLBool, ReQLNumber, ReQLString } from "./datum_primitives.ts";
import { ReQLDatumTypes, ReQLObject } from "./datum.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export abstract class Term {
  public abstract get query(): any[];

  // TODO(lucacasonato): implement coerceTo
  // TODO(lucacasonato): implement typeOf
  // TODO(lucacasonato): implement info
}

interface ReQLResponse {
  t: ResponseType;
  r?: any[];
  b?: unknown;
  n: ResponseNote[];
}

/*type UnDatumReQLObject<T extends ReQLObjectTypes> = {
  [B in keyof T]: UnDatumed<T[B]>;
};*/
type UnDatumed<T extends ReQLDatumTypes> = T extends ReQLObject<infer X>
  ? {
      [B in typeof X]: X[B];
    }
  : T extends ReQLNumber
  ? number
  : T extends ReQLString
  ? string
  : T extends ReQLBool
  ? boolean
  : unknown;

export abstract class Runnable<T extends ReQLDatumTypes> extends Term {
  public async run<W = UnDatumed<T>>(session: Session): Promise<W[]> {
    const start = [1, this.query, {}];
    const data = JSON.stringify(start);
    const buffer = encoder.encode(data);
    const respBuffer = await session.dispatch(buffer);
    const resp = decoder.decode(respBuffer);
    try {
      const re: ReQLResponse = JSON.parse(resp);
      const { t: type, b: backtrace, r } = re;
      if (type === ResponseType.RUNTIME_ERROR) {
        throw new ReQLError(
          `A runtime error occurred${backtrace ? " at " + backtrace : ""}${
            r[0] ? ": " + r[0] : "."
          }.`
        );
      }
      if (type === ResponseType.COMPILE_ERROR) {
        throw new ReQLError(
          `A compile error occurred${backtrace ? " at " + backtrace : ""}${
            r[0] ? ": " + r[0] : "."
          }`
        );
      }
      if (type === ResponseType.CLIENT_ERROR) {
        throw new ReQLError(
          `A client error occurred${backtrace ? " at " + backtrace : ""}${
            r[0] ? ": " + r[0] : "."
          }`
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
