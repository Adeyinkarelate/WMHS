import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, requireUser } from "@/lib/auth/guards";
import { ancAttendanceSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";

type Ctx = { params: { id: string } };

export async function POST(req: Request, { params }: Ctx) {
  const { error, user } = await requireUser(["PATIENT", "PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  if (!(await assertPatientAccess(params.id, user))) return jsonError("Forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = ancAttendanceSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    select: { id: true, lmp: true },
  });
  if (!patient) return jsonError("Not found", 404);
  if (!patient.lmp) return jsonError("Add a last menstrual period before recording ANC contacts.");

  const { contact, attended, notes } = parsed.data;

  if (!attended) {
    await prisma.ancAttendance.deleteMany({
      where: { patientId: params.id, contact },
    });
    return Response.json({ contact, attended: false });
  }

  const row = await prisma.ancAttendance.upsert({
    where: { patientId_contact: { patientId: params.id, contact } },
    create: {
      patientId: params.id,
      contact,
      notes: notes?.trim() ?? "",
      markedById: user.id,
    },
    update: {
      attendedAt: new Date(),
      notes: notes?.trim() ?? "",
      markedById: user.id,
    },
  });

  return Response.json({ contact, attended: true, attendedAt: row.attendedAt }, { status: 201 });
}
