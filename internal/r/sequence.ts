import { Runnable } from "./runnable.ts";
import {
  ReQLBool,
  ReQLNumber,
  ReQLString,
  ReQLDatum
} from "./datum_primitives.ts";
import { Datum, ReQLDatumTypes, ReQLObject } from "./datum.ts";
import { TermType } from "../proto.ts";
import { Pathspec } from "./pathspec.ts";
import { exprq } from "./expr.ts";
import { ReQLFunction } from "./function.ts";
import { ReQLArray } from "./array.ts";

export enum Ordering {
  Ascending = TermType.ASC,
  Descending = TermType.DESC
}

export abstract class Sequence<T extends ReQLDatumTypes> extends Runnable<T> {
  slice(start: number | ReQLNumber, end: number | ReQLNumber) {
    return new Slice<T>(this, start, end);
  }
  skip(skip: number | ReQLNumber) {
    return new Skip<T>(this, skip);
  }
  limit(length: number | ReQLNumber) {
    return new Limit<T>(this, length);
  }
  offsetsOf(predicate: Datum | ((doc: T) => ReQLBool) | ReQLFunction) {
    return new OffsetOf<T>(this, predicate);
  }
  contains(predicate: Datum | ((doc: T) => ReQLBool) | ReQLFunction) {
    return new Contains<T>(this, predicate);
  }
  getField(field: string | ReQLString) {
    return new GetField<ReQLObject>(this as Sequence<ReQLObject>, field);
  }
  withFields<W extends ReQLObject>(...paths: Pathspec[]) {
    return new WithFields<ReQLObject, W>(this as Sequence<ReQLObject>, paths);
  }
  pluck<W extends ReQLObject>(...paths: Pathspec[]) {
    return new Pluck<ReQLObject, W>(this as Sequence<ReQLObject>, paths);
  }
  without<W extends ReQLObject>(...paths: Pathspec[]) {
    return new Without<ReQLObject, W>(this as Sequence<ReQLObject>, paths);
  }
  merge(other: T[] | Sequence<T>) {
    return new Merge<T>(this, other);
  }
  reduce<W extends ReQLDatumTypes>(
    reducer:
      | ((accumulator: ReQLArray<W>, doc: T) => ReQLArray<W>)
      | ReQLFunction
  ) {
    return new Reduce<T, W>(this, reducer);
  }
  map<W extends ReQLDatumTypes>(mapper: ((doc: T) => W) | ReQLFunction) {
    return new _Map<T, W>(this, mapper);
  }
  filter(filter: Datum | ((doc: T) => ReQLBool) | ReQLFunction) {
    return new Filter<T>(this, filter);
  }

  // TODO(lucacasonato): implement concatMap

  // TODO(lucacasonato): multiple fields
  orderBy(order: Ordering) {
    return new OrderBy<T>(this, order);
  }
  distinct() {
    return new Distinct<T>(this);
  }
  // TODO(lucacasonato): implement function predicate
  count(filter?: Datum) {
    return new Count<T>(this, filter);
  }
  isEmpty() {
    return new IsEmpty<T>(this);
  }
  union(...others: (T[] | Sequence<T>)[]) {
    return new Union<T>(this, others);
  }
  nth(n: number | ReQLNumber) {
    return new Nth<T>(this, n);
  }

  // TODO(lucacasonato): implement bracket

  // TODO(lucacasonato): inner join

  // TODO(lucacasonato): outer join

  eqJoin<W extends ReQLObject>(joiner: string, right: T[] | Sequence<W>) {
    return new EqJoin<T, W>(this, joiner, right);
  }
  zip<W extends ReQLObject>() {
    return new Zip<T, W>(this);
  }
  // TODO(lucacasonato): implement forEach
  // TODO(lucacasonato): implement sample
}

class Slice<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(
    private parent: Sequence<T>,
    private start: number | ReQLNumber,
    private end: number | ReQLNumber
  ) {
    super();
  }
  get query() {
    return [
      TermType.SLICE,
      [exprq(this.parent), exprq(this.start), exprq(this.end)]
    ];
  }
}

class Skip<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private _skip: number | ReQLNumber) {
    super();
  }
  get query() {
    return [TermType.SKIP, [exprq(this.parent), exprq(this._skip)]];
  }
}

class Limit<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(
    private parent: Sequence<T>,
    private length: number | ReQLNumber
  ) {
    super();
  }
  get query() {
    return [TermType.LIMIT, [exprq(this.parent), exprq(this.length)]];
  }
}

class OffsetOf<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(
    private parent: Sequence<T>,
    private predicate: Datum | ((doc: T) => ReQLBool) | ReQLFunction
  ) {
    super();
  }
  get query() {
    return [TermType.OFFSETS_OF, [exprq(this.parent), exprq(this.predicate)]];
  }
}

