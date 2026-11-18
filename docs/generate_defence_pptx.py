"""Generate WMHS-MIT899-Defence.pptx — 12-slide master's defence deck."""
from __future__ import annotations

from pathlib import Path

from lxml import etree
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
DIAG = ROOT / "docs" / "diagrams"
OUT = ROOT / "WMHS-MIT899-Defence.pptx"

# WMHS tokens (tailwind.config.ts)
NAVY = RGBColor(0x0B, 0x1F, 0x3A)
NAVY2 = RGBColor(0x16, 0x3A, 0x66)
GOLD = RGBColor(0xD4, 0xBC, 0x8A)
GOLD_DARK = RGBColor(0xB8, 0x9E, 0x6C)
SAGE = RGBColor(0x2F, 0x6B, 0x5D)
SAGE_SOFT = RGBColor(0xE7, 0xF1, 0xEE)
PRIMARY = RGBColor(0x1A, 0x56, 0xB0)
PRIMARY_SOFT = RGBColor(0xE8, 0xF0, 0xFA)
CANVAS = RGBColor(0xF3, 0xF5, 0xF8)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
INK = RGBColor(0x13, 0x20, 0x33)
MUTED = RGBColor(0x5B, 0x6B, 0x7C)
LINE = RGBColor(0xD4, 0xDC, 0xE6)
DANGER = RGBColor(0xB4, 0x23, 0x18)
DANGER_SOFT = RGBColor(0xF8, 0xE8, 0xE6)
SUCCESS = RGBColor(0x1F, 0x7A, 0x4D)
SUCCESS_SOFT = RGBColor(0xE6, 0xF4, 0xEC)
WARNING = RGBColor(0xB8, 0x78, 0x14)
WARNING_SOFT = RGBColor(0xF7, 0xF0, 0xE0)

W, H = Inches(13.333), Inches(7.5)
SLIDE_W, SLIDE_H = 13.333, 7.5
FONT = "Calibri"
FONT_HEAD = "Calibri"


def rgb_hex(c: RGBColor) -> str:
    return f"{c[0]:02X}{c[1]:02X}{c[2]:02X}"


def set_fill(shape, color: RGBColor):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color


def no_line(shape):
    shape.line.fill.background()


def set_line(shape, color: RGBColor, pt: float = 1.0):
    shape.line.color.rgb = color
    shape.line.width = Pt(pt)


def round_rect(slide, l, t, w, h, fill, line=None, radius=0.08):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    set_fill(shape, fill)
    if line is None:
        no_line(shape)
    else:
        set_line(shape, line, 1)
    try:
        shape.adjustments[0] = radius
    except Exception:
        pass
    shape.shadow.inherit = False
    return shape


def rect(slide, l, t, w, h, fill, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    set_fill(shape, fill)
    if line is None:
        no_line(shape)
    else:
        set_line(shape, line, 1)
    shape.shadow.inherit = False
    return shape


def _run(p, text, size, color, bold=False, italic=False, font=FONT):
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("a:rFonts"))
    if rFonts is None:
        rFonts = etree.SubElement(rPr, qn("a:rFonts"))
    rFonts.set("ascii", font)
    rFonts.set("hAnsi", font)
    rFonts.set("eastAsia", font)
    rFonts.set("cs", font)
    return run


def textbox(
    slide,
    l,
    t,
    w,
    h,
    text,
    size=14,
    color=INK,
    bold=False,
    italic=False,
    align=PP_ALIGN.LEFT,
    anchor=MSO_ANCHOR.TOP,
    font=FONT,
):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    try:
        tf._txBody.bodyPr.set("anchor", {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}[anchor])
    except Exception:
        pass
    p = tf.paragraphs[0]
    p.alignment = align
    p.clear()
    _run(p, text, size, color, bold, italic, font)
    return box


def multiline(
    slide,
    l,
    t,
    w,
    h,
    lines,
    size=14,
    color=INK,
    bold=False,
    align=PP_ALIGN.LEFT,
    spacing=1.08,
    font=FONT,
):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(4)
        p.line_spacing = spacing
        p.clear()
        if isinstance(line, tuple):
            txt, *opts = line
            _run(
                p,
                txt,
                opts[0] if opts else size,
                opts[1] if len(opts) > 1 else color,
                opts[2] if len(opts) > 2 else bold,
                False,
                font,
            )
        else:
            _run(p, line, size, color, bold, False, font)
    return box


def add_notes(slide, text: str):
    notes = slide.notes_slide
    notes.notes_text_frame.text = text.strip()


def footer(slide, n: int, kicker: str):
    rect(slide, Inches(0), Inches(7.28), W, Inches(0.22), NAVY)
    rect(slide, Inches(0), Inches(7.28), Inches(0.18), Inches(0.22), GOLD)
    textbox(
        slide,
        Inches(0.4),
        Inches(7.29),
        Inches(9.2),
        Inches(0.2),
        f"University of Lagos  ·  MIT899  ·  WMHS  ·  {kicker}",
        size=10,
        color=GOLD,
        font=FONT_HEAD,
    )
    textbox(
        slide,
        Inches(11.55),
        Inches(7.29),
        Inches(1.5),
        Inches(0.2),
        f"{n}  /  12",
        size=10,
        color=WHITE,
        align=PP_ALIGN.RIGHT,
        font=FONT_HEAD,
    )


