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
export interface Material {
  name: string;
  content: string;
  version: Number;
  namespace: string;
  type: string;
  overridableName: string;
}