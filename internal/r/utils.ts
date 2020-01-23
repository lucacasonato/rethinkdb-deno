import { Datum, ReQLDatum, ReQLString } from "./datum.ts";
import { TermType } from "../proto.ts";
import { exprq } from "./expr.ts";
import { ReQLFunction } from "./function.ts";
import { SingleSelection } from "./single.ts";
import { Runnable } from "./runnable.ts";

export const utils = {
  do: _do,
  js,
  uuid
  // TODO(lucacasonato): implement default
  // TODO(lucacasonato): implement json
  // TODO(lucacasonato): implement literal
  // TODO(lucacasonato): implement group
  // TODO(lucacasonato): implement sum
  // TODO(lucacasonato): implement avg
  // TODO(lucacasonato): implement min
  // TODO(lucacasonato): implement max
  // TODO(lucacasonato): implement ungroup
  // TODO(lucacasonato): implement random
  // TODO(lucacasonato): implement toJSONString
};

function _do<T>(
  func: ((...args: ReQLDatum[]) => T) | ReQLFunction,
  ...data: Datum[]
) {
  return new Do<T>(func, ...data);
}

class Do<T> extends SingleSelection<T> {
  private data: Datum[];
  constructor(
    private func: ((...args: ReQLDatum[]) => T) | ReQLFunction,
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

function js<T>(code: string | ReQLString) {
  return new JS<T>(code);
}

class JS<T> extends Runnable<T> {
  constructor(private code: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.JAVASCRIPT, [exprq(this.code)]];
  }
}

function uuid(seed?: string | ReQLString) {
  return new UUID(seed);
}

class UUID extends ReQLString {
  constructor(private seed?: string | ReQLString) {
    super();
  }
  get query() {
    const query: any[] = [TermType.UUID];
    return query.concat(this.seed ? [[exprq(this.seed)]] : []);
  }
}
