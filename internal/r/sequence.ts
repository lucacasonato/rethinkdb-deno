import { Runnable } from "./runnable.ts";
import { TermType } from "../proto.ts";
import { Datum } from "./datum.ts";
import { Pathspec } from "./pathspec.ts";
import { SingleSelection } from "./single.ts";
import { expr, exprq } from "./expr.ts";

export enum Ordering {
  Ascending = TermType.ASC,
  Descending = TermType.DESC
}

export abstract class Sequence<T> extends Runnable<T> {
  slice(start: number, end: number) {
    return new Slice<T>(this, start, end);
  }
  skip(skip: number) {
    return new Skip<T>(this, skip);
  }
  limit(length: number) {
    return new Limit<T>(this, length);
  }
  contains(d: Datum) {
    return new Contains<T>(this, d);
  }
  getField(field: string) {
    return new GetField<T>(this, field);
  }
  withFields<W>(...paths: Pathspec[]) {
    return new WithFields<T, W>(this, paths);
  }
  pluck<W>(...paths: Pathspec[]) {
    return new Pluck<T, W>(this, paths);
  }
  without<W>(...paths: Pathspec[]) {
    return new Without<T, W>(this, paths);
  }
  filter(filter: Datum) {
    return new Filter<T>(this, filter);
  }
  orderBy(order: Ordering) {
    return new OrderBy<T>(this, order);
  }
  distinct() {
    return new Distinct<T>(this);
  }
  count(filter?: Datum) {
    return new Count<T>(this, filter);
  }
  isEmpty() {
    return new IsEmpty<T>(this);
  }
  union(...others: Sequence<T>[]) {
    return new Union<T>(this, others);
  }
  nth(n: number) {
    return new Nth<T>(this, n);
  }
  eqJoin<W>(joiner: string, right: Sequence<W>) {
    return new EqJoin<T, W>(this, joiner, right);
  }
  zip<W>() {
    return new Zip<T, W>(this);
  }
}

class Slice<T> extends Sequence<T> {
  constructor(
    private parent: Sequence<T>,
    private start: number,
    private end: number
  ) {
    super();
  }
  get query() {
    return [
      TermType.SLICE,
      [this.parent.query, exprq(this.start), exprq(this.end)]
    ];
  }
}

class Skip<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private _skip: number) {
    super();
  }
  get query() {
    return [TermType.SKIP, [this.parent.query, exprq(this._skip)]];
  }
}

class Limit<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private length: number) {
    super();
  }
  get query() {
    return [TermType.LIMIT, [this.parent.query, exprq(this.length)]];
  }
}

class Contains<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.CONTAINS, [this.parent.query, exprq(this.d)]];
  }
}

class GetField<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private id: string) {
    super();
  }
  get query() {
    return [TermType.GET_FIELD, [this.parent.query, exprq(this.id)]];
  }
}

class WithFields<T, W> extends Sequence<W> {
  constructor(private parent: Sequence<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [
      TermType.WITH_FIELDS,
      [this.parent.query, ...this.paths.map(p => exprq(p))]
    ];
  }
}

class Pluck<T, W> extends Sequence<W> {
  constructor(private parent: Sequence<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [
      TermType.PLUCK,
      [this.parent.query, ...this.paths.map(p => exprq(p))]
    ];
  }
}

class Without<T, W> extends Sequence<W> {
  constructor(private parent: Sequence<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [
      TermType.WITHOUT,
      [this.parent.query, ...this.paths.map(p => exprq(p))]
    ];
  }
}

class Filter<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private _filter: Datum) {
    super();
  }
  get query() {
    return [TermType.FILTER, [this.parent.query, exprq(this._filter)]];
  }
}

class OrderBy<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private order: Ordering) {
    super();
  }
  get query() {
    return [TermType.ORDER_BY, [this.parent.query, [this.order]]];
  }
}

class Distinct<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>) {
    super();
  }
  get query() {
    return [TermType.DISTINCT, [this.parent.query]];
  }
}

class Count<T> extends SingleSelection<number> {
  constructor(private parent: Sequence<T>, private _filter?: Datum) {
    super();
  }
  get query() {
    return [
      TermType.COUNT,
      [this.parent.query].concat(this._filter ? [exprq(this._filter)] : [])
    ];
  }
}

class IsEmpty<T> extends SingleSelection<boolean> {
  constructor(private parent: Sequence<T>) {
    super();
  }
  get query() {
    return [TermType.IS_EMPTY, [this.parent.query]];
  }
}

class Union<T> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private others: Sequence<T>[]) {
    super();
  }
  get query() {
    return [
      TermType.UNION,
      [this.parent.query, ...this.others.map(s => s.query)]
    ];
  }
}

class Nth<T> extends SingleSelection<T> {
  constructor(private parent: Sequence<T>, private n: number) {
    super();
  }
  get query() {
    return [TermType.NTH, [this.parent.query, exprq(this.n)]];
  }
}

class EqJoin<T, W> extends Sequence<{ left: T; right: W }> {
  constructor(
    private left: Sequence<T>,
    private joiner: string,
    private right: Sequence<W>
  ) {
    super();
  }
  get query() {
    return [TermType.EQ_JOIN, [this.left.query, exprq(this.joiner), this.left]];
  }
}

class Zip<T, W> extends Sequence<W> {
  constructor(private parent: Sequence<T>) {
    super();
  }
  get query() {
    return [TermType.ZIP, [this.parent.query]];
  }
}
