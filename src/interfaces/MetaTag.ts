/**
 * A MetaTag is an object is that serialized into the <meta> tags on a Page.
 * {prop} name – Name is a string that is applied to the name attribute.
 * {prop} content – Content is a string that is applied to the content attribute.
 * {prop} props – Props is an array for specifying attributes other than name and content. A prop has attributes attr
 * which turns into the attribute and val which turns into the value for that attribute.
 */
export interface MetaTag {
  name?: string;
  content?: string;
  props?: Array<{
    attr: string,
    val: string
  }>;
}