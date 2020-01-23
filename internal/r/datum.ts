import { Readable } from './readable.ts';
import { ReQLArray } from './array.ts';

type PrimitveDatum =
  | null
  | boolean
  | number
  | string
  | { [k: string]: any }
  | { [k: number]: any };

export type Datum =
  | PrimitveDatum
  | ReQLObject
  | Array<PrimitveDatum>
  | ReQLArray<PrimitveDatum>;

export type ReQLObject =
  | SingleSelection<{ [k: string]: any }>
  | SingleSelection<{ [k: number]: any }>;

export abstract class SingleSelection<T> extends Readable<T> {}
