import { v2 as cloudinary } from "cloudinary";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/jpg", "application/pdf"]);
const MAX_BYTES = 8 * 1024 * 1024;

export const LAB_UPLOAD_MAX_BYTES = MAX_BYTES;

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configuredClient() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function assertLabFile(file: { type: string; size: number; name: string }) {
  if (!ALLOWED_MIME.has(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
    throw new Error("Upload a PDF, JPG, or PNG");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Files must be 8 MB or smaller");
  }
}

export async function uploadLabFile(input: {
  buffer: Buffer;
  filename: string;
  folder: string;
}) {
  const client = configuredClient();
  return new Promise<{
    url: string;
    publicId: string;
    resourceType: string;
    format?: string;
  }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: input.folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        filename_override: input.filename,
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
        });
      }
    );
    stream.end(input.buffer);
  });
}
