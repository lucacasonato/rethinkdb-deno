import { TermType } from "../proto.ts";
import { Runnable } from "./runnable.ts";
import { exprq } from "./expr.ts";
import { ReQLArray } from "./array.ts";
import {
  ReQLBool,
  ReQLNumber,
  ReQLString,
  ReQLISO8601,
  ReQLBinary
} from "./datum_primitives.ts";

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
  | ReQLNumber
  | ReQLString
  | ReQLBool
  | ReQLObject
  | ReQLISO8601
  | ReQLBinary
  | ReQLArray<ReQLDatumTypes>;

export type Datum = PrimitiveDatumTypes | ReQLDatumTypes;

export type ReQLObjectTypes =
  | { [k: string]: ReQLDatumTypes }
  | { [k: number]: ReQLDatumTypes };

export abstract class ReQLObject<
  T extends ReQLObjectTypes = ReQLObjectTypes
> extends Runnable<ReQLObject<T>> {}

export class MakeReQLObject extends ReQLObject {
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
