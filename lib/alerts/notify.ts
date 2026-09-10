import { prisma } from "@/lib/db/prisma";
import type { AlertSeverity, NotificationType } from "@/types";

export async function createUserNotification(input: {
  userId: string;
  title: string;
  content: string;
  type?: NotificationType;
  severity?: AlertSeverity | string | null;
  alertId?: string | null;
  link?: string | null;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      content: input.content,
      type: input.type ?? "INFO",
      severity: input.severity ?? null,
      alertId: input.alertId ?? null,
      link: input.link ?? null,
    },
  });
}
