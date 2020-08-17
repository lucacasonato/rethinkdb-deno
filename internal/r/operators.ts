import { ReQLBool, ReQLNumber, ReQLString } from "./datum_primitives.ts";
import { Datum } from "./datum.ts";
import { TermType } from "../proto.ts";
import { exprq } from "./expr.ts";

export const operators = {
  eq: (...items: Datum[]) => new Equals(items),
  ne: (...items: Datum[]) => new NotEquals(items),
  le: (...items: Datum[]) => new LessThan(items),
  lt: (...items: Datum[]) => new LessThanOrEqual(items),
  gt: (...items: Datum[]) => new GreaterThan(items),
  ge: (...items: Datum[]) => new GreaterThanOrEqual(items),
  not: (val: boolean | ReQLBool) => new Not(val),
  add,
  sub: (...items: (number | ReQLNumber)[]) => new Subract(items),
  mul: (...items: (number | ReQLNumber)[]) => new Multiply(items),
  div: (...items: (number | ReQLNumber)[]) => new Divide(items),
  mod: (a: number | ReQLNumber, b: number | ReQLNumber) => new Modulo(a, b),
  floor: (a: number | ReQLNumber) => new Floor(a),
  ceil: (a: number | ReQLNumber) => new Ceil(a),
  round: (a: number | ReQLNumber) => new Round(a),
  // TODO(lucacasonato): implement branch
  // TODO(lucacasonato): implement or
  // TODO(lucacasonato): implement and
  // TODO(lucacasonato): implement bitAnd
  // TODO(lucacasonato): implement bitOr
  // TODO(lucacasonato): implement bitXor
  // TODO(lucacasonato): implement bitNot
  // TODO(lucacasonato): implement bitSal
  // TODO(lucacasonato): implement bitSar
};

class Equals extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.EQ, [...this.items.map((d) => exprq(d))]];
  }
}
class NotEquals extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.NE, [...this.items.map((d) => exprq(d))]];
  }
}
class LessThan extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.LT, [...this.items.map((d) => exprq(d))]];
  }
}
class LessThanOrEqual extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.LE, [...this.items.map((d) => exprq(d))]];
  }
}
class GreaterThan extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.GT, [...this.items.map((d) => exprq(d))]];
  }
}
class GreaterThanOrEqual extends ReQLBool {
  constructor(private items: Datum[]) {
    super();
  }
  get query() {
    return [TermType.GE, [...this.items.map((d) => exprq(d))]];
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

function add(...items: (number | ReQLNumber)[]): AddNumber;
function add(...items: (string | ReQLString)[]): AddString;
function add(...items: (number | ReQLNumber)[] | (string | ReQLString)[]) {
  if (
    items.length > 0 &&
    (typeof items[0] === "number" || items[0] instanceof ReQLNumber)
  ) {
    return new AddNumber(items as (number | ReQLNumber)[]);
  } else {
    return new AddString(items as (string | ReQLString)[]);
  }
}
class AddNumber extends ReQLNumber {
  constructor(private val: (number | ReQLNumber)[]) {
    super();
  }
  get query() {
    return [TermType.ADD, [...this.val.map((v) => exprq(v))]];
  }
}
class AddString extends ReQLString {
  constructor(private val: (string | ReQLString)[]) {
    super();
  }
  get query() {
    return [TermType.ADD, [...this.val.map((v) => exprq(v))]];
  }
}
class Subract extends ReQLNumber {
  constructor(private val: (number | ReQLNumber)[]) {
    super();
  }
  get query() {
    return [TermType.SUB, [...this.val.map((v) => exprq(v))]];
  }
}
class Multiply extends ReQLNumber {
  constructor(private val: (number | ReQLNumber)[]) {
    super();
  }
  get query() {
    return [TermType.MUL, [...this.val.map((v) => exprq(v))]];
  }
}
class Divide extends ReQLNumber {
  constructor(private val: (number | ReQLNumber)[]) {
    super();
  }
  get query() {
    return [TermType.DIV, [...this.val.map((v) => exprq(v))]];
  }
}
class Modulo extends ReQLNumber {
  constructor(private a: number | ReQLNumber, private b: number | ReQLNumber) {
    super();
  }
  get query() {
    return [TermType.MOD, [exprq(this.a), exprq(this.b)]];
  }
}
class Floor extends ReQLNumber {
  constructor(private a: number | ReQLNumber) {
    super();
  }
  get query() {
    return [TermType.FLOOR, [exprq(this.a)]];
  }
}
class Ceil extends ReQLNumber {
  constructor(private a: number | ReQLNumber) {
    super();
  }
  get query() {
    return [TermType.CEIL, [exprq(this.a)]];
  }
}
class Round extends ReQLNumber {
  constructor(private a: number | ReQLNumber) {
    super();
  }
  get query() {
    return [TermType.ROUND, [exprq(this.a)]];
  }
}
