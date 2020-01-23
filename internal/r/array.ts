import { Runnable, Term } from "./runnable.ts";
import { Sequence } from "./sequence.ts";
import { Datum } from "./datum.ts";
import { TermType } from "../proto.ts";
import { expr, exprq } from "./expr.ts";

export class ReQLArray<T> extends Sequence<T> {
  constructor(private _array?: Term[]) {
    super();
  }
  get query(): any[] {
    return [TermType.MAKE_ARRAY, this._array.map(i => i.query)];
  }
  append(d: Datum) {
    return new Append<T>(this, d);
  }
  prepend(d: Datum) {
    return new Prepend<T>(this, d);
  }
  difference(other: ReQLArray<T>) {
    return new Difference<T>(this, other);
  }
  setInsert(d: Datum) {
    return new SetInsert<T>(this, d);
  }
  setIntersection(other: ReQLArray<T>) {
    return new SetIntersection<T>(this, other);
  }
  setUnion(other: ReQLArray<T>) {
    return new SetUnion<T>(this, other);
  }
  setDifference(other: ReQLArray<T>) {
    return new SetDifference<T>(this, other);
  }
  insertAt(offset: number, value: T) {
    return new InsertAt<T>(this, offset, value);
  }
  deleteAt(offset: number, endOffset?: number) {
    return new DeleteAt<T>(this, offset, endOffset);
  }
  changeAt<Q extends Datum>(offset: number, value: Q) {
    return new ChangeAt<Q, T>(this, offset, value);
  }
  spliceAt(offset: number, array: ReQLArray<T>) {
    return new SpliceAt<T>(this, offset, array);
  }
}

class Append<T> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.APPEND, [this.parent.query, exprq(this.d)]];
  }
}

class Prepend<T> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.PREPEND, [this.parent.query, exprq(this.d)]];
  }
}

class Difference<T> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.DIFFERENCE, [this.parent.query, this.other.query]];
  }
}

class SetInsert<T> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.SET_INSERT, [this.parent.query, exprq(this.d)]];
  }
}

class SetIntersection<T> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_INTERSECTION, [this.parent.query, this.other.query]];
  }
}

class SetUnion<T> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_UNION, [this.parent.query, this.other.query]];
  }
}

class SetDifference<T> extends ReQLArray<T> {
  constructor(private parent: Runnable<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_DIFFERENCE, [this.parent.query, this.other.query]];
  }
}

class InsertAt<T> extends ReQLArray<T> {
  constructor(
    private parent: ReQLArray<T>,
    private offset: number,
    private value: T
  ) {
    super();
  }
  get query() {
    return [TermType.INSERT_AT, [this.parent.query, this.offset, this.value]];
  }
}

class DeleteAt<T> extends ReQLArray<T> {
  constructor(
    private parent: ReQLArray<T>,
    private offset: number,
    private endOffset?: number
  ) {
    super();
  }
  get query() {
    return [
      TermType.DELETE_AT,
      [this.parent.query, this.offset].concat(
        this.endOffset ? [this.endOffset] : []
      )
    ];
  }
}

class ChangeAt<T extends Datum, W> extends ReQLArray<W> {
  constructor(
    private parent: ReQLArray<W>,
    private offset: number,
    private value: T
  ) {
    super();
  }
  get query() {
    return [
      TermType.CHANGE_AT,
      [this.parent.query, exprq(this.offset), exprq(this.value)]
    ];
  }
}

class SpliceAt<T> extends ReQLArray<T> {
  constructor(
    private parent: ReQLArray<T>,
    private offset: number,
    private array: ReQLArray<T>
  ) {
    super();
  }
  get query() {
    return [
      TermType.SPLICE_AT,
      [this.parent.query, exprq(this.offset), this.array.query]
    ];
  }
}
