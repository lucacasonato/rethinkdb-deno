import { Sequence } from "./sequence.ts";
import { Runnable } from "./runnable.ts";
import { Datum } from "./datum.ts";
import { TermType } from "../proto.ts";
import { expr, exprq } from "./expr.ts";

export abstract class Stream<T> extends Sequence<T> {}

export abstract class StreamSelection<T> extends Stream<T> {
  between(lowerKey: Datum, uppperKey: Datum) {
    return new Between<T>(this, lowerKey, uppperKey);
  }
}

class Between<T> extends StreamSelection<T> {
  constructor(
    private parent: Runnable<T>,
    private lowerKey: Datum,
    private upperKey: Datum
  ) {
    super();
  }
  get query() {
    return [
      TermType.BETWEEN,
      [this.parent.query, exprq(this.lowerKey), exprq(this.upperKey)]
    ];
  }
}
