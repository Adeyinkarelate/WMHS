import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/utils/validators";
import { calculateEdd } from "@/lib/utils/clinical";
import { parseDateOnly } from "@/lib/utils/formatters";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError } from "@/lib/utils/helpers";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`register:${ip}`, 8, 60_000);
  if (!rl.ok) return jsonError("Too many attempts. Try again shortly.", 429);

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return jsonError("An account with that email already exists", 409);

  const dateOfBirth = data.role === "PATIENT" ? parseDateOnly(data.dateOfBirth) : undefined;
  if (data.role === "PATIENT" && !dateOfBirth) {
    return jsonError("Date of birth is required");
  }
  const lmp = parseDateOnly(data.lmp) ?? null;

  const passwordHash = await bcrypt.hash(data.password, 12);
  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: data.name,
          email,
          passwordHash,
          role: data.role,
        },
      });
      if (data.role === "PATIENT") {
        const patient = await tx.patient.create({
          data: {
            userId: created.id,
            dateOfBirth: dateOfBirth!,
            phone: data.phone!,
            address: data.address!,
            lmp,
            edd: lmp ? calculateEdd(lmp) : null,
            parity: data.parity ?? 0,
          },
        });
        const provider = await tx.provider.findFirst();
        if (provider) {
          await tx.patientAssignment.create({
            data: { patientId: patient.id, providerId: provider.id },
          });
        }
      } else {
        const facility = await tx.facility.findFirst();
        const provider = await tx.provider.create({
          data: {
            userId: created.id,
            specialization: data.specialization ?? "General",
            facilityId: facility?.id,
          },
        });
        const unassigned = await tx.patient.findMany({
          where: { assignments: { none: {} } },
          select: { id: true },
        });
        if (unassigned.length) {
          await tx.patientAssignment.createMany({
            data: unassigned.map((p) => ({ patientId: p.id, providerId: provider.id })),
          });
        }
      }
      return created;
    });

    return Response.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (err) {
    console.error("Registration failed", err);
    return jsonError("Could not create the account. Please try again.", 500);
  }
}
