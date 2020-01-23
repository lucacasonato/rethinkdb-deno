import { Runnable, Term } from "./runnable.ts";
import { Sequence } from "./sequence.ts";
import { Datum, ReQLNumber } from "./datum.ts";
import { TermType } from "../proto.ts";
import { expr, exprq } from "./expr.ts";

export class ReQLArray<T extends Datum> extends Sequence<T> {
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
  difference(other: T[] | ReQLArray<T>) {
    return new Difference<T>(this, other);
  }
  setInsert(d: Datum) {
    return new SetInsert<T>(this, d);
  }
  setIntersection(other: T[] | ReQLArray<T>) {
    return new SetIntersection<T>(this, other);
  }
  setUnion(other: T[] | ReQLArray<T>) {
    return new SetUnion<T>(this, other);
  }
  setDifference(other: T[] | ReQLArray<T>) {
    return new SetDifference<T>(this, other);
  }
  insertAt(offset: number | ReQLNumber, value: T) {
    return new InsertAt<T>(this, offset, value);
  }
  deleteAt(offset: number | ReQLNumber, endOffset?: number | ReQLNumber) {
    return new DeleteAt<T>(this, offset, endOffset);
  }
  changeAt<W extends Datum>(offset: number | ReQLNumber, value: W) {
    return new ChangeAt<W, T>(this, offset, value);
  }
  spliceAt(offset: number | ReQLNumber, array: T[] | ReQLArray<T>) {
    return new SpliceAt<T>(this, offset, array);
  }
}

class Append<T extends Datum> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.APPEND, [exprq(this.parent), exprq(this.d)]];
  }
}

class Prepend<T extends Datum> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.PREPEND, [exprq(this.parent), exprq(this.d)]];
  }
}

class Difference<T extends Datum> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private other: T[] | ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.DIFFERENCE, [exprq(this.parent), exprq(this.other)]];
  }
}

class SetInsert<T extends Datum> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.SET_INSERT, [exprq(this.parent), exprq(this.d)]];
  }
}

class SetIntersection<T extends Datum> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private other: T[] | ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_INTERSECTION, [exprq(this.parent), exprq(this.other)]];
  }
}

class SetUnion<T extends Datum> extends ReQLArray<T> {
  constructor(private parent: ReQLArray<T>, private other: T[] | ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_UNION, [exprq(this.parent), exprq(this.other)]];
  }
}

class SetDifference<T extends Datum> extends ReQLArray<T> {
  constructor(private parent: Runnable<T>, private other: T[] | ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_DIFFERENCE, [exprq(this.parent), exprq(this.other)]];
  }
}

class InsertAt<T extends Datum> extends ReQLArray<T> {
  constructor(
    private parent: ReQLArray<T>,
    private offset: number | ReQLNumber,
    private value: T
  ) {
    super();
  }
  get query() {
    return [
      TermType.INSERT_AT,
      [exprq(this.parent), exprq(this.offset), exprq(this.value)]
    ];
  }
}

class DeleteAt<T extends Datum> extends ReQLArray<T> {
  constructor(
    private parent: ReQLArray<T>,
    private offset: number | ReQLNumber,
    private endOffset?: number | ReQLNumber
  ) {
    super();
  }
  get query() {
    return [
      TermType.DELETE_AT,
      [exprq(this.parent), exprq(this.offset)].concat(
        this.endOffset ? [exprq(this.endOffset)] : []
      )
    ];
  }
}

class ChangeAt<T extends Datum, W extends Datum> extends ReQLArray<W> {
  constructor(
    private parent: ReQLArray<W>,
    private offset: number | ReQLNumber,
    private value: T
  ) {
    super();
  }
  get query() {
    return [
      TermType.CHANGE_AT,
      [exprq(this.parent), exprq(this.offset), exprq(this.value)]
    ];
  }
}

class SpliceAt<T extends Datum> extends ReQLArray<T> {
  constructor(
    private parent: ReQLArray<T>,
    private offset: number | ReQLNumber,
    private array: T[] | ReQLArray<T>
  ) {
    super();
  }
  get query() {
    return [
      TermType.SPLICE_AT,
      [exprq(this.parent), exprq(this.offset), exprq(this.array)]
    ];
  }
}
