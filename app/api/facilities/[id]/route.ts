import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { error } = await requireUser();
  if (error) return error;
  const facility = await prisma.facility.findUnique({ where: { id: params.id } });
  if (!facility) return jsonError("Not found", 404);
  return Response.json(facility);
}
