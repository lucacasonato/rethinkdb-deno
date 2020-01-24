import { Runnable } from "./runnable.ts";
import { ReQLBool, ReQLString, ReQLNumber } from "./datum_primitives.ts";
import { Object, ReQLObject, ReQLDatumTypes } from "./datum.ts";
import { DB } from "./db.ts";
import { TermType } from "../proto.ts";
import { ReQLArray } from "./array.ts";
import { StreamSelection } from "./stream.ts";
import { WriteResponse, SingleSelection } from "./single.ts";
import { exprq } from "./expr.ts";

export class Table<T extends ReQLDatumTypes> extends StreamSelection<T> {
  constructor(private db: DB, private table: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.TABLE, [exprq(this.db), exprq(this.table)]];
  }
  // TODO(lucacasonato): implement selecting by number
  get(id: string | ReQLString) {
    return new Document<T>(this, id);
  }
  getAll(...ids: (string | ReQLString)[]) {
    return new Documents<T>(this, ids);
  }
  // TODO(lucacasonato): implement inserting a sequence
  insert(value: Object) {
    return new Insert<T>(this, value);
  }
  config() {
    return new TableConfig(this);
  }
  status(): TableStatus {
    return new TableStatus(this);
  }
  wait() {
    return new TableWait(this);
  }
  // TODO(lucacasonato): implement reconfigure
  // TODO(lucacasonato): implement rebalance
  // TODO(lucacasonato): implement sync
  // TODO(lucacasonato): implement grant
  // TODO(lucacasonato): implement indexCreate
  // TODO(lucacasonato): implement indexDrop
  // TODO(lucacasonato): implement indexList
  // TODO(lucacasonato): implement indexStatus
  // TODO(lucacasonato): implement indexWait
  // TODO(lucacasonato): implement indexRename
  // TODO(lucacasonato): implement setWriteHook
  // TODO(lucacasonato): implement getWriteHook
}

export class TableCreate extends ReQLObject<WriteResponse> {
  constructor(private db: DB, private table: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.TABLE_CREATE, [exprq(this.db), exprq(this.table)]];
  }
}

export class TableDrop extends ReQLObject<WriteResponse> {
  constructor(private db: DB, private table: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.TABLE_DROP, [exprq(this.db), exprq(this.table)]];
  }
}

export class TableList extends ReQLArray<ReQLString> {
  constructor(private db: DB) {
    super();
  }
  get query() {
    return [TermType.TABLE_LIST, [exprq(this.db)]];
  }
}

class Document<T extends ReQLDatumTypes> extends SingleSelection<T> {
  constructor(private parent: Runnable<T>, private id: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.GET, [exprq(this.parent), exprq(this.id)]];
  }
}

class Documents<T extends ReQLDatumTypes> extends ReQLArray<T> {
  constructor(
    private parent: Runnable<T>,
    private ids: (string | ReQLString)[]
  ) {
    super();
  }
  get query() {
    return [
      TermType.GET_ALL,
      [exprq(this.parent), ...this.ids.map(s => exprq(s))]
    ];
  }
}

class Insert<T extends ReQLDatumTypes> extends ReQLObject<WriteResponse> {
  constructor(private parent: Runnable<T>, private value: Object) {
    super();
  }
  get query() {
    return [TermType.INSERT, [exprq(this.parent), exprq(this.value)]];
  }
}

export type TableConfigResponse = {
  id: ReQLString;
  name: ReQLString;
  db: ReQLString;
  primary_key: ReQLString;
  shards: ReQLArray<
    ReQLObject<{
      primary_replica: ReQLString;
      replicas: ReQLArray<ReQLString>;
      nonvoting_replicas: ReQLArray<ReQLString>;
    }>
  >;
  indexes: ReQLArray<ReQLString>;
  write_acks: ReQLString;
  durability: ReQLString;
};

export class TableConfig extends SingleSelection<
  ReQLObject<TableConfigResponse>
> {
  constructor(private table: Table<ReQLDatumTypes>) {
    super();
  }
  get query() {
    return [TermType.CONFIG, [this.table.query]];
  }
}

type TableStatusResponse = {
  id: ReQLString;
  name: ReQLString;
  db: ReQLString;
  status: ReQLObject<{
    ready_for_outdated_reads: ReQLBool;
    ready_for_reads: ReQLBool;
    ready_for_writes: ReQLBool;
    all_replicas_ready: ReQLBool;
  }>;
  shards: ReQLArray<
    ReQLObject<{
      primary_replicas: ReQLArray<ReQLString>;
      replicas: ReQLArray<
        ReQLObject<{
          server: ReQLString;
          state: ReQLString;
        }>
      >;
    }>
  >;
};

export class TableStatus extends SingleSelection<
  ReQLObject<TableStatusResponse>
> {
  constructor(private table: Table<ReQLDatumTypes>) {
    super();
  }
  get query() {
    return [TermType.STATUS, [this.table.query]];
  }
}

type TableWaitResponse = {
  ready: ReQLNumber;
};

export class TableWait extends ReQLObject<TableWaitResponse> {
  constructor(private table: Table<ReQLDatumTypes>) {
    super();
  }
  get query() {
    return [TermType.WAIT, [exprq(this.table)]];
  }
}
