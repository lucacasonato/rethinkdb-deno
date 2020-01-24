import { Term } from "./runnable.ts";
import { ReQLBool, ReQLNumber, ReQLString, ReQLISO8601, ReQLBinary } from "./datum_primitives.ts";
import {
  ReQLObject,
  ReQLDatumTypes,
  Object,
  Datum,
  MakeReQLObject
} from "./datum.ts";
import { ReQLFunction } from "./function.ts";
import { ReQLDriverError } from "../errors.ts";
import { ReQLArray } from "./array.ts";

export function expr(value: boolean, depth?: number): ReQLBool;
export function expr(value: number, depth?: number): ReQLNumber;
export function expr(value: string, depth?: number): ReQLString;
export function expr(
  value: Datum[] | ReQLArray<ReQLDatumTypes>,
  depth?: number
): ReQLArray<ReQLDatumTypes>;
export function expr(value: Object | ReQLObject, depth?: number): ReQLObject;
export function expr(value: Date, depth?: number): ReQLISO8601;
export function expr(value: ArrayBuffer, depth?: number): ReQLBinary;
export function expr(
  value: Function | ReQLFunction,
  depth?: number
): ReQLFunction;
export function expr<T extends Term>(value: T, depth?: number): T;
export function expr(value: Datum, depth?: number): ReQLDatumTypes;
export function expr(
  value: Datum | Function | ReQLFunction,
  depth?: number
): ReQLDatumTypes | ReQLFunction;
export function expr(
  value: Datum | Function | ReQLFunction,
  depth: number = 20
): ReQLDatumTypes | ReQLFunction {
  if (depth === 0) {
    throw new ReQLDriverError("Nesting depth limit exceeded.");
  }
  if (value === undefined) {
    throw new ReQLDriverError("Cannot wrap undefined with r.expr().");
  }
  if (value === null) {
    return new ReQLString(value);
  }
  if (value instanceof Term) return value;
  if (value instanceof Date) return new ReQLISO8601(value);
  if (value instanceof ArrayBuffer) return new ReQLBinary(value);
  if (Array.isArray(value))
    return new ReQLArray<ReQLDatumTypes>(
      value.map((v: Datum) => expr(v, depth - 1))
    );
  switch (typeof value) {
    case "boolean":
      return new ReQLBool(value);
    case "number":
      return new ReQLNumber(value);
    case "string":
      return new ReQLString(value);
    case "function":
      return new ReQLFunction(value);
    case "object":
      return new MakeReQLObject(value, depth);
  }
}

export function exprq(
  value: Datum | Function | ReQLFunction,
  depth?: number
): any {
  return expr(value, depth).query;
}
