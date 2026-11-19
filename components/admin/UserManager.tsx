"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/shared/Avatar";
import { Icons } from "@/components/shared/Icons";
import { roleLabel } from "@/lib/audit/describe";
import { formatDate } from "@/lib/utils/formatters";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  detail: string | null;
};

type Facility = { id: string; name: string };

const roleTone = { PATIENT: "info", PROVIDER: "default", ADMIN: "warning" } as const;

export function UserManager({
  users,
  facilities,
  currentUserId,
}: {
  users: ManagedUser[];
  facilities: Facility[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [newRole, setNewRole] = useState("PROVIDER");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ = !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      return matchQ && (roleFilter === "ALL" || u.role === roleFilter);
    });
  }, [users, q, roleFilter]);

  async function patch(user: ManagedUser, body: { role?: string; isActive?: boolean }) {
    setBusy(user.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not update this user.");
        return;
      }
      setNotice(
        body.role
          ? `${user.name} is now ${roleLabel(body.role).toLowerCase()}.`
          : body.isActive
            ? `${user.name} can sign in again.`
            : `${user.name} can no longer sign in.`
      );
      router.refresh();
    } catch {
      setError("Could not update this user.");
    } finally {
      setBusy(null);
    }
  }

  function changeRole(user: ManagedUser, role: string) {
    if (role === user.role) return;
    const ok = window.confirm(
      `Change ${user.name} from ${roleLabel(user.role)} to ${roleLabel(role)}? Their access changes immediately.`
    );
    if (ok) void patch(user, { role });
  }

  function toggleActive(user: ManagedUser) {
    const next = !user.isActive;
    const warning =
      !next && user.role === "PROVIDER"
        ? ` Their mothers return to the waiting list.`
        : "";
    const ok = window.confirm(
      `${next ? "Reactivate" : "Deactivate"} ${user.name}?${next ? " They can sign in again." : ` They are signed out and cannot sign in.${warning}`}`
    );
    if (ok) void patch(user, { isActive: next });
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setError("");
    setNotice("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload: Record<string, string> = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      role: newRole,
    };
    if (newRole === "PROVIDER") {
      payload.specialization = String(data.get("specialization") ?? "");
      payload.facilityId = String(data.get("facilityId") ?? "");
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(typeof body.error === "string" ? body.error : "Could not create the account.");
        return;
      }
      form.reset();
      setCreating(false);
      setNewRole("PROVIDER");
      setNotice(`${body.name} was added as ${roleLabel(body.role).toLowerCase()}. Share the temporary password securely.`);
      router.refresh();
    } catch {
      setFormError("Could not create the account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {notice && (
        <p className="rounded-xl bg-success-soft px-3 py-2 text-sm text-success-ink" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Add a user</CardTitle>
            <p className="mt-1 text-sm text-ink-muted">
              Create a clinician or administrator account. Mothers register themselves.
            </p>
          </div>
          <Button type="button" variant={creating ? "outline" : "primary"} size="sm" onClick={() => {
              setCreating((v) => !v);
              setFormError("");
              setError("");
              setNotice("");
            }}
          >
            {creating ? "Cancel" : (
              <>
                <Icons.plus size={16} />
                New user
              </>
            )}
          </Button>
        </div>
        {creating && (
          <form onSubmit={onCreate} className="mt-5 grid gap-4 sm:grid-cols-2">
            {formError && (
              <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink sm:col-span-2" role="alert">
                {formError}
              </p>
            )}
            <Input name="name" label="Full name" required autoComplete="off" />
            <Input name="email" type="email" label="Email" required autoComplete="off" />
            <Input
              name="password"
              type="password"
              label="Temporary password"
              hint="At least 8 characters. Share it securely."
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Select
              name="role"
              label="Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: "PROVIDER", label: "Clinician" },
                { value: "ADMIN", label: "Administrator" },
              ]}
            />
            {newRole === "PROVIDER" && (
              <>
                <Input name="specialization" label="Specialisation" required placeholder="Obstetrics and Gynaecology" />
                <Select
                  name="facilityId"
                  label="Facility"
                  required
                  defaultValue=""
                  placeholder="Select a facility"
                  options={facilities.map((f) => ({ value: f.id, label: f.name }))}
                />
              </>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>
                Create account
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Input label="Search users" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" />
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All roles" },
              { value: "PATIENT", label: "Mothers" },
              { value: "PROVIDER", label: "Clinicians" },
              { value: "ADMIN", label: "Administrators" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-caption uppercase text-ink-muted">
                <th className="py-2 pr-4 font-semibold">User</th>
                <th className="py-2 pr-4 font-semibold">Role</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 font-semibold">Joined</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-ink-muted">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const canReRole = u.role !== "PATIENT" && !isSelf;
                  return (
                    <tr key={u.id} className="border-b border-line align-middle last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block font-semibold text-navy">
                              {u.name}
                              {isSelf && <span className="ml-2 text-caption font-normal text-ink-muted">(you)</span>}
                            </span>
                            <span className="block truncate text-caption text-ink-muted">{u.email}</span>
                            {u.detail && <span className="block text-caption text-ink-muted">{u.detail}</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={roleTone[u.role as keyof typeof roleTone] ?? "default"}>{roleLabel(u.role)}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Deactivated"}</Badge>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-ink-muted">{formatDate(u.createdAt)}</td>
                      <td className="py-3">
                        {isSelf ? (
                          <span className="text-caption text-ink-muted">Your own account</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            {canReRole && (
                              <select
                                aria-label={`Role for ${u.name}`}
                                value={u.role}
                                disabled={busy === u.id || !u.isActive}
                                title={u.isActive ? undefined : "Reactivate this account before changing its role"}
                                onChange={(e) => changeRole(u, e.target.value)}
                                className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink shadow-sm"
                              >
                                <option value="PROVIDER">Clinician</option>
                                <option value="ADMIN">Administrator</option>
                              </select>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant={u.isActive ? "outline" : "primary"}
                              loading={busy === u.id}
                              onClick={() => toggleActive(u)}
                            >
                              {u.isActive ? "Deactivate" : "Reactivate"}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
