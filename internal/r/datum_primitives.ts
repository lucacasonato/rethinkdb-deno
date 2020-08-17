import { base64 } from "../../deps.ts";
import { Runnable } from "./runnable.ts";
import { TermType } from "../proto.ts";
import { ReQLDatumTypes } from "./datum.ts";

export class ReQLBool extends Runnable<ReQLBool> {
  // deno-lint-ignore no-explicit-any
  constructor(private value?: any) {
    super();
  }
  get query() {
    return this.value;
  }
}

export class ReQLNumber extends Runnable<ReQLNumber> {
  // deno-lint-ignore no-explicit-any
  constructor(private value?: any) {
    super();
  }
  get query() {
    return this.value;
  }
}

export class ReQLString extends Runnable<ReQLString> {
  // deno-lint-ignore no-explicit-any
  constructor(private value?: any) {
    super();
  }
  get query() {
    return this.value;
  }
  // TODO(lucacasonato): implement match
  // TODO(lucacasonato): implement upcase
  // TODO(lucacasonato): implement downcase
  // TODO(lucacasonato): implement split
}

export class ReQLISO8601 extends Runnable<ReQLISO8601> {
  constructor(private date: Date) {
    super();
  }
  get query() {
    return [TermType.ISO8601, [this.date.toISOString()]];
  }
}

export class ReQLBinary extends Runnable<ReQLBinary> {
  constructor(private buffer: ArrayBuffer) {
    super();
  }
  get query() {
    return [
      TermType.BINARY,
      [base64.fromUint8Array(new Uint8Array(this.buffer))],
    ];
  }
}

export abstract class ReQLDatum<
  T extends ReQLDatumTypes = ReQLDatumTypes,
> extends Runnable<T> {}
