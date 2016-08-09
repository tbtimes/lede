import { getCompilers, getPaths } from "./devCommand";
import { resolve } from "path";
import { S3Deployer } from "../deployers";
import { Lede } from "../lede";


export async function stageCommand({workingDir, args, logger}) {
  let name = args['n'] || args['name'];
  let port = args['x'] || args['port'] || 8000;
  if (!name) {
    logger.error("Must specify a project with the -n command");
    process.exit(1);
  }
  let {servePath, buildPath} = await getPaths(workingDir, name, logger);
  let compilerPath = args['c'] || args['compilers'] || resolve(workingDir, "compilers", "compilerConfig.js");
  let compilers = await getCompilers(compilerPath, logger);
  let lede = new Lede(buildPath, compilers,
    {stage: new S3Deployer(servePath, "project-preview", name)}, logger);
  await lede.deploy("stage", true);
  logger.info("Deployed");
}