def header(slide, kicker: str, title: str, subtitle: str | None = None):
    rect(slide, Inches(0), Inches(0), W, Inches(0.08), GOLD)
    rect(slide, Inches(0), Inches(0.08), W, Inches(1.08), NAVY)
    textbox(
        slide,
        Inches(0.5),
        Inches(0.16),
        Inches(12.2),
        Inches(0.28),
        kicker.upper(),
        size=11,
        color=GOLD,
        bold=True,
        font=FONT_HEAD,
    )
    textbox(
        slide,
        Inches(0.5),
        Inches(0.40),
        Inches(12.2),
        Inches(0.42),
        title,
        size=24,
        color=WHITE,
        bold=True,
        font=FONT_HEAD,
    )
    if subtitle:
        textbox(
            slide,
            Inches(0.5),
            Inches(0.84),
            Inches(12.2),
            Inches(0.26),
            subtitle,
            size=12,
            color=GOLD,
            italic=True,
        )


def content_bg(slide):
    rect(slide, Inches(0), Inches(0), W, H, CANVAS)


def pill(slide, l, t, w, h, text, fill, color=WHITE):
    round_rect(slide, l, t, w, h, fill, radius=0.5)
    textbox(slide, l, t, w, h, text, size=11, color=color, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=FONT_HEAD)


def card(slide, l, t, w, h, fill=WHITE, accent=None):
    shape = round_rect(slide, l, t, w, h, fill, LINE, radius=0.06)
    if accent:
        rect(slide, l, t, Inches(0.08), h, accent)
    return shape


def styled_table(slide, l, t, w, h, headers, rows, col_widths=None, font_size=12):
    table_shape = slide.shapes.add_table(1 + len(rows), len(headers), l, t, w, h)
    table = table_shape.table
    if col_widths:
        for i, cw in enumerate(col_widths):
            table.columns[i].width = cw
    for i, htxt in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = ""
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.LEFT
        _run(p, htxt, font_size, WHITE, True, font=FONT_HEAD)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY
        _set_cell_margin(cell)
    for r, row in enumerate(rows):
        for c, val in enumerate(row):
            cell = table.cell(r + 1, c)
            cell.text = ""
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT
            _run(p, str(val), font_size, INK, False)
            cell.fill.solid()
            cell.fill.fore_color.rgb = WHITE if r % 2 == 0 else RGBColor(0xEE, 0xF2, 0xF6)
            _set_cell_margin(cell)
    return table_shape


def _set_cell_margin(cell):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    for m, v in (("marL", "90000"), ("marR", "90000"), ("marT", "60000"), ("marB", "60000")):
        attr = qn(f"a:{m}")
        # set on tcMar if present
    tcMar = tcPr.find(qn("a:tcMar"))
    if tcMar is None:
        tcMar = etree.SubElement(tcPr, qn("a:tcMar"))
    for edge, emu in (("lnL", "90000"), ("lnR", "90000"), ("t", "70000"), ("b", "70000")):
        el = tcMar.find(qn(f"a:{edge}"))
        if el is None:
            el = etree.SubElement(tcMar, qn(f"a:{edge}"))
        el.set("sz", "0")  # dummy
        # python-pptx uses a:marL etc. Keep simple: skip if schema differs.


def picture_fit(slide, path: Path, l, t, max_w, max_h, center=False):
    """Place a PNG inside a box without overflowing the footer."""
    if not path.exists():
        return None
    iw, ih = Image.open(path).size
    aspect = iw / ih
    w = float(max_w)
    h = w / aspect
    if h > float(max_h):
        h = float(max_h)
        w = h * aspect
    x = float(l) + ((float(max_w) - w) / 2 if center else 0)
    return slide.shapes.add_picture(str(path), Inches(x), Inches(t), width=Inches(w), height=Inches(h))


def new_slide(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])  # blank


# ---------------------------------------------------------------------------
# Slides
# ---------------------------------------------------------------------------

