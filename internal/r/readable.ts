import { Session } from '../session.ts';
import { ReQLError } from '../errors.ts';
import { ResponseType, ResponseNote } from '../proto.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export abstract class Term {
  public abstract get query(): any[];
}

interface ReQLResponse {
  t: ResponseType;
  r?: any[];
  b?: unknown;
  n: ResponseNote[];
}

export abstract class Readable<T> extends Term {
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
          `A runtime error occurred${backtrace ? ': ' + backtrace : ''}"."`
        );
      }
      if (type === ResponseType.COMPILE_ERROR) {
        throw new ReQLError(
          `A compile error occurred${backtrace ? ': ' + backtrace : ''}"."`
        );
      }
      if (type === ResponseType.CLIENT_ERROR) {
        throw new ReQLError(
          `A client error occurred${backtrace ? ': ' + backtrace : ''}"."`
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
