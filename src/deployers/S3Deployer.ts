import { S3 } from "aws-sdk";
import { resolve, basename } from "path";
import { FileSystemDeployer } from "./FileSystemDeployer";
import { ProjectReport, CompiledPage } from "../interfaces";
import { globProm } from "../utils";
import { createReadStream } from "fs-extra";


export class S3Deployer extends FileSystemDeployer {

  constructor(deployDir: string, public bucket, public projName) {
    super(deployDir);
  }

  async deploy(project: {report: ProjectReport, compiledPage: CompiledPage}) {
    await super.deploy(project);
    let toUpload = await globProm('**/*.*', this.deployDir);
    for (let file of toUpload) {
      await S3Deployer.uploadToS3(
        {Bucket: this.bucket, filePath: resolve(this.deployDir, file), Key: `${this.projName}/${file}`})
    }
  }

  static uploadToS3({Bucket, Key, filePath}) {
    let contentType = null;
    let fileType = basename(filePath).split('.')[basename(filePath).split('.').length - 1];
    switch (fileType) {
      case 'json':
        contentType = "application/json";
        break;
      case 'css':
        contentType = "text/css";
        break;
      case 'jpg':
        contentType = "image/jpeg";
        break;
      case 'png':
        contentType = "image/png";
        break;
      case 'html':
        contentType = "text/html";
        break;
      case 'js':
        contentType = "application/javascript";
        break;
      default:
        contentType = "text/plain";
        break;
    }
    return new Promise((resolve, reject) => {
      let upload = new S3.ManagedUpload({
        params: {
          Bucket,
          Key,
          Body: createReadStream(filePath),
          ACL: "bucket-owner-full-control",
          ContentType: contentType
        }
      });
      upload.send((err, data) => {
        if (err) {
          return reject(err)
        }
        return resolve();
      });
    });
  }

}