def slide_01_title(prs):
    s = new_slide(prs)
    rect(s, Inches(0), Inches(0), W, H, NAVY)
    rect(s, Inches(0), Inches(0), Inches(0.18), H, GOLD)
    rect(s, Inches(0), Inches(7.22), W, Inches(0.28), NAVY2)
    textbox(
        s,
        Inches(0.55),
        Inches(7.24),
        Inches(12.2),
        Inches(0.22),
        "Decision support for antenatal monitoring  ·  Not a diagnosis  ·  Not an emergency dispatch service",
        size=11,
        color=GOLD,
        italic=True,
    )

    textbox(s, Inches(0.7), Inches(0.55), Inches(11.5), Inches(0.28), "UNIVERSITY OF LAGOS  ·  DEPARTMENT OF COMPUTER SCIENCES", 13, GOLD, True, font=FONT_HEAD)
    textbox(s, Inches(0.7), Inches(0.88), Inches(11.5), Inches(0.24), "Masters in Information Technology  ·  MIT899  ·  October 2026", 14, RGBColor(0xC5, 0xD0, 0xDC))

    textbox(s, Inches(0.7), Inches(1.55), Inches(11.8), Inches(0.28), "PROJECT DEFENCE", 12, GOLD, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(0.7),
        Inches(1.88),
        Inches(12.0),
        Inches(1.7),
        "Design and Implementation of a Web-Based Maternal Health Monitoring System",
        32,
        WHITE,
        True,
        font=FONT_HEAD,
    )
    textbox(s, Inches(0.7), Inches(3.55), Inches(11.5), Inches(0.4), "WMHS  —  continuous antenatal monitoring, explainable risk triage, and location-based referral for Nigeria", 16, GOLD)

    # identity cards
    card(s, Inches(0.7), Inches(4.35), Inches(3.7), Inches(1.55), NAVY2)
    textbox(s, Inches(0.9), Inches(4.48), Inches(3.4), Inches(0.22), "CANDIDATE", 10, GOLD, True, font=FONT_HEAD)
    textbox(s, Inches(0.9), Inches(4.72), Inches(3.4), Inches(0.55), "Muritala, Muyideen Babatunde", 16, WHITE, True, font=FONT_HEAD)
    textbox(s, Inches(0.9), Inches(5.28), Inches(3.4), Inches(0.4), "Matric. No.  249074191", 13, RGBColor(0xC5, 0xD0, 0xDC))

    card(s, Inches(4.6), Inches(4.35), Inches(3.7), Inches(1.55), NAVY2)
    textbox(s, Inches(4.8), Inches(4.48), Inches(3.4), Inches(0.22), "SUPERVISOR", 10, GOLD, True, font=FONT_HEAD)
    textbox(s, Inches(4.8), Inches(4.72), Inches(3.4), Inches(0.55), "Dr. R. A. Koleoso", 16, WHITE, True, font=FONT_HEAD)
    textbox(s, Inches(4.8), Inches(5.28), Inches(3.4), Inches(0.4), "Department of Computer Sciences", 13, RGBColor(0xC5, 0xD0, 0xDC))

    card(s, Inches(8.5), Inches(4.35), Inches(4.1), Inches(1.55), NAVY2)
    textbox(s, Inches(8.7), Inches(4.48), Inches(3.8), Inches(0.22), "HEAD OF DEPARTMENT", 10, GOLD, True, font=FONT_HEAD)
    textbox(s, Inches(8.7), Inches(4.72), Inches(3.8), Inches(0.55), "Prof. F. A. Oladeji", 16, WHITE, True, font=FONT_HEAD)
    textbox(s, Inches(8.7), Inches(5.28), Inches(3.8), Inches(0.4), "Department of Computer Sciences", 13, RGBColor(0xC5, 0xD0, 0xDC))

    add_notes(
        s,
        "Sir, this project is a working web system for Nigerian antenatal care. "
        "Mothers log symptoms and tests; a guideline-backed engine scores risk; "
        "clinicians see a named caseload and can refer to a nearby facility. "
        "WMHS is decision support — it does not diagnose and it does not dispatch ambulances.",
    )


def slide_02_problem(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "01  ·  Context", "Why this problem matters", "Nigeria still loses mothers to delays between clinic visits")
    footer(s, 2, "Background")

    stats = [
        ("512", "/ 100,000", "Maternal mortality ratio", "NPC, 2022"),
        ("~20%", "of global", "Share of maternal deaths", "NPC, 2022"),
        ("4.5", "/ 10,000", "Doctors vs WHO 23", "FMoH, 2022"),
        ("1 in 21", "lifetime", "Maternal risk in parts of Nigeria", "WMHS framing"),
        ("43%", "of births", "Attended by a skilled clinician", "NDHS"),
    ]
    x = 0.45
    for value, unit, label, src in stats:
        card(s, Inches(x), Inches(1.38), Inches(2.4), Inches(2.15))
        textbox(s, Inches(x + 0.14), Inches(1.5), Inches(2.12), Inches(0.55), value, 26, NAVY, True, font=FONT_HEAD)
        textbox(s, Inches(x + 0.14), Inches(2.02), Inches(2.12), Inches(0.28), unit, 12, SAGE, True)
        textbox(s, Inches(x + 0.14), Inches(2.34), Inches(2.12), Inches(0.7), label, 13, INK, True)
        textbox(s, Inches(x + 0.14), Inches(3.12), Inches(2.12), Inches(0.28), src, 11, MUTED, italic=True)
        x += 2.55

    card(s, Inches(0.45), Inches(3.7), Inches(12.4), Inches(3.3))
    textbox(s, Inches(0.7), Inches(3.85), Inches(11.9), Inches(0.32), "The clinical problem is not missing guidelines. It is missing continuity.", 18, NAVY, True, font=FONT_HEAD)
    bullets = [
        "Care is episodic. Life-threatening conditions — pre-eclampsia, gestational diabetes, bleeding, reduced fetal movement — often appear between scheduled ANC visits (ACOG, 2022).",
        "Records are fragmented across hospital notes, laboratory databases, and paper booklets, so a clinician rarely sees one complete picture.",
        "Workload is high and specialist cover is thin. Manual sifting of hundreds of folders cannot surface the woman who deteriorated overnight.",
        "Many digital tools cover one slice (reminders, diaries, or reporting) rather than monitoring, explainable risk, and facility referral together.",
    ]
    y = 4.28
    for b in bullets:
        rect(s, Inches(0.75), Inches(y + 0.08), Inches(0.12), Inches(0.12), GOLD)
        textbox(s, Inches(1.05), Inches(y), Inches(11.5), Inches(0.58), b, 14, INK)
        y += 0.62

    add_notes(
        s,
        "The clinical problem is not that guidelines do not exist. It is that care is episodic, "
        "records are fragmented, and the woman who deteriorates on Thursday may not be seen until the next ANC day. "
        "Cite NPC 2022 and WHO 2023 calmly; do not dramatise.",
    )


