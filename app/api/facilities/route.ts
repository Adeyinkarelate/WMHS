import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });
  return Response.json(facilities);
}
