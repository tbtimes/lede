/**
 * A Project groups Pages in a one-to-many relationship. A Project allows the user to specify information common
 * across all Pages.
 *
 * {prop} name – A name for the Project. Is injected into the rendering context.
 * {prop} deployRoot – Defines a root directory for deployment which is prepended to the deployPath for all Pages.
 * {prop} defaults – Defines default {Materials, Blocks, MetaTags} new Pages should be created with.
 * {prop} namespaces – Defines default namespaces to check when looking for {Materials, Bits} in Pages.
 * {prop} pages – List of Pages to which these properties apply.
 * {prop} compilers – Specifies the {html, style, script} compilers that should be used on the Page. Compilers specify
 * a compiler class that should be instantiated and the constructor args that should be passed to it.
 */
interface Project {
  name: string;
  deployRoot: string;
  defaults?: {
    materials?: Material[],
    blocks?: Block[],
    metaTags?: MetaTag[]
  };
  namespaces?: {
    materials?: string[],
    bits?: string[]
  };
  pages: Page[];
  compilers: {
    html: {
      compilerClass: any,
      constructorArg: any
    },
    style: {
      compilerClass: any,
      constructorArg: any
    },
    script: {
      compilerClass: any,
      constructorArg: any
    }
  }
}

/**
 * A Page specifies configuration for one baked html file.
 *
 * {prop} deployPath – Path on which to deploy Page. Appended to Project.deployRoot.
 * {prop} blocks – Ordered list of Blocks to include on Page.
 * {prop} materials – Specifies {script, style, asset} Materials to include on Page. Materials on a Page belong to one
 * of three categories (scripts, styles, or assets) and are arranged in an ordered list. Materials that appear later in
 * the category list will override Materials earlier in the list if they have the same overidableName.
 * {prop} meta – a list of MetaTags to be applied to the Page.
 * {prop} resources – Specifies strings to be inserted in the {head, body} of the Page. Useful for linking scripts or
 * styles from a cdn.
 */
interface Page {
  deployPath: string;
  blocks: Block[];
  materials?: {
    scripts?: Material[];
    styles?: Material[];
    assets?: Material[];
  };
  meta?: MetaTag[];
  resources?: {
    head?: string[],
    body?: string[]
  }
}

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
interface Block {
  bits?: Bit[];
  source?: Resolver;
  context?: any;
  template: string;
}

/**
 * A Bit is essentially the smallest chunk of content on a Page. A Bit is conceptually very similar to a WebComponent.
 * A Bit specifies at most one script, one style, and one html template.
 *
 * {prop} version – Because Bits are shared across Pages, a version allows a Page to explicitly specify which version of
 * a Bit it wants.
 * {prop} namespace – A namespace to which this Bit belongs.
 * {prop} name – A name for the Bit. Properties namespace and name must be unique across all Bits.
 * {prop} context – A context to be injected into the Bit for use in its html and script Materials.
 * {prop} script – Defines a Material of type "script" to associate with this Bit.
 * {prop} style – Defines a Material of type "style" to associate with this Bit.
 * {prop} html – Defines a Material of type "html" to associate with this Bit.
 */
interface Bit {
  version: Number;
  namespace: string;
  name: string;
  context?: any;
  script?: Material;
  style?: Material;
  html?: Material;
}

/**
 * A Material is ...
 * {prop} name – A string specifying the name of the Bit.
 * {prop} content – A string containing the source code for the Material.
 * {prop} version – A number used to version the Bit.
 * {prop} namespace – A string used to namespace a Bit.
 * {prop} type – A string that specifies what type the Material is. Valid values are html, style, or script.
 * {prop} overridableName – A string that allows Bits to simulate inheritance. When a Page is built, Materials are
 * filtered into separate lists according to their type. A Material later in the list with the same overridableName
 * will "override" the Bit earlier in the list.
 */
interface Material {
  name: string;
  content: string;
  version: Number;
  namespace: string;
  type: string;
  overridableName: string;
}

/**
 * A MetaTag is an object is that serialized into the <meta> tags on a Page.
 * {prop} name – Name is a string that is applied to the name attribute.
 * {prop} content – Content is a string that is applied to the content attribute.
 * {prop} props – Props is an array for specifying attributes other than name and content. A prop has attributes attr
 * which turns into the attribute and val which turns into the value for that attribute.
 */
interface MetaTag {
  name?: string;
  content?: string;
  props?: Array<{
    attr: string,
    val: string
  }>;
}

/**
 * A Resolver is used to get Bits from a GoogleDoc.
 * {prop} googleId – The ID of the Google Doc to retrieve.
 * {prop} parser – A function which takes the raw content of the Google Doc and returns an array of Bits.
 */
interface Resolver {
  googleId: string;
  parser: (content: string) => Bit[];
}
