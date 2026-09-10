import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, assignedCaseloadWhere, requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";
import { alertStatusSchema, createAlertSchema } from "@/lib/utils/validators";
import { createClinicalAlert, notifyAlertStatusChange } from "@/lib/alerts/createAlert";
import { escalateStaleCriticalAlerts } from "@/lib/alerts/escalate";

export async function GET(req: Request) {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  try {
    await escalateStaleCriticalAlerts();
  } catch (err) {
    console.error("Alert escalation failed", err);
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  const open = url.searchParams.get("open");
  const statusFilter =
    open === "1" ? { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } } : status ? { status } : {};

  const alerts = await prisma.alert.findMany({
    where: {
      ...assignedCaseloadWhere(user),
      ...statusFilter,
      ...(severity ? { severity } : {}),
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
    },
    orderBy: { alertedAt: "desc" },
  });
  return Response.json(alerts);
}

export async function POST(req: Request) {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  const body = await req.json().catch(() => null);
  const parsed = createAlertSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  if (!(await assertPatientAccess(parsed.data.patientId, user))) return jsonError("Forbidden", 403);

  const { alert, created } = await createClinicalAlert({
    ...parsed.data,
    source: "MANUAL",
  });
  if (!created) return jsonError("An open alert of this type already exists for this patient", 409);
  return Response.json(alert, { status: 201 });
}

export async function PUT(req: Request) {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  const parsed = alertStatusSchema.safeParse(body);
  if (!id || !parsed.success) return jsonError("Invalid input");
  const existing = await prisma.alert.findUnique({
    where: { id },
    include: { patient: { include: { user: { select: { id: true, name: true } } } } },
  });
  if (!existing) return jsonError("Not found", 404);
  if (!(await assertPatientAccess(existing.patientId, user))) return jsonError("Forbidden", 403);

  const next = parsed.data.status;
  const alert = await prisma.alert.update({
    where: { id },
    data: {
      status: next,
      notes: parsed.data.notes ?? existing.notes,
      acknowledgedAt: next === "ACKNOWLEDGED" ? new Date() : next === "ACTIVE" ? null : existing.acknowledgedAt,
      acknowledgedById: next === "ACKNOWLEDGED" ? user.id : next === "ACTIVE" ? null : existing.acknowledgedById,
      resolvedAt: next === "RESOLVED" ? new Date() : next === "ACTIVE" ? null : existing.resolvedAt,
      resolvedById: next === "RESOLVED" ? user.id : next === "ACTIVE" ? null : existing.resolvedById,
    },
  });

  if (next === "ACKNOWLEDGED" || next === "RESOLVED") {
    await notifyAlertStatusChange({
      patientUserId: existing.patient.user.id,
      patientId: existing.patientId,
      alertType: existing.alertType,
      status: next,
      clinicianName: user.name ?? "Your clinician",
      notifyPatient: existing.patient.notifyAlerts || existing.severity === "CRITICAL",
    });
  }

  return Response.json(alert);
}