def slide_03_aim(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "02  ·  Research design", "Problem, aim, and objectives")
    footer(s, 3, "Aim and objectives")

    card(s, Inches(0.45), Inches(1.38), Inches(6.05), Inches(2.35), DANGER_SOFT)
    rect(s, Inches(0.45), Inches(1.38), Inches(0.1), Inches(2.35), DANGER)
    textbox(s, Inches(0.75), Inches(1.5), Inches(5.55), Inches(0.28), "PROBLEM", 11, DANGER, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(0.75),
        Inches(1.82),
        Inches(5.55),
        Inches(1.7),
        "Episodic antenatal care, paper and siloed records, and weak digital referral produce late detection of preventable complications in the Nigerian setting.",
        15,
        INK,
    )

    card(s, Inches(6.7), Inches(1.38), Inches(6.15), Inches(2.35), SAGE_SOFT)
    rect(s, Inches(6.7), Inches(1.38), Inches(0.1), Inches(2.35), SAGE)
    textbox(s, Inches(7.0), Inches(1.5), Inches(5.65), Inches(0.28), "AIM", 11, SAGE, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(7.0),
        Inches(1.82),
        Inches(5.65),
        Inches(1.7),
        "Design, implement, and evaluate a web maternal health system that supports continuous monitoring, intelligent analysis of symptoms and tests, and location-based referral.",
        15,
        INK,
    )

    objs = [
        ("01", "Specify requirements from WHO, ACOG, NICE, NDPR, and antenatal scenarios."),
        ("02", "Build a scalable store for vitals, symptoms, history, labs, risk, alerts, ANC, and referrals."),
        ("03", "Deliver a patient portal: register, log symptoms, upload labs, see history and risk."),
        ("04", "Implement an explainable engine for pre-eclampsia, GDM, and preterm-labour patterns."),
        ("05", "Deliver a clinician dashboard: caseload by risk, alerts, notes, remote review."),
        ("06", "Rank nearby facilities, track referral status, deploy, and test on seeded data."),
    ]
    positions = [
        (0.45, 3.9),
        (4.55, 3.9),
        (8.65, 3.9),
        (0.45, 5.45),
        (4.55, 5.45),
        (8.65, 5.45),
    ]
    for (n, txt), (x, y) in zip(objs, positions):
        card(s, Inches(x), Inches(y), Inches(3.95), Inches(1.4))
        textbox(s, Inches(x + 0.18), Inches(y + 0.12), Inches(3.55), Inches(0.28), n, 14, GOLD_DARK, True, font=FONT_HEAD)
        textbox(s, Inches(x + 0.18), Inches(y + 0.42), Inches(3.55), Inches(0.88), txt, 13, INK)

    add_notes(
        s,
        "Objective 4 is the scientific core. The rest of the stack exists so that a score can actually "
        "reach a named clinician and a receiving ward. Keep this slide slow; the supervisor will scan the six boxes.",
    )


def slide_04_gap(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "03  ·  Literature", "The gap this artefact fills", "Existing tools each do one piece. WMHS connects the journey.")
    footer(s, 4, "Related work")

    styled_table(
        s,
        Inches(0.45),
        Inches(1.4),
        Inches(12.4),
        Inches(3.55),
        ["Class of system", "Strength observed", "Gap WMHS closes"],
        [
            ["SMS / USSD reminders", "Reach on basic phones", "No structured vitals, caseload, or documented risk rationale"],
            ["Facility EMR / DHIS-style reporting", "Aggregate coverage statistics", "Weak patient-facing logging between visits"],
            ["Consumer pregnancy applications", "Usable diaries and education", "Rarely aligned to WHO danger signs, NDPR, or facility referral"],
            ["Standalone ML classifiers", "High scores on public or synthetic tables", "Often not deployable; missing values may be treated as normal"],
        ],
        col_widths=[Inches(3.3), Inches(3.7), Inches(5.4)],
        font_size=13,
    )

    card(s, Inches(0.45), Inches(5.15), Inches(12.4), Inches(1.9), NAVY)
    textbox(s, Inches(0.7), Inches(5.3), Inches(12.0), Inches(0.28), "WMHS PROPOSITION", 11, GOLD, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(0.7),
        Inches(5.62),
        Inches(12.0),
        Inches(1.2),
        "One browser system that logs  →  scores with the why  →  alerts the named clinician  →  ranks a CEmONC facility.\n"
        "We did not try to beat a public classifier. We tried to ship an interpretable, hostable antenatal record that a PHC midwife can open.",
        16,
        WHITE,
    )

    add_notes(
        s,
        "We did not try to beat a Kaggle model. We tried to ship an interpretable, hostable antenatal record "
        "that a PHC midwife can open. Table 3.4 in the write-up is the source.",
    )


