

export default class AmlResolver {
  called: number;

  constructor() {
    this.called = 0;
  }

  async fetch() {
    this.called += 1;
    return [{ bit: "foo/foobar", context: { foo: "bar" } }];
  }
}