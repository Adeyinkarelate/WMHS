# WMHS Database Entity Breakdown

Logical data dictionary for the Web Maternal Health System. Types are shown in PostgreSQL form for the production data tier. Source: `prisma/schema.prisma`.

**Keys:** PK = primary key. FK = foreign key. UK = unique key. INDEX = secondary index.

## Table 1. Entity catalogue

| Entity | Group | Relationships | Purpose |
|---|---|---|---|
| User | Identity | 1:0..1 Patient or Provider; 1:N Notification, PasswordResetToken | Account, login, and role |
| PasswordResetToken | Identity | N:1 User | One-time password reset tokens |
| Notification | Identity | N:1 User | In-app messages for a user |
| Patient | Care delivery | 1:1 User; 1:N clinical records; N:M Provider | Maternal profile and obstetric data |
| Provider | Care delivery | 1:1 User; N:0..1 Facility; N:M Patient | Clinician profile and facility link |
| PatientAssignment | Care delivery | N:1 Patient; N:1 Provider | Junction of patient and provider caseload |
| Facility | Care delivery | 1:N Provider; 1:N Referral | Health facility used for care and referral |
| Symptom | Clinical records | N:1 Patient | Patient-reported danger signs |
| TestResult | Clinical records | N:1 Patient | Numeric clinical test values |
| RiskAssessment | Clinical records | N:1 Patient | Scored maternal risk result |
| Alert | Clinical records | N:1 Patient | Active or resolved risk alerts |
| Referral | Clinical records | N:1 Patient; N:1 Facility | Referral to a receiving facility |
| AncAttendance | Clinical records | N:1 Patient | Recorded WHO ANC contact attendance |
| ClinicalNote | Clinical records | N:1 Patient; N:1 User | Provider notes on a patient chart |
| OutboundMessage | Notifications | N:0..1 Patient | SMS stub / outbound alert pathway |

## Table 2. User

Stores the root identity. A user is either a patient or a provider, selected by `role`.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| name | VARCHAR | NOT NULL | - | Full display name |
| email | VARCHAR | UK, NOT NULL | - | Login identifier |
| passwordHash | VARCHAR | NOT NULL | - | Hashed password |
| role | VARCHAR | NOT NULL, INDEX | - | PATIENT or PROVIDER |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |
| updatedAt | TIMESTAMP | NOT NULL | auto | Last update timestamp |

## Table 3. PasswordResetToken

Single-use token that lets a user reset a forgotten password.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| userId | UUID | FK, NOT NULL, INDEX | - | References User.id; cascade delete |
| token | VARCHAR | UK, NOT NULL, INDEX | - | Opaque reset token |
| expiresAt | TIMESTAMP | NOT NULL | - | Expiry time |
| used | BOOLEAN | NOT NULL | false | Whether the token has been consumed |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |

## Table 4. Notification

In-app notification delivered to a user (patient or provider).

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| userId | UUID | FK, NOT NULL, INDEX | - | References User.id; cascade delete |
| title | VARCHAR | NOT NULL | - | Notification title |
| content | TEXT | NOT NULL | - | Notification body |
| read | BOOLEAN | NOT NULL, INDEX | false | Read flag |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |

## Table 5. Patient

Maternal profile linked 1:1 to User. Owns symptoms, tests, risk scores, alerts, and referrals.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| userId | UUID | FK, UK, NOT NULL, INDEX | - | References User.id; cascade delete |
| dateOfBirth | TIMESTAMP | NOT NULL | - | Date of birth |
| phone | VARCHAR | NOT NULL | - | Contact telephone |
| address | VARCHAR | NOT NULL | - | Residential address |
| lmp | TIMESTAMP | NULL | - | Last menstrual period |
| edd | TIMESTAMP | NULL | - | Estimated date of delivery |
| parity | INTEGER | NOT NULL | 0 | Number of previous births |
| preExistingConditions | TEXT | NOT NULL | "[]" | JSON array of prior conditions |
| heightCm | DOUBLE | NULL | - | Height in centimetres |
| weightKg | DOUBLE | NULL | - | Weight in kilograms |
| locationLat | DOUBLE | NULL | - | Latitude for nearby-facility search |
| locationLng | DOUBLE | NULL | - | Longitude for nearby-facility search |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |
| updatedAt | TIMESTAMP | NOT NULL | auto | Last update timestamp |

## Table 6. Provider

Clinician profile linked 1:1 to User. Optionally belongs to a facility.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| userId | UUID | FK, UK, NOT NULL, INDEX | - | References User.id; cascade delete |
| specialization | VARCHAR | NOT NULL | - | Clinical specialization |
| facilityId | UUID | FK, NULL, INDEX | - | References Facility.id |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |
| updatedAt | TIMESTAMP | NOT NULL | auto | Last update timestamp |

## Table 7. PatientAssignment

Junction table for the many-to-many caseload between patients and providers. Composite unique key on `(patientId, providerId)`.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| patientId | UUID | FK, NOT NULL, INDEX | - | References Patient.id; cascade delete |
| providerId | UUID | FK, NOT NULL, INDEX | - | References Provider.id; cascade delete |
| createdAt | TIMESTAMP | NOT NULL | now() | Assignment timestamp |

## Table 8. Facility

