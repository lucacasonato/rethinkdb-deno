import { connect } from "./mod.ts";

const session = await connect({
  hostname: "rethinkdb.jappieco.ga",
  port: 35285,
  username: Deno.env()["RETHINK_USER"],
  password: Deno.env()["RETHINK_PASSWORD"]
});

const encoder = new TextEncoder();
const msg = encoder.encode(`[1,[15,[[14,["rethinkdb"]],"users"]],{}]`);
await session.write(
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, msg.length, 0, 0, 0, ...msg])
);
console.log(await session.read(8));
const sizeBuffer = await session.read(4);
const size = new Uint32Array(sizeBuffer.buffer)[0];
console.log(size);
const decoder = new TextDecoder();
console.log(decoder.decode(await session.read(size)));
