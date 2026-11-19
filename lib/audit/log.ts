import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { toJsonString } from "@/lib/utils/json";
import type { AuditAction } from "@/lib/audit/actions";

/** Either the shared client or a `$transaction` client, so audit rows commit with the change. */
type AuditClient = Pick<PrismaClient, "auditLog">;

export type AuditActor = { id: string; name: string; role: string };

export type AuditEntry = {
  actor: AuditActor;
  action: AuditAction;
  targetType: "USER" | "PATIENT";
  targetId?: string | null;
  targetLabel: string;
  details?: Record<string, unknown>;
};

export async function writeAudit(entry: AuditEntry, client: AuditClient = prisma) {
  return client.auditLog.create({
    data: {
      actorId: entry.actor.id,
      actorName: entry.actor.name,
      actorRole: entry.actor.role,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      targetLabel: entry.targetLabel,
      details: toJsonString(entry.details ?? {}),
    },
  });
}

/**
 * For actions that are not wrapped in a transaction (clinician claim/release).
 * An audit failure is logged but must never undo or block the clinical action.
 */
export async function writeAuditSafe(entry: AuditEntry) {
  try {
    await writeAudit(entry);
  } catch (err) {
    console.error("Audit log write failed", err);
  }
}
