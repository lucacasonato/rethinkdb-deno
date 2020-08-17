import { ReQLString } from "./datum_primitives.ts";
import { DB, DBCreate, DBDrop, DBList } from "./db.ts";
import { expr } from "./expr.ts";
import { operators } from "./operators.ts";
import { time } from "./time.ts";
import { geometry } from "./geometry.ts";
import { utils } from "./utils.ts";

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
  // TODO(lucacasonato): implement grant
  ...operators,
  ...time,
  ...geometry,
  ...utils,
};
