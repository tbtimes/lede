import { S3, s3 } from "aws-sdk";
import { resolve } from "path";
import { createReadStream, renameSync } from "fs-extra";
import { globProm, asyncMap } from "../utils";
import { DependencyAssembler } from "../lede";

const jpgExtensions = ["jpeg", "jpg", "JPG", "JPEG"];
const pngExtensions = ["png", "PNG"];
const allExtensions = jpgExtensions.concat(pngExtensions);

export async function imageCommand({workingDir, args, logger}) {
  let fullscreens = await globProm(`*.{${allExtensions.join(',')}}`, resolve(process.cwd(), "images", "fullscreen"));
  let mugs = await globProm(`*.{${allExtensions.join(',')}}`, resolve(process.cwd(), "images", "mugs"));
  let Bucket = args['b'] || args['bucket'] || "ledejs";
  let clobber = args['c'] || args['clobber'] || false;

  // NORMALIZE FILE EXTENSIONS TO LOWERCASE
  mugs = await lowerCaseExtention({rawImages: mugs, logger, basePath: resolve(process.cwd(), "images", "mugs")});
  fullscreens = await lowerCaseExtention({rawImages: fullscreens, logger, basePath: resolve(process.cwd(), "images", "fullscreen")});

  let settings = null;
  try {
    settings = await DependencyAssembler.gatherSettings(process.cwd());
  } catch (err) {
    logger.error({err}, "An error occurred while reading projectSettings.js");
    process.exit(1);
  }
  let projName = settings.name;

  // Check if any of the images exist on s3 so we don't needlessly wrack up charges :) you're welcome
  if (!clobber) {
    try {
      mugs = await getImagesNotOnS3({Bucket, paths: mugs, logger, Key: `mugs/${projName}/`});
    } catch (err) {
      logger.error({err}, "An error occurred while checking for existing images on s3.");
    }

    try {
      fullscreens = await getImagesNotOnS3({Bucket, paths: fullscreens, logger, Key: `fullscreen/${projName}/`});
    } catch (err) {
      logger.error({err}, "An error occurred while checking for existing images on s3.");
    }
  }

  // GET KEY'S FOR S3 AND PATHS FOR UPLOADING
  let mugPaths = mugs.map(p => {
    return {
      Key: `mugs/${projName}/${p}`,
      path: resolve(process.cwd(), "images", "mugs", p)
    }
  });
  let fullscreenPaths = fullscreens.map(p => {
    return {
      Key: `fullscreen/${projName}/${p}`,
      path: resolve(process.cwd(), "images", "fullscreen", p)
    }
  });

  // UPLOAD THEM ALL
  try {
    await uploadImagesToS3({Bucket, logger, images: mugPaths});
    logger.info("Successfully uploaded all mugshots. It may take up to a minute before the resized images are available.")
  } catch(err) {
    logger.error({err}, "An error occurred while uploading mugshots to s3.");
  }
  try {
    await uploadImagesToS3({Bucket, logger, images: fullscreenPaths});
    logger.info("Successfully uploaded all fullscreen images. It may take up to a minute before the resized images are available.")
  } catch (err) {
    logger.error({err}, "An error occurred while uploading fullscreen images to s3.");
  }
}

async function lowerCaseExtention({rawImages, basePath, logger}) {
  return await asyncMap(rawImages, (path) => {
    let parts = path.split('.');
    let newPath = "";
    let extension = parts[path.split('.').length -1];
    if (jpgExtensions.indexOf(extension) > -1) {
      parts[path.split('.').length - 1] = 'jpg';
      newPath = parts.join('.');
    } else {
      parts[path.split('.').length - 1] = 'png';
      newPath = parts.join('.');
    }
    if (path !== newPath) {
      let toReturn = newPath;
      path = resolve(basePath, path);
      newPath = resolve(basePath, newPath);
      logger.info(`Renaming ${path} to ${newPath}`);

      renameSync(path, newPath);

      return toReturn;
    } else {
      return path;
    }
  });
}

function uploadImagesToS3({Bucket, logger, images}) {
  return new Promise((resolve, reject) => {
    let concurrentUploads = [];
    images.forEach(({Key, path}) => {
      logger.info(`Uploading ${path} to s3.`);
      concurrentUploads.push(new Promise((res, rej) => {
        let upload = new S3.ManagedUpload({
          params: {
            Bucket,
            Key,
            Body: createReadStream(path),
            ACL: "bucket-owner-full-control"
          }
        });
        upload.send((err, data) => {
          logger.debug(data);
          if (err) {
            return rej(err);
          }
          logger.info(`Successfully uploaded ${path}`);
          return res();
        });
      }));
    });

    return resolve(Promise.all(concurrentUploads));
  });
}

function getImagesNotOnS3({Bucket, logger, paths, Key}): Promise<string[]> {
  const s3 = new S3();
  return new Promise((resolve, reject) => {
    // If there's no paths to check, don't bother making the request to S3
    if (!paths) {
      return resolve([]);
    }

    logger.info("Checking s3 for existing images");

    // Make the request to see what images are on S3
    s3.listObjectsV2({Bucket}, (err, data: s3.ListObjectV2Response) => {
      if (err) {
        return reject(err);
      }
      // Get just the image name
      let existing = data.Contents.map(x => {
        if (x.Key.indexOf(Key) > -1) {
          return x.Key.split('/')[x.Key.split('/').length - 1]
        }
        return null;
      });

      // Get list of images that are in paths but not already on s3
      let toPush = paths.filter(x => {
        let exists = existing.indexOf(x) > -1;
        if (exists) {
          logger.info(
            `${x} exists on s3; refusing to upload. To force an upload, run lede image with the --clobber flag`)
        }
        return !exists
      });
      return resolve(toPush)
    });
  });
}