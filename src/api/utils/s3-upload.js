const AWS = require('aws-sdk');
const { AWS_ENV } = require('../../config/vars');
const { v4: uuidv4 } = require('uuid');

const getS3 = () => {
  AWS.config.update({
    accessKeyId: AWS_ENV.S3_KEY_ID,
    secretAccessKey: AWS_ENV.S3_SECRET_KEY,
    region: 'us-east-1',
  });
  return new AWS.S3();
};

const uploadFile = async ({ file, folder, filename, extension, mimetype }) => {
  const s3 = getS3();
  const params = {
    Bucket: AWS_ENV.S3_BUCKET_NAME,
    Body: file,
    Key: `${folder}/${filename}${extension}`,
    ACL: 'public-read',
    ContentType: mimetype,
  };
  try {
    const data = await s3.upload(params).promise();
    return data;
  } catch (err) {
    throw err;
  }
};
const deleteFile = async (key) => {
  const s3 = getS3();
  try {
    await s3
      .deleteObject({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
      })
      .promise();
  } catch (err) {
    throw err;
  }
};
const uploadBadge = async ({ file, mimetype, extension, filename }) => {
  if (!filename) filename = uuidv4();

  try {
    const s3Response = await uploadFile({
      file,
      folder: 'badges',
      filename,
      extension,
      mimetype,
    });
    return { ...s3Response, filename };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  deleteFile,
  uploadBadge
}
