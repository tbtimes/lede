export interface MetaTag {
  name?: string;
  content?: string;
  props?: Array<{
    attr: string,
    val: string
  }>;
}