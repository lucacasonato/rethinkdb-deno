import { r, connect } from './mod.ts';

const session = await connect({
  hostname: 'rethinkdb.jappieco.ga',
  port: 35285,
  username: Deno.env()['RETHINK_USER'],
  password: Deno.env()['RETHINK_PASSWORD'],
});

interface DatabaseUser {
  id: string;
  password: boolean;
}

const users = await r
  .db('rethinkdb')
  .table<DatabaseUser>('users')
  .getField('id')
  .run(session);

console.log(users);
