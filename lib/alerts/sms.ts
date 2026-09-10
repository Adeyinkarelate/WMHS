import { prisma } from "@/lib/db/prisma";
import { alertTypeLabel } from "@/lib/alerts/labels";

function digitsOnly(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Critical alerts fan out over SMS. Without a live provider this records a
 * STUBBED row so the demo can show the pathway. Set SMS_PROVIDER=log to keep
 * that behaviour explicit in production deploys.
 */
export async function sendCriticalSms(input: {
  patientId: string;
  phone: string;
  patientName: string;
  alertType: string;
  notes: string;
  alertId: string;
}) {
  const toPhone = digitsOnly(input.phone);
  const body = `WMHS: ${alertTypeLabel(input.alertType)} for ${input.patientName}. ${input.notes.slice(0, 120)} Seek care now if you have danger signs.`;

  await prisma.outboundMessage.create({
    data: {
      patientId: input.patientId,
      channel: "SMS",
      toPhone: toPhone || input.phone,
      body,
      status: "STUBBED",
      provider: process.env.SMS_PROVIDER || "STUB",
      alertId: input.alertId,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("[sms-stub]", toPhone || input.phone, body);
  }
}
