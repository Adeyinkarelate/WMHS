import { requireAdmin } from "@/lib/admin/guard";
import { AdminError, createManagedUser } from "@/lib/admin/users";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { adminCreateUserSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const role = url.searchParams.get("role");

  const users = await prisma.user.findMany({
    where: {
      ...(role && ["PATIENT", "PROVIDER", "ADMIN"].includes(role) ? { role } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    take: 200,
  });
  return Response.json(users);
}

export async function POST(req: Request) {
  const { error, actor } = await requireAdmin();
  if (error || !actor) return error!;
  if (!rateLimit(`admin-create:${actor.id}`, 20, 60_000).ok) {
    return jsonError("Too many attempts. Try again shortly.", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = adminCreateUserSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const user = await createManagedUser({ actor, ...parsed.data });
    return Response.json(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AdminError) return jsonError(err.message, err.status);
    console.error("Admin create user failed", err);
    return jsonError("Could not create the account. Please try again.", 500);
  }
}
