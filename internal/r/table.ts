import { Readable } from './readable.ts';
import { DB } from './db.ts';
import { TermType } from '../proto.ts';
import { SingleSelection, Datum } from './datum.ts';
import { ReQLArray } from './array.ts';
import { StreamSelection } from './stream.ts';

export class Table<T = Datum> extends StreamSelection<T> {
  constructor(private db: DB, private table: string) {
    super();
  }
  get query() {
    return [TermType.TABLE, [this.db.query, this.table]];
  }
  get(id: string) {
    return new Document<T>(this, id);
  }
  getAll(...ids: string[]) {
    return new Documents<T>(this, ids);
  }
}

class Document<T> extends SingleSelection<T> {
  constructor(private parent: Readable<T>, private id: string) {
    super();
  }
  get query() {
    return [TermType.GET, [this.parent.query, this.id]];
  }
}

class Documents<T> extends ReQLArray<T> {
  constructor(private parent: Readable<T>, private ids: string[]) {
    super();
  }
  get query() {
    return [TermType.GET_ALL, [this.parent.query, ...this.ids]];
  }
}
