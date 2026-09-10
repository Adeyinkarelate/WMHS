import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";

export async function GET() {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return Response.json(items);
}

export async function PUT(req: Request) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const body = await req.json().catch(() => null);
  if (body?.all) {
    await prisma.notification.updateMany({
      where: { userId: user.id },
      data: { read: true },
    });
    return Response.json({ ok: true });
  }
  const id = String(body?.id ?? "");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });
  const result = await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });
  if (result.count === 0) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
