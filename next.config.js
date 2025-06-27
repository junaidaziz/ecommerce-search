/** @type {import('next').NextConfig} */
const s3Domain = process.env.AWS_S3_BUCKET_NAME
  ? `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
  : null;

const nextConfig = {
  images: {
    domains: [
      'cdn.shopify.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'picsum.photos',
      ...(s3Domain ? [s3Domain] : []),
    ],
  },
};

module.exports = nextConfig;
