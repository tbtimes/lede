export interface MaterialRef {
  type?: string;
  id: string;
  as?: string;
}

export interface CacheableMat {
  globals: Material[];
  bits: string[];
  cache: Material[];
}

export interface Material {
  namespace: string;
  type: string;
  path: string;
  name: string;
  overridableName?: string;
}