def slide_05_method(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "04  ·  Methodology", "How the study was done", "Design Science Research artefact  ·  Agile construction  ·  Technical evaluation")
    footer(s, 5, "Methodology")

    card(s, Inches(0.4), Inches(1.35), Inches(5.55), Inches(5.65))
    textbox(s, Inches(0.6), Inches(1.48), Inches(5.15), Inches(0.3), "PARADIGM AND BUILD", 11, SAGE, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(0.6),
        Inches(1.82),
        Inches(5.15),
        Inches(0.85),
        "Design Science Research (Hevner et al., 2004; Peffers et al., 2007). Construction used Agile Scrum across four two-week sprints. Evaluation is technical verification and demonstration — not a clinical trial.",
        13,
        INK,
    )

    sprints = [
        ("Sprint 1", "Foundations", "Prisma schema, NextAuth, role routes, LMP → EDD"),
        ("Sprint 2", "Clinical records", "Symptoms, tests, Cloudinary, patient dashboard, WHO ANC"),
        ("Sprint 3", "Decision support", "TypeScript engine, alerts, Haversine referral, assistant"),
        ("Sprint 4", "Hardening", "Caseload, SMS stub, Vitest, Vercel / Neon, seed data"),
    ]
    y = 2.75
    for code, title, body in sprints:
        round_rect(s, Inches(0.6), Inches(y), Inches(1.15), Inches(0.32), NAVY, radius=0.4)
        textbox(s, Inches(0.6), Inches(y), Inches(1.15), Inches(0.32), code, 10, WHITE, True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=FONT_HEAD)
        textbox(s, Inches(1.9), Inches(y - 0.02), Inches(3.8), Inches(0.26), title, 14, NAVY, True, font=FONT_HEAD)
        textbox(s, Inches(1.9), Inches(y + 0.26), Inches(3.8), Inches(0.4), body, 12, MUTED)
        y += 0.95

    picture_fit(s, DIAG / "dsr-process.png", 6.15, 1.38, 6.75, 5.55, center=True)

    add_notes(
        s,
        "DSR is the right claim. The contribution is an artefact plus a traceable evaluation, not an epidemiological result. "
        "If asked why Scrum: clinical rules and interface copy became clearer with working prototypes against WHO, ACOG, and NICE thresholds.",
    )


def slide_06_architecture(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "05  ·  Design", "System architecture", "Three tiers, one Next.js codebase  ·  No separate Express server")
    footer(s, 6, "Architecture")

    picture_fit(s, DIAG / "system-architecture.png", 0.32, 1.28, 8.55, 5.7, center=True)

    card(s, Inches(9.05), Inches(1.35), Inches(3.85), Inches(5.65))
    textbox(s, Inches(9.25), Inches(1.5), Inches(3.5), Inches(0.28), "STACK", 11, SAGE, True, font=FONT_HEAD)
    stack = [
        "Next.js 14  ·  React 18  ·  TypeScript",
        "Tailwind  ·  Recharts  ·  Leaflet",
        "NextAuth JWT  ·  HTTP-only cookie",
        "Prisma 5  ·  Neon PostgreSQL 16",
        "Cloudinary lab files  ·  Zod",
        "Vitest  ·  Vercel hosting",
    ]
    y = 1.88
    for item in stack:
        rect(s, Inches(9.3), Inches(y + 0.08), Inches(0.1), Inches(0.1), GOLD)
        textbox(s, Inches(9.5), Inches(y), Inches(3.2), Inches(0.36), item, 12, INK)
        y += 0.38

    textbox(s, Inches(9.25), Inches(4.22), Inches(3.5), Inches(0.28), "ACCESS MODEL", 11, SAGE, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(9.25),
        Inches(4.52),
        Inches(3.5),
        Inches(2.2),
        "PATIENT sees only her record.\n\nPROVIDER sees only an active named caseload.\n\nMiddleware blocks cross-role routes. Lab files sit on the patient record, not a shared folder.",
        13,
        INK,
    )

    add_notes(
        s,
        "Architecture choice was maintainability: one TypeScript type from the form, through the API, into the table. "
        "If asked about Express: Chapter 3 originally sketched Express; the implemented artefact uses Next.js Route Handlers only.",
    )


