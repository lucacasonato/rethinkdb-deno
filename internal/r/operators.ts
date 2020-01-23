import { Datum, ReQLBool, ReQLDatum } from "./datum.ts";
import { TermType } from "../proto.ts";
import { exprq } from "./expr.ts";
import { ReQLFunction } from "./function.ts";
import { SingleSelection } from "./single.ts";

export const operators = {
  do: _do,
  eq: (...items: Datum[]) => new Equals(items),
  ne: (...items: Datum[]) => new NotEquals(items),
  le: (...items: Datum[]) => new LessThan(items),
  lt: (...items: Datum[]) => new LessThanOrEqual(items),
  gt: (...items: Datum[]) => new GreaterThan(items),
  ge: (...items: Datum[]) => new GreaterThanOrEqual(items),
  not: (val: boolean | ReQLBool) => new Not(val)
};

class Equals extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.EQ, [...this.items.map(d => exprq(d))]];
  }
}
class NotEquals extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.NE, [...this.items.map(d => exprq(d))]];
  }
}
class LessThan extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.LT, [...this.items.map(d => exprq(d))]];
  }
}
class LessThanOrEqual extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.LE, [...this.items.map(d => exprq(d))]];
  }
}
class GreaterThan extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.GT, [...this.items.map(d => exprq(d))]];
  }
}
class GreaterThanOrEqual extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.GE, [...this.items.map(d => exprq(d))]];
  }
}
class Not extends ReQLBool {
  constructor(private val: boolean | ReQLBool) {
    super();
  }
  get query() {
    return [TermType.NOT, [exprq(this.val)]];
  }
}

function _do<T>(
  func: (...args: ReQLDatum[]) => T | ReQLFunction,
  ...data: Datum[]
) {
  return new Do<T>(func, ...data);
}

class Do<T> extends SingleSelection<T> {
  private data: Datum[];
  constructor(
    private func: (
      a?: ReQLDatum,
      b?: ReQLDatum,
      c?: ReQLDatum
    ) => T | ReQLFunction,
    ...data: Datum[]
  ) {
    super();
    this.data = data;
  }
  get query() {
    return [
      TermType.FUNCALL,
      [exprq(this.func), ...this.data.map(d => exprq(d))]
    ];
  }
}
