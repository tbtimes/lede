declare module "archieml" {
  function load(s: string, opts?: AmlOpts): string;

  interface AmlOpts {
    comments: boolean;
  }
}