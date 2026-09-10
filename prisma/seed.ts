import bcrypt from "bcryptjs";
import { prisma } from "../lib/db/prisma";
import { calculateEdd } from "../lib/utils/clinical";
import { parseDateOnly } from "../lib/utils/formatters";
import { runAndStoreRisk } from "../lib/ai/runAssessment";
import { toJsonString } from "../lib/utils/json";

const facilities = [
  {
    name: "Lagos University Teaching Hospital (LUTH)",
    address: "Idi-Araba, Surulere, Lagos",
    locationLat: 6.517,
    locationLng: 3.353,
    servicesOffered: ["ANC", "CEmONC", "Theatre", "Blood bank", "NICU"],
    capacity: 760,
    contactPhone: "+234 1 585 0737",
    emergencyAvailable: true,
  },
  {
    name: "National Hospital Abuja",
    address: "Central Business District, Abuja",
    locationLat: 9.041,
    locationLng: 7.492,
    servicesOffered: ["ANC", "CEmONC", "Specialist obstetrics"],
    capacity: 500,
    contactPhone: "+234 9 461 3000",
    emergencyAvailable: true,
  },
  {
    name: "Aminu Kano Teaching Hospital",
    address: "Zaria Road, Kano",
    locationLat: 11.989,
    locationLng: 8.531,
    servicesOffered: ["ANC", "CEmONC", "Blood bank"],
    capacity: 500,
    contactPhone: "+234 64 666 354",
    emergencyAvailable: true,
  },
  {
    name: "University of Port Harcourt Teaching Hospital",
    address: "East-West Road, Port Harcourt",
    locationLat: 4.887,
    locationLng: 6.924,
    servicesOffered: ["ANC", "CEmONC", "NICU"],
    capacity: 400,
    contactPhone: "+234 84 236 888",
    emergencyAvailable: true,
  },
  {
    name: "University College Hospital Ibadan",
    address: "Queen Elizabeth Road, Ibadan",
    locationLat: 7.401,
    locationLng: 3.898,
    servicesOffered: ["ANC", "CEmONC", "Maternal ICU"],
    capacity: 850,
    contactPhone: "+234 2 241 0088",
    emergencyAvailable: true,
  },
  {
    name: "Surulere Primary Health Centre",
    address: "Adeniran Ogunsanya, Surulere, Lagos",
    locationLat: 6.501,
    locationLng: 3.358,
    servicesOffered: ["ANC", "Immunisation", "Basic emergency obstetric care"],
    capacity: 24,
    contactPhone: "+234 803 111 2045",
    emergencyAvailable: false,
  },
];

