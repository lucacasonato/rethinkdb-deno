import {
  Datum,
  ReQLDatum,
  ReQLString,
  ReQLBool,
  ReQLNumber,
  ReQLDatumTypes
} from "./datum.ts";
import { TermType } from "../proto.ts";
import { exprq } from "./expr.ts";
import { ReQLFunction } from "./function.ts";
import { SingleSelection } from "./single.ts";
import { Runnable } from "./runnable.ts";

export const utils = {
  do: _do,
  js,
  uuid
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
    return Array<any>(TermType.UUID).concat(
      this.seed ? [[exprq(this.seed)]] : []
    );
  }
}

