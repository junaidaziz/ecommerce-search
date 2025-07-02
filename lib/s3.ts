import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET_NAME || '';

const s3 = new S3Client({ region });

export async function uploadFileToS3(
  localPath: string,
  key: string,
  contentType?: string
): Promise<string> {
  const Body = await fs.readFile(localPath);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body,
    ContentType: contentType,
    ACL: 'public-read',
  });
  await s3.send(command);
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType?: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });
  await s3.send(command);
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
