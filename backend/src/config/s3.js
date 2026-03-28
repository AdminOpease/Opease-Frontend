import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.S3_REGION || 'eu-west-2';
const bucket = process.env.S3_BUCKET || 'opease-documents';

const s3 = new S3Client({ region });

/**
 * Generate a presigned URL for uploading a file to S3
 */
export async function getUploadUrl({ key, contentType, expiresIn = 300 }) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

/**
 * Generate a presigned URL for downloading a file from S3
 */
export async function getDownloadUrl({ key, expiresIn = 900 }) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

export { s3, bucket };
