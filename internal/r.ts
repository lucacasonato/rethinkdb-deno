abstract class StreamSelection<T> extends Readable<T> {
  filter(filter: any) {
    return new Filter<T>(this, filter);
  }
  between(lowerKey: any, upperKey: any) {
    return new Between<T>(this, lowerKey, upperKey);
  }
}


class Filter<T> extends StreamSelection<T> {
  constructor(private parent: Readable<T>, private _filter: unknown) {
    super();
  }
  get query() {
    return [TermType.FILTER, [this.parent.query, this.filter]];
  }
}


