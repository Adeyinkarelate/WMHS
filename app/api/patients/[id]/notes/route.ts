import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, requireUser } from "@/lib/auth/guards";
import { clinicalNoteSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  if (!(await assertPatientAccess(params.id, user))) return jsonError("Forbidden", 403);

  const notes = await prisma.clinicalNote.findMany({
    where: { patientId: params.id },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(notes);
}

export async function POST(req: Request, { params }: Ctx) {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  if (!(await assertPatientAccess(params.id, user))) return jsonError("Forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = clinicalNoteSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  const note = await prisma.clinicalNote.create({
    data: {
      patientId: params.id,
      authorId: user.id,
      content: parsed.data.content.trim(),
    },
    include: { author: { select: { name: true } } },
  });
  return Response.json(note, { status: 201 });
}
