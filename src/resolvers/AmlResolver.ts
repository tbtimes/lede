import { load } from "archieml";
import { Resolver } from "../interfaces";


export default function AmlResolver(googleId: string): Resolver {
  return {
    googleId,
    parser: (content: string) => {
      return load(content);
    }
  };
}