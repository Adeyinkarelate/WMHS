const LAB_FOLDER_ROOT = "wmhs/tests";

export function labFolderForPatient(patientId: string) {
  return `${LAB_FOLDER_ROOT}/${patientId}`;
}

export function isOwnedLabPublicId(patientId: string, publicId: string) {
  const prefix = `${labFolderForPatient(patientId)}/`;
  return publicId.startsWith(prefix) && publicId.length > prefix.length;
}

function urlContainsPublicId(fileUrl: string, publicId: string) {
  if (fileUrl.includes(publicId)) return true;
  try {
    return decodeURIComponent(fileUrl).includes(publicId);
  } catch {
    return false;
  }
}

export function assertOwnedLabAttachment(input: {
  patientId: string;
  fileUrl?: string;
  filePublicId?: string;
}) {
  const hasUrl = Boolean(input.fileUrl);
  const hasId = Boolean(input.filePublicId);
  if (!hasUrl && !hasId) return;

  if (!input.fileUrl || !input.filePublicId) {
    throw new Error("Lab file is incomplete. Upload the file again.");
  }
  if (!input.fileUrl.startsWith("https://")) {
    throw new Error("Lab file must be stored over HTTPS.");
  }
  if (!isOwnedLabPublicId(input.patientId, input.filePublicId)) {
    throw new Error("Lab file does not belong to this record.");
  }
  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloud) {
    throw new Error("Lab file storage is not configured.");
  }
  if (!input.fileUrl.includes(`res.cloudinary.com/${cloud}/`)) {
    throw new Error("Lab file must be stored by WMHS.");
  }
  if (!urlContainsPublicId(input.fileUrl, input.filePublicId)) {
    throw new Error("Lab file does not match the uploaded file.");
  }
}
