import { Readable } from './readable.ts';
import { TermType } from '../proto.ts';
import { Datum } from './datum.ts';
import { Pathspec } from './pathspec.ts';

export abstract class Sequence<T> extends Readable<T> {
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
}

class Slice<T> extends Sequence<T> {
  constructor(
    private parent: Readable<T>,
    private start: number,
    private end: number
  ) {
    super();
  }
  get query() {
    return [TermType.SLICE, [this.parent.query, this.start, this.end]];
  }
}

class Skip<T> extends Sequence<T> {
  constructor(private parent: Readable<T>, private _skip: number) {
    super();
  }
  get query() {
    return [TermType.SKIP, [this.parent.query, this._skip]];
  }
}

class Limit<T> extends Sequence<T> {
  constructor(private parent: Readable<T>, private length: number) {
    super();
  }
  get query() {
    return [TermType.LIMIT, [this.parent.query, this.length]];
  }
}

class Contains<T> extends Sequence<T> {
  constructor(private parent: Readable<T>, private d: Datum) {
    super();
  }
  get query() {
    return [TermType.CONTAINS, [this.parent.query, this.d]];
  }
}

class GetField<T> extends Sequence<T> {
  constructor(private parent: Readable<T>, private id: string) {
    super();
  }
  get query() {
    return [TermType.GET_FIELD, [this.parent.query, this.id]];
  }
}

class WithFields<T, W> extends Sequence<W> {
  constructor(private parent: Readable<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [TermType.WITH_FIELDS, [this.parent.query, ...this.paths]];
  }
}

class Pluck<T, W> extends Sequence<W> {
  constructor(private parent: Readable<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [TermType.PLUCK, [this.parent.query, ...this.paths]];
  }
}

class Without<T, W> extends Sequence<W> {
  constructor(private parent: Readable<T>, private paths: Pathspec[]) {
    super();
  }
  get query() {
    return [TermType.WITHOUT, [this.parent.query, ...this.paths]];
  }
}
