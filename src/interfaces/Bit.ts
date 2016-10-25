

export interface BitSettings {
  name: string;
  namespace: string;
  context?: any;
  script: string;
  style: string;
  html: string;
}

export interface BitRef {
  bit: string;
  context?: any;
}