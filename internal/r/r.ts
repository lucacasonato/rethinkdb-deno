import { DB, DBCreate, DBDrop, DBList } from "./db.ts";
import { expr } from "./expr.ts";
import { operators } from "./operators.ts";
import { utils } from "./utils.ts";
import { ReQLString } from "./datum.ts";

export const r = {
  expr,
  db(database: string | ReQLString) {
    return new DB(database);
  },
  dbCreate(database: string | ReQLString) {
    return new DBCreate(database);
  },
  dbDrop(database: string | ReQLString) {
    return new DBDrop(database);
  },
  dbList() {
    return new DBList();
  },
  ...operators,
  ...utils
};
