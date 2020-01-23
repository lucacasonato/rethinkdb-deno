import { Runnable } from "./runnable.ts";
import { TermType } from "../proto.ts";
import { Object } from "./datum.ts";
import { exprq } from "./expr.ts";

export abstract class SingleSelection<T> extends Runnable<T> {
  update(value: Object) {
    return new Update<T>(this, value);
  }
  delete(value: Object) {
    return new Delete<T>(this);
  }
}

export interface WriteResponse {
  deleted: 0;
  errors: 0;
  inserted: 1;
  replaced: 0;
  skipped: 0;
  unchanged: 0;
  generated_keys?: string[];
  changes?: { old_val: Object; new_val: Object }[];
  first_error?: string;
}

class Update<T> extends SingleSelection<WriteResponse> {
  constructor(private parent: SingleSelection<T>, private value: Object) {
    super();
  }
  get query() {
    return [TermType.UPDATE, [exprq(this.parent), exprq(this.value)]];
  }
}

class Delete<T> extends SingleSelection<WriteResponse> {
  constructor(private parent: SingleSelection<T>) {
    super();
  }
  get query() {
    return [TermType.DELETE, [exprq(this.parent)]];
  }
}
