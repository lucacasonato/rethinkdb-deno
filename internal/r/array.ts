import { Readable } from './readable.ts';
import { Sequence } from './sequence.ts';
import { Datum } from './datum.ts';
import { TermType } from '../proto.ts';

export abstract class ReQLArray<T> extends Sequence<T> {
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
}

class Append<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.APPEND, [this.parent.query, this.d]];
  }
}

class Prepend<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.PREPEND, [this.parent.query, this.d]];
  }
}

class Difference<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.DIFFERENCE, [this.parent.query, this.other]];
  }
}

class SetInsert<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.SET_INSERT, [this.parent.query, this.d]];
  }
}

class SetIntersection<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_INTERSECTION, [this.parent.query, this.other]];
  }
}

class SetUnion<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_UNION, [this.parent.query, this.other]];
  }
}

class SetDifference<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private other: ReQLArray<T>) {
    super();
  }
  get query() {
    return [TermType.SET_DIFFERENCE, [this.parent.query, this.other]];
  }
}