class Contains<T extends ReQLDatumTypes> extends ReQLBool {
  constructor(
    private parent: Sequence<T>,
    private predicate: Datum | ((doc: T) => ReQLBool) | ReQLFunction
  ) {
    super();
  }
  get query() {
    return [TermType.CONTAINS, [exprq(this.parent), exprq(this.predicate)]];
  }
}

class GetField<T extends ReQLObject> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private id: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.GET_FIELD, [exprq(this.parent), exprq(this.id)]];
  }
}

class WithFields<T extends ReQLObject, W extends ReQLObject> extends Sequence<
  W
> {
  constructor(private parent: Sequence<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [
      TermType.WITH_FIELDS,
      [exprq(this.parent), ...this.paths.map(p => exprq(p))]
    ];
  }
}

class Pluck<T extends ReQLObject, W extends ReQLObject> extends Sequence<W> {
  constructor(private parent: Sequence<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [
      TermType.PLUCK,
      [exprq(this.parent), ...this.paths.map(p => exprq(p))]
    ];
  }
}

class Without<T extends ReQLObject, W extends ReQLObject> extends Sequence<W> {
  constructor(private parent: Sequence<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [
      TermType.WITHOUT,
      [exprq(this.parent), ...this.paths.map(p => exprq(p))]
    ];
  }
}

class Merge<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private other: T[] | Sequence<T>) {
    super();
  }
  get query() {
    return [TermType.MERGE, [exprq(this.parent), exprq(this.other)]];
  }
}

class Reduce<
  T extends ReQLDatumTypes,
  W extends ReQLDatumTypes
> extends Sequence<W> {
  constructor(
    private parent: Sequence<T>,
    private reducer:
      | ((accumulator: ReQLArray<W>, doc: T) => ReQLArray<W>)
      | ReQLFunction
  ) {
    super();
  }
  get query() {
    return [TermType.REDUCE, [exprq(this.parent), exprq(this.reducer)]];
  }
}

class _Map<T extends ReQLDatumTypes, W extends ReQLDatumTypes> extends Sequence<
  W
> {
  constructor(
    private parent: Sequence<T>,
    private mapper: ((doc: T) => W) | ReQLFunction
  ) {
    super();
  }
  get query() {
    return [TermType.MAP, [exprq(this.parent), exprq(this.mapper)]];
  }
}

class Filter<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(
    private parent: Sequence<T>,
    private _filter: Datum | ((doc: T) => ReQLBool) | ReQLFunction
  ) {
    super();
  }
  get query() {
    return [TermType.FILTER, [exprq(this.parent), exprq(this._filter)]];
  }
}

class OrderBy<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(private parent: Sequence<T>, private order: Ordering) {
    super();
  }
  get query() {
    return [TermType.ORDER_BY, [exprq(this.parent), [this.order]]];
  }
}

class Distinct<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(private parent: Sequence<T>) {
    super();
  }
  get query() {
    return [TermType.DISTINCT, [exprq(this.parent)]];
  }
}

class Count<T extends ReQLDatumTypes> extends ReQLNumber {
  constructor(private parent: Sequence<T>, private _filter?: Datum) {
    super();
  }
  get query() {
    return [
      TermType.COUNT,
      [exprq(this.parent)].concat(this._filter ? [exprq(this._filter)] : [])
    ];
  }
}

class IsEmpty<T extends ReQLDatumTypes> extends ReQLBool {
  constructor(private parent: Sequence<T>) {
    super();
  }
  get query() {
    return [TermType.IS_EMPTY, [exprq(this.parent)]];
  }
}

class Union<T extends ReQLDatumTypes> extends Sequence<T> {
  constructor(
    private parent: Sequence<T>,
    private others: (T[] | Sequence<T>)[]
  ) {
    super();
  }
  get query() {
    return [
      TermType.UNION,
      [exprq(this.parent), ...this.others.map(s => exprq(s))]
    ];
  }
}

class Nth<T extends ReQLDatumTypes> extends ReQLDatum<T> {
  constructor(private parent: Sequence<T>, private n: number | ReQLNumber) {
    super();
  }
  get query() {
    return [TermType.NTH, [exprq(this.parent), exprq(this.n)]];
  }
}

class EqJoin<
  T extends ReQLDatumTypes,
  W extends ReQLDatumTypes
> extends Sequence<
  ReQLObject<{
    left: T;
    right: W;
  }>
> {
  constructor(
    private left: Sequence<T>,
    private joiner: string,
    private right: T[] | Sequence<W>
  ) {
    super();
  }
  get query() {
    return [
      TermType.EQ_JOIN,
      [exprq(this.left), exprq(this.joiner), exprq(this.right)]
    ];
  }
}

class Zip<T extends ReQLDatumTypes, W extends ReQLDatumTypes> extends Sequence<
  W
> {
  constructor(private parent: Sequence<T>) {
    super();
  }
  get query() {
    return [TermType.ZIP, [exprq(this.parent)]];
  }
}
