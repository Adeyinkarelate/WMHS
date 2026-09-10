"""Draw Chapter 4 architecture and interface figures as PNG files."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "diagrams"
NAVY = (11, 31, 58)
NAVY2 = (20, 48, 84)
PRIMARY = (37, 99, 235)
TEAL = (15, 118, 110)
INK = (30, 41, 59)
MUTED = (100, 116, 139)
LINE = (203, 213, 225)
CANVAS = (248, 246, 242)
WHITE = (255, 255, 255)
CREAM = (255, 251, 245)
HIGH = (185, 28, 28)
MED = (217, 119, 6)
LOW = (21, 128, 61)
GREEN_BG = (220, 252, 231)
AMBER_BG = (254, 243, 199)
RED_BG = (254, 226, 226)
BLUE_BG = (219, 234, 254)
TEAL_BG = (204, 251, 241)
PURPLE = (91, 33, 182)
PURPLE_BG = (237, 233, 254)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    names = (
        ["arialbd.ttf", "segoeuib.ttf", "calibrib.ttf"]
        if bold
        else ["arial.ttf", "segoeui.ttf", "calibri.ttf"]
    )
    for name in names:
        path = Path(r"C:\Windows\Fonts") / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def new_canvas(w: int, h: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (w, h), CANVAS)
    return img, ImageDraw.Draw(img)


def rounded(draw: ImageDraw.ImageDraw, box, fill, outline=None, r=14, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def text(draw, xy, s, size=16, fill=INK, bold=False, anchor="lt"):
    draw.text(xy, s, font=font(size, bold), fill=fill, anchor=anchor)


def wrapped(draw, xy, s, size, fill, max_w, bold=False, leading=4):
    f = font(size, bold)
    words = s.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if f.getlength(trial) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=f, fill=fill)
        y += size + leading
    return y


def arrow_down(draw, x, y1, y2, color=NAVY):
    draw.line((x, y1, x, y2 - 8), fill=color, width=3)
    draw.polygon([(x - 7, y2 - 10), (x + 7, y2 - 10), (x, y2)], fill=color)


def arrow_right(draw, x1, y, x2, color=NAVY):
    draw.line((x1, y, x2 - 8, y), fill=color, width=3)
    draw.polygon([(x2 - 10, y - 7), (x2 - 10, y + 7), (x2, y)], fill=color)


def title_bar(draw, w, title, subtitle=None):
    rounded(draw, (24, 18, w - 24, 92 if subtitle else 78), NAVY, r=16)
    text(draw, (w // 2, 40 if subtitle else 48), title, 22, WHITE, True, "mm")
    if subtitle:
        text(draw, (w // 2, 68), subtitle, 13, (191, 219, 254), False, "mm")


def chrome(draw, w, url: str, y0=110):
    rounded(draw, (40, y0, w - 40, y0 + 42), (226, 232, 240), r=10)
    draw.ellipse((56, y0 + 14, 70, y0 + 28), fill=(248, 113, 113))
    draw.ellipse((78, y0 + 14, 92, y0 + 28), fill=(251, 191, 36))
    draw.ellipse((100, y0 + 14, 114, y0 + 28), fill=(74, 222, 128))
    rounded(draw, (130, y0 + 8, w - 56, y0 + 34), WHITE, LINE, 8)
    text(draw, (142, y0 + 21), url, 13, MUTED, False, "lm")


def save(img: Image.Image, name: str):
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    print("wrote", path)


def draw_api_architecture():
    w, h = 1400, 900
    img, d = new_canvas(w, h)
    title_bar(d, w, "API Architecture — WMHS REST Request Flow", "Next.js Route Handlers  ·  JSON over HTTPS")

    cols = [
        (40, "Presentation", PRIMARY, BLUE_BG, [
            "Patient pages",
            "Provider pages",
            "Login / Register",
        ]),
        (370, "Authentication", TEAL, TEAL_BG, [
            "POST /api/auth/register",
            "NextAuth  /api/auth/[...nextauth]",
            "POST /api/auth/forgot-password",
            "GET /api/auth/me",
        ]),
        (720, "Clinical & care APIs", NAVY2, (224, 231, 255), [
            "POST /api/symptoms",
            "POST /api/tests",
            "POST /api/risk/assess",
            "GET /api/facilities/nearby",
            "POST /api/referrals",
            "GET /api/providers/alerts",
            "POST /api/assistant",
        ]),
        (1070, "Data & engine", PURPLE, PURPLE_BG, [
            "Zod validation",
            "Role guards (RBAC)",
            "Clinical risk engine",
            "Haversine matching",
            "Prisma / PostgreSQL",
        ]),
    ]
    for x, heading, accent, bg, items in cols:
        rounded(d, (x, 130, x + 300, 820), WHITE, accent, 16, 2)
        rounded(d, (x, 130, x + 300, 178), accent, r=16)
        d.rectangle((x, 162, x + 300, 178), fill=accent)
        text(d, (x + 150, 154), heading, 16, WHITE, True, "mm")
        y = 200
        for item in items:
            rounded(d, (x + 16, y, x + 284, y + 58), bg, accent, 10)
            wrapped(d, (x + 28, y + 16), item, 14, INK, 240, True)
            y += 72

    for x in (340, 690, 1040):
        arrow_right(d, x, 480, x + 28, PRIMARY)

    text(d, (700, 860), "HTTPS / REST JSON   →   Prisma ORM / SQL   →   Result sets", 14, MUTED, False, "mm")
    save(img, "fig-api-architecture.png")


def draw_risk_pipeline():
    w, h = 1200, 1100
    img, d = new_canvas(w, h)
    title_bar(d, w, "Clinical Risk-Assessment Pipeline", "lib/ai/riskService.ts  ·  runAndStoreRisk()")

    steps = [
        (HIGH, "1. Collect latest records", "Up to 20 symptoms and 30 test results for the patient, plus age, LMP, height, weight and parity."),
        (PRIMARY, "2. Extract 14 features", "Age, SBP, DBP, glucose, heart rate, temperature, and eight danger-sign flags (severity ≥ 2)."),
        (TEAL, "3. Weighted score (0–1)", "Each feature contributes a calibrated weight. Score is clamped to the unit interval."),
        (MED, "4. Classify risk level", "HIGH if score ≥ 0.55 or emergency signs; MEDIUM if score ≥ 0.28; otherwise LOW."),
        (PURPLE, "5. Screen complications", "Pre-eclampsia, gestational diabetes, preterm labour, and emergency screens when indicated."),
        (NAVY, "6. Persist and notify", "Store RiskAssessment. Create Alerts. Notify patient and assigned providers if HIGH."),
    ]
    y = 130
    for i, (color, head, body) in enumerate(steps):
        rounded(d, (80, y, w - 80, y + 120), WHITE, color, 16, 2)
        rounded(d, (80, y, 160, y + 120), color, r=16)
        d.rectangle((144, y, 160, y + 120), fill=color)
        text(d, (120, y + 60), str(i + 1), 28, WHITE, True, "mm")
        text(d, (184, y + 28), head, 20, color, True)
        wrapped(d, (184, y + 58), body, 15, INK, 880)
        if i < len(steps) - 1:
            arrow_down(d, w // 2, y + 122, y + 148, color)
        y += 150
    save(img, "fig-risk-pipeline.png")


def draw_auth_flow():
    w, h = 1300, 860
    img, d = new_canvas(w, h)
    title_bar(d, w, "Authentication and Authorisation Flow", "NextAuth.js JWT  ·  bcryptjs  ·  middleware.ts")

    actors = [
        (50, "User", "Browser"),
        (300, "Login UI", "/login"),
        (550, "NextAuth", "Credentials"),
        (800, "Database", "User table"),
        (1050, "Middleware", "RBAC"),
    ]
    for x, a, b in actors:
        rounded(d, (x, 140, x + 200, 210), NAVY, r=12)
        text(d, (x + 100, 164), a, 16, WHITE, True, "mm")
        text(d, (x + 100, 190), b, 12, (191, 219, 254), False, "mm")

    messages = [
        (1, "1. Submit email and password"),
        (2, "2. Zod validates credentials"),
        (3, "3. Look up user; bcrypt.compare"),
        (4, "4. Issue JWT (8-hour HTTP-only cookie)"),
        (5, "5. Request /patient/* or /provider/*"),
        (6, "6. Verify JWT and role — allow or redirect"),
    ]
    y = 260
    for i, msg in messages:
        x1 = 50 + (0 if i in (1, 5) else 250 if i in (2,) else 500 if i in (3,) else 750 if i in (4,) else 1000)
        # simple stacked boxes
        rounded(d, (80, y, w - 80, y + 70), WHITE, PRIMARY if i % 2 else TEAL, 12)
        text(d, (110, y + 35), msg, 16, INK, True, "lm")
        y += 86

    text(
        d,
        (w // 2, 820),
        "Unauthorised → 401 / redirect to /login     ·     Wrong role → redirect to own dashboard     ·     API guards → 403",
        13,
        MUTED,
        False,
        "mm",
    )
    save(img, "fig-auth-flow.png")


def draw_deployment():
    w, h = 1280, 720
    img, d = new_canvas(w, h)
    title_bar(d, w, "Deployment Architecture", "Vercel application hosting  ·  Neon PostgreSQL")

    boxes = [
        (80, 200, "End users", "Patients and providers\nHTTPS / TLS browsers", PRIMARY, BLUE_BG),
        (480, 200, "Vercel", "Next.js 14 build\nAPI routes + UI\nEnvironment secrets", NAVY, (224, 231, 255)),
        (880, 200, "Neon", "PostgreSQL 16\nPooled connections\nDaily backup / PITR", TEAL, TEAL_BG),
    ]
    for x, y, head, body, accent, bg in boxes:
        rounded(d, (x, y, x + 320, y + 220), WHITE, accent, 18, 3)
        rounded(d, (x, y, x + 320, y + 56), accent, r=18)
        d.rectangle((x, y + 40, x + 320, y + 56), fill=accent)
        text(d, (x + 160, y + 28), head, 20, WHITE, True, "mm")
        wrapped(d, (x + 28, y + 80), body.replace("\n", " · "), 16, INK, 270)

    arrow_right(d, 400, 310, 476, PRIMARY)
    arrow_right(d, 800, 310, 876, TEAL)

    rounded(d, (480, 480, 800, 620), WHITE, MUTED, 14)
    text(d, (640, 510), "GitHub repository", 16, NAVY, True, "mm")
    text(d, (640, 548), "Push to main triggers Vercel build", 14, INK, False, "mm")
    text(d, (640, 580), "prisma generate  ·  next build", 13, MUTED, False, "mm")
    arrow_down(d, 640, 430, 478, MUTED)

    text(d, (w // 2, 680), "NEXTAUTH_SECRET  ·  DATABASE_URL (pooled)  ·  NEXTAUTH_URL", 14, MUTED, False, "mm")
    save(img, "fig-deployment.png")


def sidebar(d, x, y, h, items, active):
    rounded(d, (x, y, x + 200, y + h), NAVY, r=12)
    text(d, (x + 100, y + 28), "WMHS", 16, WHITE, True, "mm")
    yy = y + 56
    for label in items:
        bg = PRIMARY if label == active else NAVY2
        rounded(d, (x + 12, yy, x + 188, yy + 36), bg, r=8)
        text(d, (x + 100, yy + 18), label, 12, WHITE, False, "mm")
        yy += 44


def card(d, box, title=None, accent=None):
    rounded(d, box, WHITE, LINE, 12)
    if title:
        text(d, (box[0] + 16, box[1] + 18), title, 15, accent or NAVY, True)


def draw_patient_dashboard():
    w, h = 1400, 900
    img, d = new_canvas(w, h)
    title_bar(d, w, "Patient Portal — Dashboard", "Implemented route: /patient/dashboard")
    chrome(d, w, "https://localhost:3000/patient/dashboard")
    sidebar(d, 48, 168, 690, ["Dashboard", "Symptoms", "Tests", "Risk results", "Referrals", "Assistant", "Profile"], "Dashboard")
    x0, y0 = 268, 168
    text(d, (x0, y0), "Welcome back", 13, MUTED)
    text(d, (x0, y0 + 28), "Amina Yusuf", 28, NAVY, True)

    # risk / ga / parity
    tiles = [
        (x0, y0 + 80, RED_BG, HIGH, "Risk level", "HIGH", "Score 0.72"),
        (x0 + 360, y0 + 80, BLUE_BG, PRIMARY, "Gestational age", "28w + 3d", "EDD 12 Oct 2026"),
        (x0 + 720, y0 + 80, CREAM, TEAL, "Parity", "1", "Previous births on record"),
    ]
    for x, y, bg, accent, lab, val, hint in tiles:
        rounded(d, (x, y, x + 340, y + 130), bg, accent, 12)
        text(d, (x + 16, y + 18), lab, 13, MUTED)
        text(d, (x + 16, y + 52), val, 26, accent, True)
        text(d, (x + 16, y + 96), hint, 13, INK)

    # buttons
    for i, (lab, fill) in enumerate([("Log symptoms", PRIMARY), ("Upload test", WHITE), ("View referrals", WHITE)]):
        x = x0 + i * 180
        rounded(d, (x, y0 + 230, x + 168, y0 + 268), fill, PRIMARY, 8)
        text(d, (x + 84, y0 + 249), lab, 12, WHITE if fill == PRIMARY else PRIMARY, True, "mm")

    card(d, (x0, y0 + 290, x0 + 530, y0 + 620), "Recent symptoms")
    for i, (s, sev, dt) in enumerate([
        ("Severe headache", "4", "28 Aug 2026"),
        ("Blurred vision", "3", "28 Aug 2026"),
        ("Swelling of face / hands", "2", "27 Aug 2026"),
    ]):
        y = y0 + 340 + i * 70
        text(d, (x0 + 20, y), f"{s}  ·  severity {sev}", 14, INK, True)
        text(d, (x0 + 510, y), dt, 13, MUTED, False, "rm")

    card(d, (x0 + 550, y0 + 290, x0 + 1060, y0 + 620), "Recent tests")
    for i, (s, dt) in enumerate([
        ("Systolic BP: 158 mmHg", "28 Aug 2026"),
        ("Diastolic BP: 102 mmHg", "28 Aug 2026"),
        ("Glucose: 118 mg/dL", "26 Aug 2026"),
    ]):
        y = y0 + 340 + i * 70
        text(d, (x0 + 570, y), s, 14, INK, True)
        text(d, (x0 + 1040, y), dt, 13, MUTED, False, "rm")

    save(img, "fig-patient-dashboard.png")


def draw_registration():
    w, h = 1100, 980
    img, d = new_canvas(w, h)
    title_bar(d, w, "Patient Registration Flow", "Implemented route: /register")
    chrome(d, w, "https://localhost:3000/register")
    rounded(d, (220, 170, 880, 920), WHITE, LINE, 16)
    text(d, (550, 200), "Create your WMHS account", 22, NAVY, True, "mm")
    text(d, (550, 232), "Patient registration — identity and obstetric details", 13, MUTED, False, "mm")
    fields = [
        ("Full name", "Amina Yusuf"),
        ("Email", "amina@example.com"),
        ("Password", "••••••••••"),
        ("I am a", "Pregnant woman / mother"),
        ("Date of birth", "12 / 03 / 1998"),
        ("Phone", "0803 555 0142"),
        ("Residential address", "Surulere, Lagos"),
        ("Last menstrual period (LMP)", "15 / 02 / 2026"),
    ]
    y = 260
    for lab, val in fields:
        text(d, (260, y), lab, 12, NAVY, True)
        rounded(d, (260, y + 20, 840, y + 58), (248, 250, 252), LINE, 8)
        text(d, (276, y + 39), val, 14, INK, False, "lm")
        y += 70
    rounded(d, (260, y + 8, 840, y + 52), PRIMARY, r=10)
    text(d, (550, y + 30), "Create account", 16, WHITE, True, "mm")
    save(img, "fig-registration.png")


def draw_symptom_risk():
    w, h = 1400, 820
    img, d = new_canvas(w, h)
    title_bar(d, w, "Symptom Submission and Risk Results", "/patient/symptoms/new   →   /patient/risk-results")
    chrome(d, w, "https://localhost:3000/patient/symptoms/new")

    rounded(d, (48, 168, 680, 780), WHITE, LINE, 14)
    text(d, (72, 190), "Log a symptom", 22, NAVY, True)
    text(d, (72, 224), "Saving runs the WMHS risk engine on your latest symptoms and vitals.", 13, MUTED)
    fields = [
        ("Date", "30 Aug 2026"),
        ("Symptom", "Severe headache"),
        ("Severity", "4  /  5"),
        ("Notes", "Worse in the morning; lights bother me"),
    ]
    y = 260
    for lab, val in fields:
        text(d, (72, y), lab, 13, NAVY, True)
        rounded(d, (72, y + 22, 640, y + 64), (248, 250, 252), LINE, 8)
        text(d, (88, y + 43), val, 14, INK, False, "lm")
        y += 80
    rounded(d, (72, y + 10, 360, y + 52), PRIMARY, r=8)
    text(d, (216, y + 31), "Save and assess risk", 14, WHITE, True, "mm")

    rounded(d, (710, 168, 1352, 780), WHITE, LINE, 14)
    text(d, (734, 190), "Risk results", 22, NAVY, True)
    text(d, (734, 224), "Assessed 30 Aug 2026, 15:12", 13, MUTED)
    rounded(d, (734, 256, 1040, 400), RED_BG, HIGH, 12)
    text(d, (754, 278), "Risk level", 13, MUTED)
    text(d, (754, 318), "HIGH", 32, HIGH, True)
    text(d, (754, 366), "Score  0.72    ·    RULE BASED", 13, INK)
    rounded(d, (1060, 256, 1328, 400), CREAM, MED, 12)
    text(d, (1080, 278), "Care plan", 13, MUTED)
    wrapped(d, (1080, 308), "Contact your provider today for same-day review. Do not remain alone.", 13, INK, 230)
    text(d, (734, 430), "Risk factors", 16, NAVY, True)
    for i, fct in enumerate([
        "Elevated systolic BP (158 mmHg)",
        "Elevated diastolic BP (102 mmHg)",
        "Severe headache",
        "Blurred vision",
    ]):
        text(d, (750, 468 + i * 32), "•  " + fct, 14, INK)
    text(d, (734, 610), "Suggested actions", 16, NAVY, True)
    for i, fct in enumerate([
        "Repeat blood pressure (both arms, seated)",
        "Urine protein",
        "Seek same-day clinician review",
    ]):
        text(d, (750, 648 + i * 32), "•  " + fct, 14, INK)
    save(img, "fig-symptom-risk.png")


def draw_provider_dashboard():
    w, h = 1400, 880
    img, d = new_canvas(w, h)
    title_bar(d, w, "Provider Dashboard — Caseload", "Implemented route: /provider/dashboard")
    chrome(d, w, "https://localhost:3000/provider/dashboard")
    sidebar(d, 48, 168, 670, ["Caseload", "Patients", "Alerts", "Referrals"], "Caseload")
    x0 = 268
    text(d, (x0, 176), "Caseload", 26, NAVY, True)
    text(d, (x0, 214), "Risk first. Then names.", 13, MUTED)
    stats = [("Patients", "12"), ("High risk", "3"), ("Active alerts", "4"), ("Pending referrals", "2")]
    for i, (lab, val) in enumerate(stats):
        x = x0 + i * 270
        rounded(d, (x, 246, x + 250, 340), WHITE, LINE, 12)
        text(d, (x + 16, 266), lab, 13, MUTED)
        text(d, (x + 16, 298), val, 26, HIGH if i == 1 else NAVY, True)

    rounded(d, (x0, 364, x0 + 700, 820), WHITE, LINE, 12)
    text(d, (x0 + 16, 384), "Risk distribution", 16, NAVY, True)
    # simple bars
    bars = [("Low", 7, LOW), ("Medium", 2, MED), ("High", 3, HIGH)]
    for i, (lab, n, col) in enumerate(bars):
        x = x0 + 80 + i * 200
        bh = n * 36
        rounded(d, (x, 720 - bh, x + 80, 720), col, r=8)
        text(d, (x + 40, 736), lab, 13, MUTED, False, "mm")
        text(d, (x + 40, 700 - bh), str(n), 14, INK, True, "mm")

    rounded(d, (x0 + 720, 364, 1352, 820), WHITE, LINE, 12)
    text(d, (x0 + 736, 384), "Alerts", 16, NAVY, True)
    alerts = [
        ("Amina Yusuf", "PRE ECLAMPSIA  ·  CRITICAL", HIGH),
        ("Fatima Bello", "GESTATIONAL DIABETES  ·  HIGH", MED),
        ("Hadiza Musa", "EMERGENCY  ·  CRITICAL", HIGH),
    ]
    y = 430
    for name, meta, col in alerts:
        rounded(d, (x0 + 740, y, 1336, y + 100), (254, 242, 242) if col == HIGH else AMBER_BG, col, 10)
        text(d, (x0 + 756, y + 28), name, 15, NAVY, True)
        text(d, (x0 + 756, y + 60), meta, 12, col)
        y += 116
    save(img, "fig-provider-dashboard.png")


def draw_referral():
    w, h = 1300, 860
    img, d = new_canvas(w, h)
    title_bar(d, w, "Referral Recommendation Interface", "Haversine distance  ·  /patient/referrals")
    chrome(d, w, "https://localhost:3000/patient/referrals")
    text(d, (56, 176), "Referrals", 26, NAVY, True)
    text(d, (56, 214), "Nearby facilities use the Haversine formula from your saved location.", 14, MUTED)

    rounded(d, (48, 250, 1252, 390), WHITE, LINE, 12)
    text(d, (68, 270), "Your referrals", 16, NAVY, True)
    text(d, (68, 310), "Lagos University Teaching Hospital (LUTH)  —  Raised BP and headache", 15, INK, True)
    text(d, (68, 342), "30 Aug 2026, 15:20", 13, MUTED)
    rounded(d, (1080, 300, 1210, 338), AMBER_BG, MED, 8)
    text(d, (1145, 319), "PENDING", 12, MED, True, "mm")

    text(d, (56, 420), "Nearby facilities", 20, NAVY, True)
    facs = [
        ("Lagos University Teaching Hospital (LUTH)", "1.8 km  ·  CEmONC, Theatre, Blood bank, NICU", True),
        ("Surulere Primary Health Centre", "2.4 km  ·  ANC, Immunisation, BEmONC", False),
        ("University College Hospital Ibadan", "118 km  ·  CEmONC, Maternal ICU", True),
    ]
    y = 460
    for name, meta, em in facs:
        rounded(d, (48, y, 1252, y + 110), WHITE, LINE, 12)
        text(d, (68, y + 28), name, 16, NAVY, True)
        text(d, (68, y + 64), meta, 13, MUTED)
        if em:
            rounded(d, (980, y + 36, 1230, y + 74), GREEN_BG, LOW, 8)
            text(d, (1105, y + 55), "Emergency available", 12, LOW, True, "mm")
        y += 122
    save(img, "fig-referral.png")


def draw_sample_records():
    w, h = 1400, 920
    img, d = new_canvas(w, h)
    title_bar(d, w, "Sample Database Records", "Prisma models  ·  Patients, Symptoms, RiskAssessments")

    def table(x, y, tw, title, headers, rows, col_w):
        rounded(d, (x, y, x + tw, y + 54 + 40 * (len(rows) + 1)), WHITE, NAVY, 10, 2)
        rounded(d, (x, y, x + tw, y + 40), NAVY, r=10)
        d.rectangle((x, y + 24, x + tw, y + 40), fill=NAVY)
        text(d, (x + 16, y + 20), title, 15, WHITE, True, "lm")
        hy = y + 48
        xx = x + 12
        for hname, cw in zip(headers, col_w):
            text(d, (xx, hy), hname, 12, MUTED, True)
            xx += cw
        for i, row in enumerate(rows):
            ry = hy + 28 + i * 40
            if i % 2 == 0:
                d.rectangle((x + 6, ry - 10, x + tw - 6, ry + 26), fill=(241, 245, 249))
            xx = x + 12
            for cell, cw in zip(row, col_w):
                text(d, (xx, ry), cell, 12, INK)
                xx += cw

    table(
        40, 130, 1320, "Patient",
        ["name", "phone", "lmp", "edd", "parity", "city"],
        [
            ["Amina Yusuf", "0803 555 0142", "2026-02-15", "2026-11-22", "1", "Lagos"],
            ["Fatima Bello", "0805 441 2290", "2026-01-08", "2026-10-15", "2", "Kano"],
            ["Hadiza Musa", "0809 220 1188", "2026-03-01", "2026-12-08", "0", "Abuja"],
        ],
        [220, 200, 200, 220, 140, 200],
    )
    table(
        40, 420, 1320, "Symptom",
        ["patient", "symptomType", "severity", "submissionDate"],
        [
            ["Amina Yusuf", "Severe headache", "4", "2026-08-28 09:14"],
            ["Amina Yusuf", "Blurred vision", "3", "2026-08-28 09:16"],
            ["Hadiza Musa", "Vaginal bleeding", "5", "2026-08-29 06:40"],
        ],
        [280, 360, 200, 360],
    )
    table(
        40, 680, 1320, "RiskAssessment",
        ["patient", "riskLevel", "riskScore", "assessmentSource", "assessedAt"],
        [
            ["Amina Yusuf", "HIGH", "0.720", "RULE_BASED", "2026-08-28 09:16"],
            ["Fatima Bello", "MEDIUM", "0.340", "AI_MODEL", "2026-08-27 18:02"],
            ["Hadiza Musa", "HIGH", "0.810", "RULE_BASED", "2026-08-29 06:41"],
        ],
        [260, 180, 180, 280, 280],
    )
    save(img, "fig-sample-records.png")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    draw_api_architecture()
    draw_risk_pipeline()
    draw_auth_flow()
    draw_deployment()
    draw_patient_dashboard()
    draw_registration()
    draw_symptom_risk()
    draw_provider_dashboard()
    draw_referral()
    draw_sample_records()


if __name__ == "__main__":
    main()