Health facility that employs providers and receives referrals.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| name | VARCHAR | NOT NULL | - | Facility name |
| address | VARCHAR | NOT NULL | - | Physical address |
| locationLat | DOUBLE | NOT NULL | - | Latitude |
| locationLng | DOUBLE | NOT NULL | - | Longitude |
| servicesOffered | VARCHAR | NOT NULL | - | Services available |
| capacity | INTEGER | NOT NULL | - | Bed or service capacity |
| contactPhone | VARCHAR | NOT NULL | - | Facility telephone |
| emergencyAvailable | BOOLEAN | NOT NULL | false | Emergency service flag |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |
| updatedAt | TIMESTAMP | NOT NULL | auto | Last update timestamp |

## Table 9. Symptom

A danger-sign or symptom logged by a patient at a point in time.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| patientId | UUID | FK, NOT NULL, INDEX | - | References Patient.id; cascade delete |
| symptomType | VARCHAR | NOT NULL | - | Symptom category |
| severity | INTEGER | NOT NULL | - | Severity score |
| notes | TEXT | NOT NULL | "" | Optional clinician or patient notes |
| submissionDate | TIMESTAMP | NOT NULL, INDEX | - | When the symptom was reported |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |

## Table 10. TestResult

A numeric clinical measurement such as blood pressure, glucose, or heart rate.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| patientId | UUID | FK, NOT NULL, INDEX | - | References Patient.id; cascade delete |
| testType | VARCHAR | NOT NULL | - | Test name or code |
| resultValue | DOUBLE | NOT NULL | - | Numeric result |
| resultUnit | VARCHAR | NOT NULL | - | Unit of measurement |
| testDate | TIMESTAMP | NOT NULL, INDEX | - | Date the test was taken |
| fileReference | VARCHAR | NULL | - | Optional attached file path |
| notes | TEXT | NOT NULL | "" | Optional notes |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |

## Table 11. RiskAssessment

Output of the clinical risk engine for one assessment event.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| patientId | UUID | FK, NOT NULL, INDEX | - | References Patient.id; cascade delete |
| riskLevel | VARCHAR | NOT NULL, INDEX | - | Low, Medium, or High |
| riskScore | DOUBLE | NOT NULL | - | Score in the range 0 to 1 |
| riskFactors | TEXT | NOT NULL | - | Serialized contributing factors |
| assessmentSource | VARCHAR | NOT NULL | - | Engine or rule source |
| assessedAt | TIMESTAMP | NOT NULL, INDEX | - | Assessment time |
| recommendations | TEXT | NULL | - | Optional recommended actions |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |

## Table 12. Alert

Operational alert raised when a patient is at elevated risk.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| patientId | UUID | FK, NOT NULL, INDEX | - | References Patient.id; cascade delete |
| alertType | VARCHAR | NOT NULL | - | Alert category |
| severity | VARCHAR | NOT NULL, INDEX | - | Alert severity |
| status | VARCHAR | NOT NULL, INDEX | ACTIVE | ACTIVE or resolved |
| notes | TEXT | NOT NULL | "" | Optional notes |
| alertedAt | TIMESTAMP | NOT NULL | now() | When the alert was raised |
| resolvedAt | TIMESTAMP | NULL | - | When the alert was resolved |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |
| updatedAt | TIMESTAMP | NOT NULL | auto | Last update timestamp |

## Table 13. Referral

Referral of a patient to a receiving facility.

| Attribute | Data type | Constraint | Default | Description |
|---|---|---|---|---|
| id | UUID | PK, NOT NULL | uuid() | Primary key |
| patientId | UUID | FK, NOT NULL, INDEX | - | References Patient.id; cascade delete |
| facilityId | UUID | FK, NOT NULL, INDEX | - | References Facility.id |
| reason | TEXT | NOT NULL | - | Clinical reason for referral |
| status | VARCHAR | NOT NULL, INDEX | PENDING | PENDING or later status |
| transportNotes | TEXT | NOT NULL | "" | Transport or logistics notes |
| referredAt | TIMESTAMP | NOT NULL | now() | Referral time |
| completedAt | TIMESTAMP | NULL | - | Completion time |
| createdAt | TIMESTAMP | NOT NULL | now() | Created timestamp |
| updatedAt | TIMESTAMP | NOT NULL | auto | Last update timestamp |

## Table 14. Relationships

| Parent | Child | Cardinality | Foreign key | On delete | Note |
|---|---|---|---|---|---|
| User | Patient | 1 : 0..1 | Patient.userId | Cascade | Exclusive with Provider by role |
| User | Provider | 1 : 0..1 | Provider.userId | Cascade | Exclusive with Patient by role |
| User | Notification | 1 : N | Notification.userId | Cascade | User receives many notifications |
| User | PasswordResetToken | 1 : N | PasswordResetToken.userId | Cascade | User may have many reset tokens |
| Patient | Provider | N : M | PatientAssignment | Cascade | Unique pair (patientId, providerId) |
| Patient | PatientAssignment | 1 : N | PatientAssignment.patientId | Cascade | Caseload membership |
| Provider | PatientAssignment | 1 : N | PatientAssignment.providerId | Cascade | Caseload membership |
| Facility | Provider | 1 : 0..N | Provider.facilityId | Restrict | Provider facility is optional |
| Patient | Symptom | 1 : N | Symptom.patientId | Cascade | Logged danger signs |
| Patient | TestResult | 1 : N | TestResult.patientId | Cascade | Recorded tests |
| Patient | RiskAssessment | 1 : N | RiskAssessment.patientId | Cascade | Risk engine results |
| Patient | Alert | 1 : N | Alert.patientId | Cascade | Operational alerts |
| Patient | Referral | 1 : N | Referral.patientId | Cascade | Outgoing referrals |
| Facility | Referral | 1 : N | Referral.facilityId | Restrict | Receiving facility |
