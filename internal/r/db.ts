import { Term } from './readable.ts';
import { Table } from './table.ts';
import { TermType } from '../proto.ts';

export class DB extends Term {
  constructor(private database: string) {
    super();
  }
  get query() {
    return [TermType.DB, [this.database]];
  }
  table<T = any>(table: string) {
    return new Table<T>(this, table);
  }
}
