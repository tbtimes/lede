export interface MaterialRef {
  type?: string;
  id: string;
  as?: string;
}

export interface Material {
  namespace: string;
  type: string;
  path: string;
  name: string;
  overridableName?: string;
}