import { CompilerInitializer, Material, Block, MetaTag } from "./";


export interface ProjectConstructorArg {
  name: string;
  deployRoot: string;
  defaults?: {
    materials?: Material[],
    blocks?: Block[],
    metaTags?: MetaTag[]
  };
  compilers?: {
    html?: CompilerInitializer,
    style?: CompilerInitializer,
    script?: CompilerInitializer
  };
}
