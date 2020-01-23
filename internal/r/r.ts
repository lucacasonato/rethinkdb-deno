import { DB, DBCreate, DBDrop, DBList } from "./db.ts";
import { expr, exprq } from "./expr.ts";
import { operators } from "./operators.ts";
import { SingleSelection } from "./single.ts";
import { ReQLFunction } from "./function.ts";
import { TermType } from "../proto.ts";
import { Datum, ReQLDatum } from "./datum.ts";

export const r = {
  expr,
  db(database: string) {
    return new DB(database);
  },
  dbCreate(database: string) {
    return new DBCreate(database);
  },
  dbDrop(database: string) {
    return new DBDrop(database);
  },
  dbList() {
    return new DBList();
  },
  ...operators
};