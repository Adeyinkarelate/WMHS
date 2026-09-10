import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/utils/helpers";
import { rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/utils/validators";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`reset:${ip}`, 8).ok) return jsonError("Too many attempts", 429);

  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  const row = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!row || row.used || row.expiresAt < new Date()) {
    return jsonError("This reset link is invalid or has expired", 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { used: true },
    }),
  ]);

  return Response.json({ message: "Password updated. You can sign in now." });
}
