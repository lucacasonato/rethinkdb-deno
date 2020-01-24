import { Datum, ReQLDatumTypes } from "./datum.ts";
import { Sequence } from "./sequence.ts";
import { Runnable } from "./runnable.ts";
import { TermType } from "../proto.ts";
import { exprq } from "./expr.ts";

export abstract class Stream<T extends ReQLDatumTypes> extends Sequence<T> {}

export abstract class StreamSelection<T extends ReQLDatumTypes> extends Stream<
  T
> {
  between(lowerKey: Datum, uppperKey: Datum) {
    return new Between<T>(this, lowerKey, uppperKey);
  }
  // TODO(lucacasonato): implement update
  // TODO(lucacasonato): implement delete
  // TODO(lucacasonato): implement replace
}

class Between<T extends ReQLDatumTypes> extends StreamSelection<T> {
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
      [exprq(this.parent), exprq(this.lowerKey), exprq(this.upperKey)]
    ];
  }
}
