import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/utils/helpers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`forgot:${ip}`, 5).ok) return jsonError("Too many attempts", 429);

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "")
    .toLowerCase()
    .trim();
  if (!email) return jsonError("Email is required");

  const user = await prisma.user.findUnique({ where: { email } });
  const message = "If that email exists, a reset path was created.";
  if (!user) return Response.json({ message });

  const token = crypto.randomBytes(24).toString("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    }),
  ]);

  const payload: Record<string, string> = { message };
  if (process.env.NODE_ENV !== "production") payload.token = token;
  return Response.json(payload);
}
