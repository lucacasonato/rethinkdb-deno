import { Runnable } from "./runnable.ts";
import { DB } from "./db.ts";
import { TermType } from "../proto.ts";
import { Datum, Object, ReQLString } from "./datum.ts";
import { ReQLArray } from "./array.ts";
import { StreamSelection } from "./stream.ts";
import { WriteResponse, SingleSelection } from "./single.ts";
import { expr, exprq } from "./expr.ts";

export class Table<T extends Datum> extends StreamSelection<T> {
  constructor(private db: DB, private table: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.TABLE, [exprq(this.db), exprq(this.table)]];
  }
  get(id: string | ReQLString) {
    return new Document<T>(this, id);
  }
  getAll(...ids: (string | ReQLString)[]) {
    return new Documents<T>(this, ids);
  }
  insert(value: Object) {
    return new Insert<T>(this, value);
  }
  config() {
    return new TableConfig(this);
  }
  status() {
    return new TableStatus(this);
  }
  wait() {
    return new TableWait(this);
  }
}

export class TableCreate extends SingleSelection<WriteResponse> {
  constructor(private db: DB, private table: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.TABLE_CREATE, [exprq(this.db), exprq(this.table)]];
  }
}

export class TableDrop extends SingleSelection<WriteResponse> {
  constructor(private db: DB, private table: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.TABLE_DROP, [exprq(this.db), exprq(this.table)]];
  }
}

export class TableList extends SingleSelection<string> {
  constructor(private db: DB) {
    super();
  }
  get query() {
    return [TermType.TABLE_LIST, [exprq(this.db)]];
  }
}

class Document<T extends Datum> extends SingleSelection<T> {
  constructor(private parent: Runnable<T>, private id: string | ReQLString) {
    super();
  }
  get query() {
    return [TermType.GET, [exprq(this.parent), exprq(this.id)]];
  }
}

class Documents<T extends Datum> extends ReQLArray<T> {
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

class Insert<T> extends SingleSelection<WriteResponse> {
  constructor(private parent: Runnable<T>, private value: Object) {
    super();
  }
  get query() {
    return [TermType.INSERT, [exprq(this.parent), exprq(this.value)]];
  }
}

export interface TableConfigResponse {
  id: string;
  name: string;
  db: string;
  primary_key: string;
  shards: {
    primary_replica: string;
    replicas: string[];
    nonvoting_replicas: string[];
  }[];
  indexes: string[];
  write_acks: "majority" | "single";
  durability: "soft" | "hard";
}

export class TableConfig extends SingleSelection<TableConfigResponse> {
  constructor(private table: Table<any>) {
    super();
  }
  get query() {
    return [TermType.CONFIG, [this.table.query]];
  }
}

interface TableStatusResponse {
  id: string;
  name: string;
  db: string;
  status: {
    ready_for_outdated_reads: boolean;
    ready_for_reads: boolean;
    ready_for_writes: boolean;
    all_replicas_ready: boolean;
  };
  shards: {
    primary_replicas: string[];
    replicas: {
      server: string;
      state:
        | "ready"
        | "transitioning"
        | "backfilling"
        | "disconnected"
        | "waiting_for_primary"
        | "waiting_for_quorum";
    }[];
  }[];
}

export class TableStatus extends SingleSelection<TableStatusResponse> {
  constructor(private table: Table<any>) {
    super();
  }
  get query() {
    return [TermType.STATUS, [this.table.query]];
  }
}

interface TableWaitResponse {
  ready: number;
}

export class TableWait extends SingleSelection<TableWaitResponse> {
  constructor(private table: Table<any>) {
    super();
  }
  get query() {
    return [TermType.WAIT, [exprq(this.table)]];
  }
}
