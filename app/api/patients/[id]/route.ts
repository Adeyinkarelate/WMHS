import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireUser, assertPatientAccess } from "@/lib/auth/guards";
import { passwordChangeSchema, profileSchema } from "@/lib/utils/validators";
import { calculateEdd } from "@/lib/utils/clinical";
import { parseDateOnly } from "@/lib/utils/formatters";
import { jsonError } from "@/lib/utils/helpers";
import { fromJsonString, toJsonString } from "@/lib/utils/json";
import { runAndStoreRisk } from "@/lib/ai/runAssessment";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const allowed = await assertPatientAccess(params.id, user);
  if (!allowed) return jsonError("Forbidden", 403);

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, role: true } },
      riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
    },
  });
  if (!patient) return jsonError("Not found", 404);
  return Response.json({
    ...patient,
    preExistingConditions: fromJsonString<string[]>(patient.preExistingConditions, []),
  });
}

export async function PUT(req: Request, { params }: Ctx) {
  const { error, user } = await requireUser(["PATIENT", "ADMIN"]);
  if (error || !user) return error!;
  if (user.role === "PATIENT" && user.patientId !== params.id) return jsonError("Forbidden", 403);

  const body = await req.json().catch(() => null);
  if (body?.currentPassword) {
    const parsed = passwordChangeSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return jsonError("Not found", 404);
    const ok = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
    if (!ok) return jsonError("Current password is incorrect", 401);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) },
    });
    return Response.json({ ok: true });
  }

  const existing = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError("Not found", 404);
  if (!(await assertPatientAccess(params.id, user))) return jsonError("Forbidden", 403);

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  const lmpRaw = parsed.data.lmp?.trim() ?? "";
  const lmp = parseDateOnly(parsed.data.lmp);
  if (lmpRaw && !lmp) return jsonError("Enter a valid last menstrual period");

  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: {
      phone: parsed.data.phone,
      address: parsed.data.address,
      lmp: lmp ?? null,
      edd: lmp ? calculateEdd(lmp) : null,
      parity: parsed.data.parity,
      heightCm: parsed.data.heightCm ?? null,
      weightKg: parsed.data.weightKg ?? null,
      locationLat: parsed.data.locationLat ?? null,
      locationLng: parsed.data.locationLng ?? null,
      ...(parsed.data.notifyAlerts === undefined ? {} : { notifyAlerts: parsed.data.notifyAlerts }),
      preExistingConditions: toJsonString(
        parsed.data.preExistingConditions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    },
  });
  await prisma.user.update({
    where: { id: existing.userId },
    data: { name: parsed.data.name },
  });

  const hadAssessment = await prisma.riskAssessment.count({ where: { patientId: params.id } });
  if (hadAssessment) {
    try {
      await runAndStoreRisk(params.id);
    } catch (err) {
      console.error("Risk assessment failed after profile save", err);
    }
  }

  return Response.json({
    ...patient,
    preExistingConditions: fromJsonString<string[]>(patient.preExistingConditions, []),
  });
}
