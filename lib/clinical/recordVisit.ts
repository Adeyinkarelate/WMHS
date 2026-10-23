import { prisma } from "@/lib/db/prisma";
import { runAndStoreRisk } from "@/lib/ai/runAssessment";
import { assertOwnedLabAttachment } from "@/lib/media/labOwnership";

export async function saveSymptomAndAssess(input: {
  patientId: string;
  symptomType: string;
  severity: number;
  notes: string;
  submissionDate: Date;
}) {
  const symptom = await prisma.symptom.create({
    data: {
      patientId: input.patientId,
      symptomType: input.symptomType,
      severity: input.severity,
      notes: input.notes,
      submissionDate: input.submissionDate,
    },
  });
  try {
    const { assessment, result } = await runAndStoreRisk(input.patientId);
    return { symptom, assessment, result, warning: null as string | null };
  } catch (err) {
    console.error("Risk assessment failed after symptom save", err);
    return {
      symptom,
      assessment: null,
      result: null,
      warning: "Saved, but risk could not be recalculated.",
    };
  }
}

export async function saveTestAndAssess(input: {
  patientId: string;
  testType: string;
  resultValue: number;
  resultUnit: string;
  testDate: Date;
  notes: string;
  fileReference?: string;
  fileUrl?: string;
  filePublicId?: string;
}) {
  assertOwnedLabAttachment({
    patientId: input.patientId,
    fileUrl: input.fileUrl,
    filePublicId: input.filePublicId,
  });
  const test = await prisma.testResult.create({
    data: {
      patientId: input.patientId,
      testType: input.testType,
      resultValue: input.resultValue,
      resultUnit: input.resultUnit,
      testDate: input.testDate,
      notes: input.notes,
      fileReference: input.fileReference,
      fileUrl: input.fileUrl,
      filePublicId: input.filePublicId,
    },
  });
  try {
    const { assessment, result } = await runAndStoreRisk(input.patientId);
    return { test, assessment, result, warning: null as string | null };
  } catch (err) {
    console.error("Risk assessment failed after test save", err);
    return {
      test,
      assessment: null,
      result: null,
      warning: "Saved, but risk could not be recalculated.",
    };
  }
}
