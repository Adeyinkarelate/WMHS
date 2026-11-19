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
| Administrator | `admin@wmhs.ng` | `Password123!` |

Additional seeded patients: `fatima@wmhs.ng`, `hadiza@wmhs.ng` (same password).

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Create a Neon project (PostgreSQL), then set `DATABASE_URL` to the **pooled** connection string (`-pooler` host) and `DIRECT_URL` to the **direct** connection string. The app uses the Neon serverless driver adapter. Set `NEXTAUTH_SECRET` to a long random string.

3. Create a [Cloudinary](https://cloudinary.com) account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Lab files (PDF, JPG, PNG up to 8 MB) upload through `/api/uploads` into `wmhs/tests/{patientId}`. Numeric results still save if you skip the file.

4. For production, set `PROVIDER_INVITE_CODE` so only invited clinicians can register. Leave it empty on a local machine. Demo one-tap login is hidden in production unless `NEXT_PUBLIC_SHOW_DEMO_LOGIN=true`.

5. Install, migrate, seed, run:

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
- `/provider/patients/[id]` chart with visit entry (symptoms, vitals) and clinician-created referrals
- `/terms` `/privacy` NDPR-aligned notices linked from registration
- `/admin/dashboard` system overview: user counts by role, unassigned mothers, open alerts, recent activity
- `/admin/users` create clinician or administrator accounts, change a role, deactivate or reactivate sign-in
- `/admin/assignments` assign, move or release a mother's named clinician (the mother is notified)
- `/admin/audit` append-only log of account, role and assignment changes, filterable and paginated

## Administration and access control

Three roles: **Mother**, **Clinician**, **Administrator**.

- **Live role checks.** Sessions are JWTs, but `getSession()` re-reads the role and active flag from the database. A role change or deactivation takes effect on the next request, not after re-login. `/admin` and `/api/admin/*` require the live `ADMIN` role.
- **Deactivation.** A deactivated account cannot sign in (the login form explains why) and loses any existing session. Deactivating a clinician ends their assignments so mothers return to the facility waiting list and are notified.
- **Role rules** (`lib/admin/rules.ts`, unit tested). Mother accounts are never re-roled. Only clinician and administrator roles are assignable. Administrators cannot change their own role or status, and the last active administrator cannot be demoted or deactivated. An administrator can only become a clinician if they have a clinician profile.
- **Assignments.** A clinician sees only mothers with an active assignment to them. Clinicians claim mothers from their own facility's waiting list; administrators can assign across facilities, which replaces the current primary clinician in one transaction.
- **Audit log.** `AuditLog` records the actor (name and role snapshot), action, target and details for user creation, role changes, deactivation and reactivation, and every clinician or administrator assignment change. Admin changes are written in the same database transaction as the change itself.

Administrators also have read oversight of clinical pages (alert notifications link to them). A dedicated clinical audit trail for every read is out of scope.

## Clinical engine

Fourteen features (age, SBP, DBP, glucose, heart rate, temperature, eight danger-sign symptoms) produce Low / Medium / High and a 0–1 score. **Missing vitals are skipped** — they are never treated as normal. High risk opens rule-based screens for pre-eclampsia, gestational diabetes, and preterm labour. The risk-results page shows feature contributions. Helpers implement Naegele’s EDD, MAP, BMI, WHO eight-contact ANC timing, and Haversine distance for nearby facilities.

ANC contacts can be marked attended; elapsed visits stay **overdue** until ticked. Critical alerts also write an **SMS stub** (visible on the patient chart) so the notification pathway can be demonstrated without a live SMS vendor. Nearby facilities render on an OpenStreetMap view ranked by Haversine distance.

WMHS is decision support, not a diagnosis and not an emergency dispatch service.

## Deploy (Vercel)

Connect the repo, set the same environment variables (including Cloudinary), run `prisma db push` against Neon, then `prisma db seed`.
