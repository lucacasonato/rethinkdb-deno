import { connect } from './mod.ts';

const session = await connect({
  hostname: 'rethinkdb.jappieco.ga',
  port: 35285,
  username: 'admin',
  password: 'admin123',
});

