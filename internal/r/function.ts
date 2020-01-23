import { Term } from "./runnable.ts";
import { TermType } from "../proto.ts";
import { exprq } from "./expr.ts";

export class Var extends Term {
  constructor(private id: number) {
    super();
  }
  get query() {
    return [TermType.VAR, [exprq(this.id)]];
  }
}

export class ReQLFunction extends Term {
  constructor(private func?: Function) {
    super();
  }
  get query() {
    const args = [];
    const argVars = [];
    for (let i = 0; i < this.func.length; i++) {
      args.push(i);
      argVars.push(new Var(i));
    }
    const body: Term = this.func(...argVars);
    return [TermType.FUNC, [exprq(args), body.query]];
  }
}
