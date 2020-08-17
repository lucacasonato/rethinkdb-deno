import { Session } from "../session.ts";
import { ReQLError } from "../errors.ts";
import { ResponseType, ResponseNote } from "../proto.ts";
import { ReQLBool, ReQLNumber, ReQLString } from "./datum_primitives.ts";
import { ReQLDatumTypes, ReQLObject, ReQLObjectTypes } from "./datum.ts";
import { ReQLArray } from "./array.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export abstract class Term {
  public abstract get query(): unknown[];

  // TODO(lucacasonato): implement coerceTo
  // TODO(lucacasonato): implement typeOf
  // TODO(lucacasonato): implement info
}

interface ReQLResponse {
  t: ResponseType;
  // deno-lint-ignore no-explicit-any
  r?: any[];
  b?: unknown;
  n: ResponseNote[];
}

// type UnDatumMap<X extends ReQLObjectTypes> = {
//   [B in keyof X]: UnDatumed<X[B]>;
// };
// type UnDatumed<T extends ReQLDatumTypes> = T extends ReQLNumber ? number
//   : T extends ReQLString ? string
//   : T extends ReQLBool ? boolean
//   : T extends ReQLObject<infer Y> ? UnDatumMap<Y>
//   : T extends ReQLArray<infer Z> ? Z[]
//   : null;

export abstract class Runnable<T extends ReQLDatumTypes> extends Term {
  // deno-lint-ignore no-explicit-any
  public async run<W = any>(session: Session): Promise<W[]> {
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
            r && r[0] ? ": " + r[0] : "."
          }.`,
        );
      }
      if (type === ResponseType.COMPILE_ERROR) {
        throw new ReQLError(
          `A compile error occurred${backtrace ? " at " + backtrace : ""}${
            r && r[0] ? ": " + r[0] : "."
          }`,
        );
      }
      if (type === ResponseType.CLIENT_ERROR) {
        throw new ReQLError(
          `A client error occurred${backtrace ? " at " + backtrace : ""}${
            r && r[0] ? ": " + r[0] : "."
          }`,
        );
      }
      if (
        (type === ResponseType.SUCCESS_ATOM ||
          type === ResponseType.SUCCESS_SEQUENCE) &&
        r
      ) {
        return r;
      }
      throw new ReQLError(
        `The returned response type is not implemented (${type})`,
      );
    } catch (err) {
      throw new ReQLError(`Failed to parse response: ${err}`);
    }
  }
}
