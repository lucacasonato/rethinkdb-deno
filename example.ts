import { r, connect } from "./mod.ts";
import { ReQLString } from "./internal/r/datum_primitives.ts";
import { DBConfig, DBConfigResponse } from "./internal/r/db.ts";

const session = await connect({
  hostname: "localhost",
  port: 28015,
  username: Deno.env.get("RETHINK_USER"),
  password: Deno.env.get("RETHINK_PASSWORD"),
});

const text = function () {
  return 1 + 1;
};

const users = await r
  .db("test")
  .table("test")
  // .count()
  // .run(session);
  .status()
  .run(session);

console.log(users[0]);
