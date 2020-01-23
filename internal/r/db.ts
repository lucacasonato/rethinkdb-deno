import { Term } from "./runnable.ts";
import { Table, TableCreate, TableDrop, TableList } from "./table.ts";
import { TermType } from "../proto.ts";
import { SingleSelection, WriteResponse } from "./single.ts";
import { ReQLArray } from "./array.ts";
import { exprq } from "./expr.ts";
import { ReQLString, Datum } from "./datum.ts";

export class DB extends Term {
  constructor(private database: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.DB, [exprq(this.database)]];
  }
  table<T extends Datum>(table: string | ReQLString) {
    return new Table<T>(this, table);
  }
  tableCreate(table: string | ReQLString) {
    return new TableCreate(this, table);
  }
  tableDrop(table: string | ReQLString) {
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
  constructor(private database: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.DB_CREATE, [exprq(this.database)]];
  }
}

export class DBDrop extends SingleSelection<WriteResponse> {
  constructor(private database: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.DB_DROP, [exprq(this.database)]];
  }
}

export class DBList extends ReQLArray<ReQLString> {
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
    return [TermType.CONFIG, [exprq(this.database)]];
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
    return [TermType.WAIT, [exprq(this.database)]];
  }
}
