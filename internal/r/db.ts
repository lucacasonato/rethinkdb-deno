import { Term } from "./runnable.ts";
import { ReQLString, ReQLNumber } from "./datum_primitives.ts";
import { Table, TableCreate, TableDrop, TableList } from "./table.ts";
import { TermType } from "../proto.ts";
import { SingleSelection, WriteResponse } from "./single.ts";
import { ReQLArray } from "./array.ts";
import { exprq } from "./expr.ts";
import { ReQLObject, ReQLDatumTypes } from "./datum.ts";

export class DB extends Term {
  constructor(private database: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.DB, [exprq(this.database)]];
  }
  table<T extends ReQLDatumTypes>(table: string | ReQLString) {
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
  // TODO(lucacasonato): implement reconfigure
  // TODO(lucacasonato): implement rebalance
  // TODO(lucacasonato): implement grant
}

export class DBCreate extends ReQLObject<WriteResponse> {
  constructor(private database: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.DB_CREATE, [exprq(this.database)]];
  }
}

export class DBDrop extends ReQLObject<WriteResponse> {
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

export type DBConfigResponse = {
  id: ReQLString;
  name: ReQLString;
};

export class DBConfig extends SingleSelection<ReQLObject<DBConfigResponse>> {
  constructor(private database: DB) {
    super();
  }
  get query() {
    return [TermType.CONFIG, [exprq(this.database)]];
  }
}

type DBWaitResponse = {
  ready: ReQLNumber;
};

export class DBWait extends ReQLObject<DBWaitResponse> {
  constructor(private database: DB) {
    super();
  }
  get query() {
    return [TermType.WAIT, [exprq(this.database)]];
  }
}
