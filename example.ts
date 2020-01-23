import { r, connect } from "./mod.ts";

const session = await connect({
  hostname: "rethinkdb.jappieco.ga",
  port: 35285,
  username: Deno.env()["RETHINK_USER"],
  password: Deno.env()["RETHINK_PASSWORD"]
});

const text = function() {
  return 1 + 1;
};

console.log(text);

const users = await r.do(r.js(`(function() {  return 1 * 20; })`)).run(session);

console.log(users);