def slide_07_engine(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "06  ·  Core contribution", "Clinical risk engine", "Fourteen features  →  score 0–1  →  LOW / MEDIUM / HIGH with the why")
    footer(s, 7, "Risk engine")

    card(s, Inches(0.4), Inches(1.32), Inches(6.35), Inches(5.7))
    textbox(s, Inches(0.6), Inches(1.45), Inches(6.0), Inches(0.28), "SAFETY RULES TO DEFEND", 11, SAGE, True, font=FONT_HEAD)

    rules = [
        (SUCCESS, "Missing vitals are skipped. They are never treated as normal."),
        (DANGER, "Emergency overrides force HIGH: bleeding; reduced fetal movement; SBP ≥ 160 with DBP ≥ 110; headache and blurred vision."),
        (PRIMARY, "HIGH opens screens for pre-eclampsia, gestational diabetes, and preterm labour."),
        (GOLD_DARK, "Thresholds aligned to WHO, ACOG, and NICE. Production inference is TypeScript — not a Python model on Vercel."),
        (NAVY, "Output is decision support. Urgency bands: monitor, consult, emergency."),
    ]
    y = 1.85
    for color, txt in rules:
        round_rect(s, Inches(0.6), Inches(y), Inches(5.95), Inches(0.95), WHITE, LINE, 0.06)
        rect(s, Inches(0.6), Inches(y), Inches(0.1), Inches(0.95), color)
        textbox(s, Inches(0.88), Inches(y + 0.12), Inches(5.5), Inches(0.72), txt, 13, INK)
        y += 1.02

    picture_fit(s, DIAG / "fig-risk-pipeline.png", 6.9, 1.28, 6.05, 5.7, center=True)

    add_notes(
        s,
        "If blood pressure was not recorded, the engine says not recorded. It does not invent 110/70. "
        "That is a clinical-safety design, not a modelling convenience. "
        "If asked about 92.4 percent in the abstract: that figure is from an optional Random Forest trained on synthetic data. "
        "It is not loaded in production and is not claimed as diagnostic accuracy. Chapter 5 states this explicitly.",
    )


def slide_08_app(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "07  ·  Implementation", "What was built", "Two portals, one record  ·  Live demo after this slide if the projector allows")
    footer(s, 8, "The application")

    picture_fit(s, DIAG / "fig-patient-dashboard.png", 0.35, 1.28, 6.25, 3.55, center=True)
    picture_fit(s, DIAG / "fig-provider-dashboard.png", 6.75, 1.28, 6.2, 3.55, center=True)

    textbox(s, Inches(0.4), Inches(4.95), Inches(6.1), Inches(0.24), "MOTHER  ·  /patient/dashboard", 11, SAGE, True, font=FONT_HEAD)
    textbox(s, Inches(6.8), Inches(4.95), Inches(6.1), Inches(0.24), "CLINICIAN  ·  /provider/dashboard", 11, SAGE, True, font=FONT_HEAD)

    mother = "LMP → EDD (Naegele)  ·  WHO 8-contact ANC  ·  symptoms and labs  ·  feature contributions  ·  printable summary  ·  map + referral letter  ·  assistant with escalate flags"
    clinician = "Facility waiting list  ·  named caseload  ·  high-risk counts  ·  alert feed  ·  visit entry and notes  ·  referral lifecycle PENDING → COMPLETED"

    textbox(s, Inches(0.4), Inches(5.2), Inches(6.1), Inches(0.85), mother, 12, INK)
    textbox(s, Inches(6.8), Inches(5.2), Inches(6.1), Inches(0.85), clinician, 12, INK)

    round_rect(s, Inches(0.4), Inches(6.1), Inches(12.5), Inches(0.95), NAVY, radius=0.06)
    textbox(
        s,
        Inches(0.6),
        Inches(6.2),
        Inches(12.15),
        Inches(0.75),
        "Demo   patient@wmhs.ng   ·   provider@wmhs.ng   ·   Password123!     Also seeded: fatima@wmhs.ng, hadiza@wmhs.ng\n"
        "Copy on every clinical screen: WMHS is decision support, not a diagnosis and not an emergency dispatch service.",
        13,
        WHITE,
    )

    add_notes(
        s,
        "If the projector works, stop talking and show three clicks: mother logs a headache, HIGH appears with reasons, "
        "the clinician alert feed updates. Use fatima@wmhs.ng or hadiza@wmhs.ng if you need a high-risk seed.",
    )


def slide_09_security(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "08  ·  Governance", "Security, privacy, and clinical safety", "Aligned to the Nigeria Data Protection Regulation (NDPR)")
    footer(s, 9, "Security and NDPR")

    items = [
        (NAVY, "Identity", "bcrypt, 12 rounds. JWT in an HTTP-only cookie, eight-hour life. Password-reset tokens expire in 30 minutes and do not reveal whether an email exists."),
        (PRIMARY, "Access", "Role guards plus assignment check. A clinician cannot open another facility’s mother. Patients see only their own record."),
        (SAGE, "Integrity", "Zod validation on clinical payloads. Rate limits on register and reset. Lab files stored against the patient, not a shared folder."),
        (GOLD_DARK, "NDPR", "Consent at registration. Purpose limitation: antenatal record, triage, named-clinician notify, referral letter. Health data is not sold."),
        (WARNING, "Operations", "TLS via Vercel. SMS pathway is a stub unless an administrator connects a vendor. Facility directory is seeded, not a national feed."),
        (DANGER, "Clinical safety", "Copy never claims diagnosis. Emergency language is visually prominent. Overdue ANC contacts stay overdue until ticked."),
    ]
    coords = [
        (0.4, 1.35),
        (4.55, 1.35),
        (8.7, 1.35),
        (0.4, 4.2),
        (4.55, 4.2),
        (8.7, 4.2),
    ]
    for (color, title, body), (x, y) in zip(items, coords):
        card(s, Inches(x), Inches(y), Inches(3.95), Inches(2.65))
        round_rect(s, Inches(x + 0.2), Inches(y + 0.22), Inches(0.12), Inches(0.12), color, radius=0.5)
        textbox(s, Inches(x + 0.42), Inches(y + 0.16), Inches(3.3), Inches(0.32), title.upper(), 13, color, True, font=FONT_HEAD)
        textbox(s, Inches(x + 0.22), Inches(y + 0.58), Inches(3.5), Inches(1.9), body, 13, INK)

    add_notes(
        s,
        "Health data is not a class project. The access model is: one mother, one named clinician, one facility waiting list. "
        "If asked about NDPR: consent at register, purpose-limited processing, caseload least privilege, hashed passwords, TLS in production.",
    )


