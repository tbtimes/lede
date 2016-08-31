/**
 * A Block is a structural element on a Page that is composed of a list of Bits. A Page must have at least one Block
 * (or else it would have a blank body).
 *
 * {prop} bits – An ordered list of Bits to put on the Page.
 * {prop} source – A source specifies where and how a Block gets its Bits. See Resolver.
 * {prop} context – An object passed to the compiler which allows the user to assign arbitrary values to a Block.
 * {prop} template – The html content to be injected for the Block. Block's content has access to property $Block which
 * contains that Block's Bits. This essentially allows a Block to specify a containing div by looping through $Block.bits
 * inside the div. An example with the Nunjucks Compiler:
 * <div class="container">
 *  {% asyncAll $bit in $block.bits %}
 *    {% BIT $bit %}
 *  {% endall %}
 * </div>
 * NOTE: This syntax assumes there is Nunjucks Extension called BIT. Here is not the place ot get into it.
 */
import { Resolver } from "./";
import { Bit } from "../models";


export interface Block {
  bits?: Bit[];
  source?: Resolver;
  context?: any;
  name?: string;
  template: string;
}