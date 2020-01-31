

export interface Resolver {
  fetch(p: ResolverParams): Promise<Buffer>;
}

export interface ResolverParams {

}
