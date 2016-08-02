import { S3, s3 } from "aws-sdk";
import { resolve } from "path";
import { createReadStream } from 'fs-extra';
import { globProm } from "../utils";
import { DependencyAssembler } from "../lede";

const s3 = new S3();

export async function imageCommand({workingDir, args, logger}) {
  let fullscreens = await globProm("*.(jpeg|jpg|JPEG|JPG|png|PNG)", resolve(workingDir, "images", "fullscreen"));
  let mugs = await globProm("*.(jpeg|jpg|JPEG|JPG|png|PNG)", resolve(workingDir, "images", "mugs"));
  let Bucket = args['b'] || args['bucket'] || "ledejs";
  let clobber = args['c'] || args['clobber'] || false;
  let settings = await DependencyAssembler.gatherSettings(workingDir);
  let projName = settings.name;

  if (!clobber) {
    mugs = await getImagesNotOnS3({Bucket, paths: mugs, logger});
    fullscreens = await getImagesNotOnS3({Bucket, paths: fullscreens, logger});
  }

  // get full paths to images
  let mugPaths = mugs.map(x => {
    return {
      Key: `mugs/${projName}/${x}`,
      path: resolve(workingDir, "mugs", x)
    }
  });
  let fullscreenPaths = fullscreens.map(x => {
    return {
      Key: `fullscreen/${projName}/${x}`,
      path: resolve(workingDir, "fullscreen", x)
    }
  });

  let mugsResults = await uploadImagesToS3({Bucket, logger, images: mugPaths});
  let fullscreenResults = await uploadImagesToS3({Bucket, logger, images: fullscreenPaths});

  logger.debug(mugsResults, "MUGS");
  logger.debug(fullscreenResults, "FULLSCREEN");
  logger.info("All images have been uploaded to s3 and are being resized right now. It may take up to a minute before the images are available.")
}

function uploadImagesToS3({Bucket, logger, images}) {
  return new Promise((resolve, reject) => {
    let concurrentUploads = [];

    images.forEach( ({ Key, path}) => {
      concurrentUploads.push(new Promise((res, rej) => {
        let upload = new S3.ManagedUpload({params: { Bucket, Key, Body: createReadStream(path), ACL: "bucket-owner-full-control"}});
        upload.send( (err, data) => {
          logger.debug(data);
          if (err) rej(err);
          logger.info(`Successfully uploaded ${path}`);
          res();
        });
      }));
    });

    return resolve(Promise.all(concurrentUploads));
  });
}

function getImagesNotOnS3({Bucket, logger, paths}) {
  return new Promise((resolve, reject) => {
    // If there's no paths to check, don't bother making the request to S3
    if (!paths) {
      resolve([]);
    }

    logger.info("Checking s3 for existing images");

    // Make the request to see what images are on S3
    s3.listObjectsV2({Bucket}, (err, data: s3.ListObjectV2Response) => {
      if (err) {
        reject(err);
      }
      // Get just the image name
      let existing = data.Contents.map(x => x.Key.split('/')[x.Key.split('/').length - 1]);

      // Get list of images that are in paths but not already on s3
      let toPush = paths.filter(x => {
        let exists = existing.indexOf(x) > -1;
        if (exists) {
          logger.info(
            `${x} exists on s3; refusing to upload. To force an upload, run lede image with the --clobber flag`)
        }
        !exists
      });
      resolve(toPush)
    });
  });
}