def slide_10_evaluation(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "09  ·  Results", "Evaluation — what we can honestly claim", "Verified on the seeded demonstration system. Not a field trial.")
    footer(s, 10, "Evaluation")

    styled_table(
        s,
        Inches(0.4),
        Inches(1.35),
        Inches(12.5),
        Inches(3.55),
        ["Layer", "What was run", "Result"],
        [
            ["Functional tests", "Registration, login, RBAC, symptoms, tests, risk, alerts, referral, assistant", "20 / 20 passed"],
            ["Integration workflows", "Monitor → risk → caseload → alert → referral → isolation", "7 / 7 passed"],
            ["Clinical scenarios S1–S6", "Routine LOW; emergency BP / bleeding / reduced movement HIGH", "All specified cases passed"],
            ["Missing-vital safety", "Unrecorded BP must not be scored as normal", "Flagged as missing; contribution 0"],
            ["Performance (dev workstation)", "Login, dashboard, symptom + persist, nearby sort", "Interactive; typically under ~2–3 s"],
            ["Usability", "Heuristic review of labels, colour, empty states, mobile width", "Main tasks completable; no SUS survey"],
        ],
        col_widths=[Inches(2.7), Inches(7.1), Inches(2.7)],
        font_size=12,
    )

    card(s, Inches(0.4), Inches(5.1), Inches(6.15), Inches(1.9), SUCCESS_SOFT)
    rect(s, Inches(0.4), Inches(5.1), Inches(0.1), Inches(1.9), SUCCESS)
    textbox(s, Inches(0.7), Inches(5.22), Inches(5.65), Inches(0.28), "THIS PROVES", 11, SUCCESS, True, font=FONT_HEAD)
    textbox(s, Inches(0.7), Inches(5.52), Inches(5.65), Inches(1.3), "The artefact behaves as specified. Emergency danger signs raise HIGH. Incomplete vitals are visible, not invented.", 15, INK)

    card(s, Inches(6.75), Inches(5.1), Inches(6.15), Inches(1.9), DANGER_SOFT)
    rect(s, Inches(6.75), Inches(5.1), Inches(0.1), Inches(1.9), DANGER)
    textbox(s, Inches(7.05), Inches(5.22), Inches(5.65), Inches(0.28), "THIS DOES NOT PROVE", 11, DANGER, True, font=FONT_HEAD)
    textbox(s, Inches(7.05), Inches(5.52), Inches(5.65), Inches(1.3), "Diagnostic accuracy, reduced maternal mortality, or clinic uptake. Chapter 5 refuses those claims.", 15, INK)

    add_notes(
        s,
        "I would rather under-claim in front of you than over-claim a synthetic accuracy number. "
        "If the abstract’s 92.4 percent / 94.7 percent is raised: optional offline Random Forest on synthetic data; "
        "not the production engine; not clinical diagnostic accuracy.",
    )


def slide_11_contribution(prs):
    s = new_slide(prs)
    content_bg(s)
    header(s, "10  ·  Contribution", "What this study adds — and what it does not", "All five research objectives were met within the technical evaluation scope")
    footer(s, 11, "Contribution")

    contribs = [
        ("01", "Integrated artefact", "Patient record, WHO ANC, explainable triage, alerts, and Haversine referral in one three-tier web system — functions that usually sit in separate tools."),
        ("02", "Explainable scoring", "Guideline rules plus emergency overrides plus missing-vital honesty. Not a black-box classifier in production."),
        ("03", "Traceable evaluation", "Requirements from guidelines and scenarios → implementation → unit, functional, integration, and scenario tests."),
    ]
    x = 0.4
    for n, title, body in contribs:
        card(s, Inches(x), Inches(1.35), Inches(4.05), Inches(3.15))
        textbox(s, Inches(x + 0.22), Inches(1.5), Inches(3.6), Inches(0.3), n, 14, GOLD_DARK, True, font=FONT_HEAD)
        textbox(s, Inches(x + 0.22), Inches(1.85), Inches(3.6), Inches(0.55), title, 18, NAVY, True, font=FONT_HEAD)
        textbox(s, Inches(x + 0.22), Inches(2.5), Inches(3.6), Inches(1.75), body, 14, INK)
        x += 4.25

    textbox(s, Inches(0.5), Inches(4.65), Inches(12.3), Inches(0.3), "LIMITATIONS — OWN THEM", 12, DANGER, True, font=FONT_HEAD)
    limits = [
        "No clinical field trial",
        "Seeded and synthetic records only",
        "No labelled hospital dataset",
        "SMS is a demonstration stub",
        "Facility list is seeded",
        "Not connected to DHIS2 / OpenMRS",
    ]
    x = 0.4
    for item in limits:
        round_rect(s, Inches(x), Inches(5.05), Inches(2.05), Inches(1.9), WHITE, LINE, 0.08)
        textbox(s, Inches(x + 0.12), Inches(5.35), Inches(1.82), Inches(1.35), item, 14, INK, True, align=PP_ALIGN.CENTER)
        x += 2.15

    add_notes(
        s,
        "The contribution is a testable decision-support design. Outcome impact would be a different study. "
        "Do not let the conversation drift into claiming lives saved.",
    )


