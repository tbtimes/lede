import { Logger } from "bunyan";
import { Deployer, CompiledPage } from "../interfaces";
export declare class FileSystemDeployer implements Deployer {
    deployDir: string;
    logger: Logger;
    constructor({workingDir, logger}: {
        workingDir: string;
        logger?: Logger;
    });
    deploy(page: CompiledPage): Promise<any>;
}
