import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

/** Authoritative admin gate: getSession() carries the live database role. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "PATIENT") redirect("/patient/dashboard");
  if (session.user.role !== "ADMIN") redirect("/provider/dashboard");
  return <AdminShell name={session.user.name ?? "Administrator"}>{children}</AdminShell>;
}