def slide_12_close(prs):
    s = new_slide(prs)
    rect(s, Inches(0), Inches(0), W, H, NAVY)
    rect(s, Inches(0), Inches(0), Inches(0.18), H, GOLD)

    textbox(s, Inches(0.7), Inches(0.4), Inches(12), Inches(0.28), "12  ·  CLOSE", 12, GOLD, True, font=FONT_HEAD)
    textbox(s, Inches(0.7), Inches(0.72), Inches(12), Inches(0.5), "Recommendations, further work, and thanks", 26, WHITE, True, font=FONT_HEAD)

    recs = [
        ("1", "Field-evaluate in PHCs and referral centres — usability and workflow, not only screens."),
        ("2", "Co-design the next iteration with midwives and obstetricians."),
        ("3", "Interoperate with DHIS2 / NHMIS / OpenMRS to cut duplicate entry."),
        ("4", "Validate the engine on de-identified Nigerian records. Keep emergency safety rules."),
    ]
    y = 1.4
    for n, txt in recs:
        round_rect(s, Inches(0.7), Inches(y), Inches(0.42), Inches(0.42), GOLD, radius=0.15)
        textbox(s, Inches(0.7), Inches(y), Inches(0.42), Inches(0.42), n, 16, NAVY, True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=FONT_HEAD)
        textbox(s, Inches(1.3), Inches(y + 0.04), Inches(11.2), Inches(0.4), txt, 16, WHITE)
        y += 0.52

    textbox(s, Inches(0.7), Inches(3.55), Inches(12), Inches(0.28), "FURTHER RESEARCH", 11, GOLD, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(0.7),
        Inches(3.85),
        Inches(12),
        Inches(0.7),
        "SUS with mothers and clinicians  ·  SMS / USSD capture  ·  offline mode  ·  prospective false-negative analysis  ·  only then consider machine learning against the current rule engine.",
        14,
        RGBColor(0xC5, 0xD0, 0xDC),
    )

    round_rect(s, Inches(0.7), Inches(4.65), Inches(11.9), Inches(1.35), NAVY2, radius=0.06)
    textbox(
        s,
        Inches(0.95),
        Inches(4.8),
        Inches(11.45),
        Inches(1.1),
        "WMHS shows that continuous antenatal monitoring, explainable risk triage, and location-based referral can be implemented as one web system for the Nigerian setting. It is ready as decision support. It is not a substitute for a clinician, and it does not delay emergency referral.",
        15,
        WHITE,
        italic=True,
    )

    textbox(s, Inches(0.7), Inches(6.2), Inches(12), Inches(0.4), "Thank you  ·  Questions are welcome", 22, GOLD, True, font=FONT_HEAD)
    textbox(
        s,
        Inches(0.7),
        Inches(6.65),
        Inches(12),
        Inches(0.45),
        "Muritala, Muyideen Babatunde  ·  249074191  ·  Supervisor: Dr. R. A. Koleoso  ·  University of Lagos",
        14,
        RGBColor(0xC5, 0xD0, 0xDC),
    )

    add_notes(
        s,
        "Read the boxed closing line once, then stop. Do not add a new idea after thank you. "
        "If questions stall: offer a live walk-through of a high-risk seed patient.",
    )


def build():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    prs.core_properties.title = "WMHS — Design and Implementation of a Web-Based Maternal Health Monitoring System"
    prs.core_properties.author = "Muritala, Muyideen Babatunde"
    prs.core_properties.subject = "MIT899 Project Defence, University of Lagos, October 2026"
    prs.core_properties.category = "Academic defence"
    prs.core_properties.comments = "Supervisor: Dr. R. A. Koleoso. Decision support — not a diagnosis."

    slide_01_title(prs)
    slide_02_problem(prs)
    slide_03_aim(prs)
    slide_04_gap(prs)
    slide_05_method(prs)
    slide_06_architecture(prs)
    slide_07_engine(prs)
    slide_08_app(prs)
    slide_09_security(prs)
    slide_10_evaluation(prs)
    slide_11_contribution(prs)
    slide_12_close(prs)

    prs.save(OUT)
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    build()