function day(iso: string) {
  const parsed = parseDateOnly(iso);
  if (!parsed) throw new Error(`Invalid seed date: ${iso}`);
  return parsed;
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.outboundMessage.deleteMany();
  await prisma.clinicalNote.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.symptom.deleteMany();
  await prisma.patientAssignment.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();

  const createdFacilities = [];
  for (const f of facilities) {
    createdFacilities.push(
      await prisma.facility.create({
        data: { ...f, servicesOffered: toJsonString(f.servicesOffered) },
      })
    );
  }
  const luth = createdFacilities[0];

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const providerUser = await prisma.user.create({
    data: {
      name: "Dr. Chioma Okeke",
      email: "provider@wmhs.ng",
      passwordHash,
      role: "PROVIDER",
      provider: {
        create: {
          specialization: "Obstetrics and Gynaecology",
          facilityId: luth.id,
        },
      },
    },
    include: { provider: true },
  });

  const aminaLmp = day("2026-01-15");
  const fatimaLmp = day("2026-03-20");
  const hadizaLmp = day("2026-04-10");

  const amina = await prisma.user.create({
    data: {
      name: "Amina Bello",
      email: "patient@wmhs.ng",
      passwordHash,
      role: "PATIENT",
      patient: {
        create: {
          dateOfBirth: day("1998-06-12"),
          phone: "+234 803 555 0142",
          address: "Ikeja, Lagos",
          lmp: aminaLmp,
          edd: calculateEdd(aminaLmp),
          parity: 1,
          heightCm: 162,
          weightKg: 74,
          locationLat: 6.6018,
          locationLng: 3.3515,
          preExistingConditions: toJsonString(["Previous gestational hypertension"]),
        },
      },
    },
    include: { patient: true },
  });

  const fatima = await prisma.user.create({
    data: {
      name: "Fatima Yusuf",
      email: "fatima@wmhs.ng",
      passwordHash,
      role: "PATIENT",
      patient: {
        create: {
          dateOfBirth: day("2001-11-02"),
          phone: "+234 809 222 1180",
          address: "Gwagwalada, Abuja",
          lmp: fatimaLmp,
          edd: calculateEdd(fatimaLmp),
          parity: 0,
          heightCm: 158,
          weightKg: 61,
          locationLat: 8.95,
          locationLng: 7.07,
          preExistingConditions: toJsonString([]),
        },
      },
    },
    include: { patient: true },
  });

  const hadiza = await prisma.user.create({
    data: {
      name: "Hadiza Mohammed",
      email: "hadiza@wmhs.ng",
      passwordHash,
      role: "PATIENT",
      patient: {
        create: {
          dateOfBirth: day("1987-03-22"),
          phone: "+234 706 441 2290",
          address: "Nassarawa GRA, Kano",
          lmp: hadizaLmp,
          edd: calculateEdd(hadizaLmp),
          parity: 4,
          heightCm: 165,
          weightKg: 88,
          locationLat: 11.996,
          locationLng: 8.522,
          preExistingConditions: toJsonString(["Type 2 diabetes family history"]),
        },
      },
    },
    include: { patient: true },
  });

  const providerId = providerUser.provider!.id;
  for (const p of [amina.patient!, fatima.patient!, hadiza.patient!]) {
    await prisma.patientAssignment.create({
      data: { patientId: p.id, providerId },
    });
  }

  await prisma.symptom.createMany({
    data: [
      {
        patientId: amina.patient!.id,
        symptomType: "Severe Headache",
        severity: 4,
        notes: "Worse in the morning, not relieved by rest",
        submissionDate: day("2026-08-24"),
      },
      {
        patientId: amina.patient!.id,
        symptomType: "Swelling",
        severity: 3,
        notes: "Face and hands",
        submissionDate: day("2026-08-25"),
      },
      {
        patientId: hadiza.patient!.id,
        symptomType: "Dizziness",
        severity: 3,
        notes: "After meals",
        submissionDate: day("2026-08-22"),
      },
      {
        patientId: fatima.patient!.id,
        symptomType: "Nausea / Vomiting",
        severity: 2,
        notes: "Improving",
        submissionDate: day("2026-08-20"),
      },
    ],
  });

  await prisma.testResult.createMany({
    data: [
      {
        patientId: amina.patient!.id,
        testType: "Blood Pressure Systolic",
        resultValue: 148,
        resultUnit: "mmHg",
        testDate: day("2026-08-25"),
      },
      {
        patientId: amina.patient!.id,
        testType: "Blood Pressure Diastolic",
        resultValue: 96,
        resultUnit: "mmHg",
        testDate: day("2026-08-25"),
      },
      {
        patientId: amina.patient!.id,
        testType: "Blood Glucose",
        resultValue: 102,
        resultUnit: "mg/dL",
        testDate: day("2026-08-25"),
      },
      {
        patientId: amina.patient!.id,
        testType: "Heart Rate",
        resultValue: 98,
        resultUnit: "bpm",
        testDate: day("2026-08-25"),
      },
      {
        patientId: amina.patient!.id,
        testType: "Body Temperature",
        resultValue: 36.9,
        resultUnit: "°C",
        testDate: day("2026-08-25"),
      },
      {
        patientId: amina.patient!.id,
        testType: "Urine Protein",
        resultValue: 2,
        resultUnit: "+",
        testDate: day("2026-08-25"),
      },
      {
        patientId: fatima.patient!.id,
        testType: "Blood Pressure Systolic",
        resultValue: 112,
        resultUnit: "mmHg",
        testDate: day("2026-08-21"),
      },
      {
        patientId: fatima.patient!.id,
        testType: "Blood Pressure Diastolic",
        resultValue: 70,
        resultUnit: "mmHg",
        testDate: day("2026-08-21"),
      },
      {
        patientId: fatima.patient!.id,
        testType: "Blood Glucose",
        resultValue: 86,
        resultUnit: "mg/dL",
        testDate: day("2026-08-21"),
      },
      {
        patientId: fatima.patient!.id,
        testType: "Haemoglobin",
        resultValue: 11.4,
        resultUnit: "g/dL",
        testDate: day("2026-08-21"),
      },
      {
        patientId: hadiza.patient!.id,
        testType: "Blood Glucose",
        resultValue: 168,
        resultUnit: "mg/dL",
        testDate: day("2026-08-23"),
      },
      {
        patientId: hadiza.patient!.id,
        testType: "Blood Pressure Systolic",
        resultValue: 128,
        resultUnit: "mmHg",
        testDate: day("2026-08-23"),
      },
      {
        patientId: hadiza.patient!.id,
        testType: "Blood Pressure Diastolic",
        resultValue: 82,
        resultUnit: "mmHg",
        testDate: day("2026-08-23"),
      },
      {
        patientId: hadiza.patient!.id,
        testType: "Haemoglobin",
        resultValue: 9.2,
        resultUnit: "g/dL",
        testDate: day("2026-08-23"),
      },
    ],
  });

  await runAndStoreRisk(amina.patient!.id);
  await runAndStoreRisk(fatima.patient!.id);
  await runAndStoreRisk(hadiza.patient!.id);

  await prisma.referral.create({
    data: {
      patientId: amina.patient!.id,
      facilityId: luth.id,
      reason: "Elevated BP and headache — review for pre-eclampsia",
      status: "PENDING",
      transportNotes: "Family can provide a car; prefer morning slot.",
    },
  });

  await prisma.clinicalNote.create({
    data: {
      patientId: amina.patient!.id,
      authorId: providerUser.id,
      content:
        "BP 148/96 with headache and facial oedema. Protein 2+. Same-day review for pre-eclampsia pathway. Family can transport to LUTH.",
    },
  });

  await prisma.outboundMessage.create({
    data: {
      patientId: amina.patient!.id,
      channel: "SMS",
      toPhone: "+2348035550142",
      body: "WMHS: Pre-eclampsia for Amina Bello. Elevated BP and headache — seek care today if danger signs persist.",
      status: "STUBBED",
      provider: "STUB",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: amina.id,
        title: "Welcome to WMHS",
        content: "Your record is ready. Log symptoms any time.",
      },
      {
        userId: providerUser.id,
        title: "Caseload ready",
        content: "Three assigned patients are on your dashboard.",
      },
    ],
  });

  console.log("Seeded WMHS demo data.");
  console.log("  patient@wmhs.ng / Password123!");
  console.log("  provider@wmhs.ng / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

