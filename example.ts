import { r, connect } from "./mod.ts";

const session = await connect({
  hostname: "rethinkdb.jappieco.ga",
  port: 35285,
  username: Deno.env()["RETHINK_USER"],
  password: Deno.env()["RETHINK_PASSWORD"]
});

const users = await r.do((s) => r.eq(s, 1), 1).run(session);

console.log(users);
