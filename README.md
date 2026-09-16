# WMHS — Web Maternal Health System

A production-style Next.js 14 application for Nigerian maternal health monitoring. Patients log symptoms and tests, an on-server clinical engine scores risk, and providers manage caseloads, alerts, and referrals.

Visual language is inspired by clinical product sites such as CareNX (trust, whitespace, photography) without copying brand or product names.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS · Framer Motion · Recharts
- NextAuth.js (credentials, JWT, HTTP-only cookies)
- Prisma 5 · Neon PostgreSQL
- Cloudinary (lab file uploads)
- Clinical triage engine in TypeScript (`lib/ai/riskService.ts`)

Python training (`ml/train_model.py`) is optional. Inference does **not** require Python on Vercel.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Patient | `patient@wmhs.ng` | `Password123!` |
| Provider | `provider@wmhs.ng` | `Password123!` |

Additional seeded patients: `fatima@wmhs.ng`, `hadiza@wmhs.ng` (same password).

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Create a Neon project (PostgreSQL), then set `DATABASE_URL` to the **pooled** connection string (`-pooler` host) and `DIRECT_URL` to the **direct** connection string. The app uses the Neon serverless driver adapter. Also set `NEXTAUTH_SECRET` and `JWT_SECRET`.

3. Create a [Cloudinary](https://cloudinary.com) account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Lab files (PDF, JPG, PNG up to 8 MB) upload through `/api/uploads` into the `wmhs/tests` folder. Numeric results still save if you skip the file.

4. Install, migrate, seed, run:

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
```

## Product surfaces

- `/` marketing site
- `/login` `/register` `/forgot-password`
- `/patient/dashboard` symptoms, tests, risk, ANC attendance, printable summary, referrals, history, assistant, profile
- `/patient/referrals` nearby facilities on a map, directions, printable referral letter
- `/login` one-tap supervisor demo (mother / clinician)
- `/provider/dashboard` caseload, patients, alerts, referrals, clinical notes, SMS pathway log

## Clinical engine

Fourteen features (age, SBP, DBP, glucose, heart rate, temperature, eight danger-sign symptoms) produce Low / Medium / High and a 0–1 score. **Missing vitals are skipped** — they are never treated as normal. High risk opens rule-based screens for pre-eclampsia, gestational diabetes, and preterm labour. The risk-results page shows feature contributions. Helpers implement Naegele’s EDD, MAP, BMI, WHO eight-contact ANC timing, and Haversine distance for nearby facilities.

ANC contacts can be marked attended; elapsed visits stay **overdue** until ticked. Critical alerts also write an **SMS stub** (visible on the patient chart) so the notification pathway can be demonstrated without a live SMS vendor. Nearby facilities render on an OpenStreetMap view ranked by Haversine distance.

WMHS is decision support, not a diagnosis and not an emergency dispatch service.

## Deploy (Vercel)

Connect the repo, set the same environment variables (including Cloudinary), run `prisma db push` against Neon, then `prisma db seed`.
