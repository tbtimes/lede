/* tslint:disable */

export interface ContentResolver {
    apiKey: string;
    fileId: string;
    parseFn?: (fileContents: string) => any;
}