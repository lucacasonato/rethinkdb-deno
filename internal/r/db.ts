import { Term } from "./runnable.ts";
import { Table, TableCreate, TableDrop, TableList } from "./table.ts";
import { TermType } from "../proto.ts";
import { SingleSelection, WriteResponse } from "./single.ts";
import { ReQLArray } from "./array.ts";
import { expr, exprq } from "./expr.ts";

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
  tableCreate(table: string) {
    return new TableCreate(this, table);
  }
  tableDrop(table: string) {
    return new TableDrop(this, table);
  }
  tableList() {
    return new TableList(this);
  }
  config() {
    return new DBConfig(this);
  }
  wait() {
    return new DBWait(this);
  }
}

export class DBCreate extends SingleSelection<WriteResponse> {
  constructor(private database: string) {
    super();
  }
  get query() {
    return [TermType.DB_CREATE, [exprq(this.database)]];
  }
}

export class DBDrop extends SingleSelection<WriteResponse> {
  constructor(private database: string) {
    super();
  }
  get query() {
    return [TermType.DB_DROP, [exprq(this.database)]];
  }
}

export class DBList extends ReQLArray<string> {
  constructor() {
    super();
  }
  get query() {
    return [TermType.DB_LIST];
  }
}

export interface DBConfigResponse {
  id: string;
  name: string;
}

export class DBConfig extends SingleSelection<DBConfigResponse> {
  constructor(private database: DB) {
    super();
  }
  get query() {
    return [TermType.CONFIG, [this.database.query]];
  }
}

interface DBWaitResponse {
  ready: number;
}

export class DBWait extends SingleSelection<DBWaitResponse> {
  constructor(private database: DB) {
    super();
  }
  get query() {
    return [TermType.WAIT, [this.database.query]];
  }
}
