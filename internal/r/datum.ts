import * as base64 from "https://deno.land/x/base64/mod.ts";
import { Term, Runnable } from "./runnable.ts";
import { TermType } from "../proto.ts";
import { expr, exprq } from "./expr.ts";
import { ReQLArray } from "./array.ts";

export type Object = { [k: string]: Datum } | { [k: number]: Datum };

export type PrimitiveDatumTypes =
  | null
  | boolean
  | number
  | string
  | Object
  | Date
  | ArrayBuffer
  | Array<Datum>;

export type ReQLDatumTypes =
  | ReQLDatum
  | ReQLObject
  | ReQLISO8601
  | ReQLBinary
  | ReQLArray<ReQLDatumTypes>;

export type Datum = PrimitiveDatumTypes | ReQLDatumTypes;

export type ReQLDatum = ReQLNumber | ReQLString | ReQLBool;

export class ReQLNumber extends Runnable<number> {
  constructor(private value?: any) {
    super();
  }
  get query() {
    return this.value;
  }
}
export class ReQLString extends Runnable<string> {
  constructor(private value?: any) {
    super();
  }
  get query() {
    return this.value;
  }
}
export class ReQLBool extends Runnable<boolean> {
  constructor(private value?: any) {
    super();
  }
  get query() {
    return this.value;
  }
}

export class ReQLISO8601 extends Term {
  constructor(private date: Date) {
    super();
  }
  get query() {
    return [TermType.ISO8601, [this.date.toISOString()]];
  }
}

export class ReQLBinary extends Term {
  constructor(private buffer: ArrayBuffer) {
    super();
  }
  get query() {
    return [
      TermType.BINARY,
      [base64.fromUint8Array(new Uint8Array(this.buffer))]
    ];
  }
}

export class ReQLObject extends Term {
  constructor(private obj: any, private depth: number) {
    super();
  }
  get query() {
    const args = {};
    for (const key in this.obj) {
      args[key] = exprq(this.obj[key], this.depth - 1);
    }
    return [TermType.MAKE_OBJ, [], args];
  }
}
