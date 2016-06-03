import { ILoader, ConfigureOptions } from 'nunjucks';

export interface CompilerOptions {
    loaders: Array<ILoader>;
    envOpts: ConfigureOptions;
    filters: Array<Filter>;
    baseContext: Object;
}

export interface Filter {
    name: string;
    func: Function;
    async: boolean;
}