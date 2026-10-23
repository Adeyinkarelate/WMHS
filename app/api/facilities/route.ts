import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const facilities = await prisma.facility.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      emergencyAvailable: true,
    },
  });
  return Response.json(facilities);
}
