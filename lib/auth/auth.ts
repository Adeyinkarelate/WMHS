import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/utils/validators";
import type { Role } from "@/types";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { patient: true, provider: true },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        // Checked after the password so the message does not reveal which emails exist.
        if (!user.isActive) throw new Error("ACCOUNT_DISABLED");
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          patientId: user.patient?.id,
          providerId: user.provider?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.patientId = user.patientId;
        token.providerId = user.providerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.patientId = token.patientId;
        session.user.providerId = token.providerId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Live account state. JWTs last 8 hours, so role/status changes must not wait for re-login. */
function loadLiveUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      isActive: true,
      role: true,
      patient: { select: { id: true } },
      provider: { select: { id: true } },
    },
  });
}

/**
 * The session with role and profile ids refreshed from the database.
 * A deactivated or deleted account has no session, even if its token is still valid.
 */
export async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const live = await loadLiveUser(session.user.id);
  if (!live || !live.isActive) return null;
  session.user.role = live.role as Role;
  session.user.patientId = live.patient?.id;
  session.user.providerId = live.provider?.id;
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}
