import { foo } from "./Foo";
// @ts-ignore
import { bar } from "./Bar";

export function baz() {
  return `${foo()} ${bar()} baz`;
}