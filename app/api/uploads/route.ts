import { assertPatientAccess, requireUser, resolveRecordPatientId } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";
import { assertLabFile, isCloudinaryConfigured, uploadLabFile } from "@/lib/cloudinary";
import { labFolderForPatient } from "@/lib/media/labOwnership";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { error, user } = await requireUser(["PATIENT", "PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  if (!isCloudinaryConfigured()) {
    return jsonError("File uploads need Cloudinary credentials on the server.", 503);
  }

  const ip = req.headers.get("x-forwarded-for") ?? user.id;
  if (!rateLimit(`upload:${ip}`, 10, 60_000).ok) return jsonError("Too many uploads", 429);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return jsonError("Choose a lab file to upload");

  try {
    assertLabFile(file);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Invalid file");
  }

  const patientId = resolveRecordPatientId(user, String(form?.get("patientId") ?? ""));
  if (!patientId) return jsonError("Choose a patient record before uploading a lab file");
  if (!(await assertPatientAccess(patientId, user))) return jsonError("Forbidden", 403);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadLabFile({
      buffer,
      filename: file.name,
      folder: labFolderForPatient(patientId),
    });
    return Response.json({
      url: uploaded.url,
      publicId: uploaded.publicId,
      fileName: file.name,
    });
  } catch (err) {
    console.error("Cloudinary upload failed", err);
    return jsonError("Could not store that file. Try again.", 502);
  }
}
