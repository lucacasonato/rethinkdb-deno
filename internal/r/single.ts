import { Runnable } from "./runnable.ts";
import { ReQLNumber, ReQLString } from "./datum_primitives.ts";
import { TermType } from "../proto.ts";
import {
  Object,
  ReQLObject,
  ReQLDatumTypes
} from "./datum.ts";
import { exprq } from "./expr.ts";

export abstract class SingleSelection<
  T extends ReQLDatumTypes
> extends Runnable<T> {
  // TODO(lucacasonato): implement function variant
  update(value: Object) {
    return new Update<T>(this, value);
  }
  delete() {
    return new Delete<T>(this);
  }
  // TODO(lucacasonato): implement replace
}

export type WriteResponse = {
  deleted: ReQLNumber;
  errors: ReQLNumber;
  inserted: ReQLNumber;
  replaced: ReQLNumber;
  skipped: ReQLNumber;
  unchanged: ReQLNumber;
  generated_keys?: ReQLString[];
  changes?: { old_val: ReQLObject; new_val: ReQLObject }[];
  first_error?: string;
};

class Update<T extends ReQLDatumTypes> extends SingleSelection<
  ReQLObject<WriteResponse>
> {
  constructor(private parent: SingleSelection<T>, private value: Object) {
    super();
  }
  get query() {
    return [TermType.UPDATE, [exprq(this.parent), exprq(this.value)]];
  }
}

class Delete<T extends ReQLDatumTypes> extends SingleSelection<
  ReQLObject<WriteResponse>
> {
  constructor(private parent: SingleSelection<T>) {
    super();
  }
  get query() {
    return [TermType.DELETE, [exprq(this.parent)]];
  }
}
