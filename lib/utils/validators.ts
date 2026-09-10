import { z } from "zod";
import { parseDateOnly } from "@/lib/utils/formatters";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["PATIENT", "PROVIDER"]),
    dateOfBirth: z
      .string()
      .optional()
      .refine((value) => !value || Boolean(parseDateOnly(value)), "Enter a valid date of birth"),
    phone: z.string().optional(),
    address: z.string().optional(),
    lmp: z
      .string()
      .optional()
      .refine((value) => !value || Boolean(parseDateOnly(value)), "Enter a valid last menstrual period"),
    parity: z.coerce.number().int().min(0).optional(),
    specialization: z.string().optional(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.role === "PATIENT") {
      if (!data.dateOfBirth) {
        ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth is required" });
      }
      if (!data.phone || data.phone.length < 8) {
        ctx.addIssue({ code: "custom", path: ["phone"], message: "A valid phone number is required" });
      }
      if (!data.address) {
        ctx.addIssue({ code: "custom", path: ["address"], message: "Address is required" });
      }
    }
    if (data.role === "PROVIDER" && !data.specialization) {
      ctx.addIssue({
        code: "custom",
        path: ["specialization"],
        message: "Specialisation is required",
      });
    }
  });

export const symptomSchema = z.object({
  symptomType: z.string().min(1, "Select a symptom"),
  severity: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().default(""),
  submissionDate: z
    .string()
    .min(1, "Date is required")
    .refine((value) => Boolean(parseDateOnly(value)), "Enter a valid date"),
});

export const testResultSchema = z.object({
  testType: z.string().min(1, "Select a test type"),
  resultValue: z.coerce.number(),
  resultUnit: z.string().min(1, "Unit is required"),
  testDate: z
    .string()
    .min(1, "Test date is required")
    .refine((value) => Boolean(parseDateOnly(value)), "Enter a valid test date"),
  notes: z.string().max(2000).optional().default(""),
  fileReference: z.string().optional(),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().optional(),
});

export const clinicalNoteSchema = z.object({
  content: z.string().min(3, "Add a clinical note").max(4000),
});

const optionalCoord = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}, z.number().nullable().optional());

const optionalPositive = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}, z.number().positive().nullable().optional());

export const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().min(3),
  lmp: z
    .string()
    .optional()
    .refine((value) => !value || Boolean(parseDateOnly(value)), "Enter a valid last menstrual period"),
  parity: z.coerce.number().int().min(0).optional(),
  heightCm: optionalPositive,
  weightKg: optionalPositive,
  locationLat: optionalCoord,
  locationLng: optionalCoord,
  preExistingConditions: z.string().optional().default(""),
  notifyAlerts: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const raw = Array.isArray(value) ? value[value.length - 1] : value;
    if (raw === false || raw === "false" || raw === 0 || raw === "0") return false;
    return raw === true || raw === "true" || raw === "on";
  }, z.boolean().optional()),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(8, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const referralStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED"]),
  transportNotes: z.string().optional(),
});

export const alertStatusSchema = z.object({
  status: z.enum(["ACTIVE", "ACKNOWLEDGED", "RESOLVED"]),
  notes: z.string().optional(),
});

export const createAlertSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  alertType: z.enum([
    "PRE_ECLAMPSIA",
    "GESTATIONAL_DIABETES",
    "PRETERM_LABOUR",
    "EMERGENCY",
    "ABNORMAL_VITAL",
    "ANAEMIA",
    "PROTEINURIA",
    "CLINICAL",
  ]),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  notes: z.string().min(3, "Add a clinical note").max(2000),
});
