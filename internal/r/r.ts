import { DB } from './db.ts';

export const r = {
  db(database: string): DB {
    return new DB(database);
  },
};
