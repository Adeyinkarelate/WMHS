#!/usr/bin/env python3
"""Build the 15-slide MIT899 project-defence deck."""

from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import nsmap, qn
from pptx.util import Emu, Inches, Pt
from lxml import etree

ROOT = Path("/Users/apple/Desktop/WMHS")
ASSETS = ROOT / "docs/slide_assets"
OUT = ROOT / "WMHS-MIT899-Defence-Slides.pptx"
WORK = ROOT / "docs/slide_assets/prepared"
WORK.mkdir(parents=True, exist_ok=True)

# Widescreen 16:9
W, H = Inches(13.333), Inches(7.5)

NAVY = RGBColor(0x0B, 0x1F, 0x3A)
NAVY2 = RGBColor(0x12, 0x3A, 0x5C)
TEAL = RGBColor(0x0F, 0x76, 0x6E)
TEAL_DK = RGBColor(0x11, 0x5E, 0x59)
INK = RGBColor(0x1F, 0x29, 0x37)
MUTED = RGBColor(0x4B, 0x55, 0x63)
LINE = RGBColor(0xE5, 0xEA, 0xEE)
SOFT = RGBColor(0xF4, 0xF7, 0xF8)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LOW = RGBColor(0x04, 0x78, 0x57)
MED = RGBColor(0xB4, 0x53, 0x09)
HIGH = RGBColor(0xB9, 0x1C, 0x1C)
GOLD = RGBColor(0x0D, 0x94, 0x88)
CARD = RGBColor(0xFB, 0xFC, 0xFD)


def set_run(run, size=14, bold=False, color=INK, name="Calibri"):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    ea = rPr.find(qn("a:latin"))
    if ea is None:
        latin = etree.SubElement(rPr, qn("a:latin"))
        latin.set("typeface", name)
    else:
        ea.set("typeface", name)


def _fill(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()


def rect(slide, l, t, w, h, color, line=None):
    s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    s.fill.solid()
    s.fill.fore_color.rgb = color
    if line:
        s.line.color.rgb = line
        s.line.width = Pt(1)
    else:
        s.line.fill.background()
    s.shadow.inherit = False
    return s


def round_rect(slide, l, t, w, h, color, line=None, radius=0.08):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    s.adjustments[0] = radius
    s.fill.solid()
    s.fill.fore_color.rgb = color
    if line:
        s.line.color.rgb = line
        s.line.width = Pt(1.15)
    else:
        s.line.fill.background()
    s.shadow.inherit = False
    return s


def tb(slide, l, t, w, h, text, size=14, bold=False, color=INK, align=PP_ALIGN.LEFT, name="Calibri", anchor=MSO_ANCHOR.TOP):
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
    run = p.add_run()
    run.text = text
    set_run(run, size=size, bold=bold, color=color, name=name)
    return box


def multi(slide, l, t, w, h, lines, size=12, color=INK, bold=False, leading=6, name="Calibri"):
    """lines: list of str or (str, dict)."""
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    for i, item in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(leading)
        if isinstance(item, tuple):
            text, kw = item
        else:
            text, kw = item, {}
        run = p.add_run()
        run.text = text
        set_run(
            run,
            size=kw.get("size", size),
            bold=kw.get("bold", bold),
            color=kw.get("color", color),
            name=kw.get("name", name),
        )
    return box


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def footer(slide, n, total=15):
    rect(slide, 0, Inches(7.28), W, Inches(0.22), NAVY)
    tb(slide, Inches(0.4), Inches(7.28), Inches(9.5), Inches(0.22),
       "University of Lagos  ·  Department of Computer Sciences  ·  MIT899",
       size=9, color=WHITE, name="Calibri", anchor=MSO_ANCHOR.MIDDLE)
    tb(slide, Inches(10.6), Inches(7.28), Inches(2.3), Inches(0.22),
       f"{n}  /  {total}", size=9, color=WHITE, align=PP_ALIGN.RIGHT,
       name="Calibri", anchor=MSO_ANCHOR.MIDDLE)


def header(slide, kicker, title, n):
    rect(slide, 0, 0, Inches(0.14), H, TEAL)
    tb(slide, Inches(0.42), Inches(0.18), Inches(10.4), Inches(0.22),
       kicker.upper(), size=10, bold=True, color=TEAL, name="Calibri")
    tb(slide, Inches(0.42), Inches(0.36), Inches(11.8), Inches(0.42),
       title, size=22, bold=True, color=NAVY, name="Calibri")
    rect(slide, Inches(0.42), Inches(0.80), Inches(1.35), Inches(0.045), TEAL)
    footer(slide, n)


def add_contain(slide, path, l, t, w, h, top=True):
    """Place image inside a box without stretching (EMU units)."""
    im = Image.open(path)
    iw, ih = im.size
    box_a = w / h
    img_a = iw / ih
    if img_a > box_a:
        nh = int(w * ih / iw)
        nt = t if top else t + (h - nh) // 2
        return slide.shapes.add_picture(str(path), l, nt, w, nh)
    nw = int(h * iw / ih)
    nl = l + (w - nw) // 2
    return slide.shapes.add_picture(str(path), nl, t, nw, h)


def prepare_jpeg(src: Path, dest: Path, max_w=1600, quality=86):
    im = Image.open(src).convert("RGB")
    if im.width > max_w:
        ratio = max_w / im.width
        im = im.resize((max_w, int(im.height * ratio)), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=quality, optimize=True)
    return dest


def crop_aspect(src: Path, dest: Path, aspect: float, max_w=1800, quality=88):
    """Crop from the top-left so the image fills a box of the given w/h aspect."""
    im = Image.open(src).convert("RGB")
    target_h = int(im.width / aspect)
    if target_h < im.height:
        im = im.crop((0, 0, im.width, target_h))
    if im.width > max_w:
        r = max_w / im.width
        im = im.resize((max_w, int(im.height * r)), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=quality, optimize=True)
    return dest


def crop_right(src: Path, dest: Path, left_frac=0.46):
    im = Image.open(src).convert("RGB")
    x = int(im.width * left_frac)
    im.crop((x, 0, im.width, im.height)).save(dest, "JPEG", quality=88, optimize=True)
    return dest


# ---------------------------------------------------------------------------
# Slides
# ---------------------------------------------------------------------------

def slide_01(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    rect(s, 0, 0, Inches(0.22), H, NAVY)
    rect(s, Inches(0.22), 0, Inches(0.08), H, TEAL)
    rect(s, 0, Inches(7.18), W, Inches(0.32), NAVY)

    tb(s, Inches(0.7), Inches(0.42), Inches(11.5), Inches(0.28),
       "MASTER OF INFORMATION TECHNOLOGY  ·  PROJECT DEFENCE",
       size=12, bold=True, color=TEAL, name="Calibri")

    tb(s, Inches(0.7), Inches(1.05), Inches(12.0), Inches(1.55),
       "Design and Implementation of a\nWeb-Based Maternal Health\nMonitoring System",
       size=32, bold=True, color=NAVY, name="Calibri")

    rect(s, Inches(0.7), Inches(2.72), Inches(2.2), Inches(0.06), TEAL)

    tb(s, Inches(0.7), Inches(2.95), Inches(11.5), Inches(0.32),
       "A Design Science Research artefact for antenatal monitoring, guideline-based risk assessment and referral",
       size=14, color=MUTED)

    # Info cards
    cards = [
        ("Student", "Muritala, Muyideen Babatunde"),
        ("Matriculation number", "249074191"),
        ("Programme / course", "MIT  ·  MIT899"),
        ("Department", "Computer Sciences"),
        ("Institution", "University of Lagos, Nigeria"),
        ("Supervisors", "Professor C.O. Uwadia  ·  Dr R.A. Koleoso"),
    ]
    for i, (k, v) in enumerate(cards):
        col, row = i % 3, i // 3
        x = Inches(0.7 + col * 4.05)
        y = Inches(3.55 + row * 1.15)
        round_rect(s, x, y, Inches(3.85), Inches(1.02), SOFT, LINE)
        tb(s, x + Inches(0.18), y + Inches(0.14), Inches(3.5), Inches(0.24),
           k.upper(), size=10, bold=True, color=TEAL)
        tb(s, x + Inches(0.18), y + Inches(0.40), Inches(3.5), Inches(0.48),
           v, size=14, bold=True, color=NAVY)

    tb(s, Inches(0.7), Inches(7.18), Inches(8), Inches(0.32),
       "October 2026", size=12, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, Inches(8.5), Inches(7.18), Inches(4.4), Inches(0.32),
       "Web Maternal Health System  ·  WMHS", size=12, color=WHITE,
       align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)

    notes(s, "Briefly introduce yourself as Muritala, Muyideen Babatunde, a Master of Information Technology candidate in the Department of Computer Sciences, University of Lagos. State the research title clearly. Mention that the work is supervised by Professor C.O. Uwadia and Dr R.A. Koleoso, and that the defence presents a designed, implemented and technically evaluated web-based maternal health monitoring system for the Nigerian healthcare environment.")


def slide_02(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter One  ·  Introduction", "Background of the study", 2)

    points = [
        "Maternal healthcare remains a significant public health challenge in Nigeria.",
        "Traditional monitoring relies heavily on scheduled antenatal visits.",
        "Pregnancy complications may emerge between those visits.",
        "Clinicians struggle to monitor many patients and identify urgent cases.",
        "Digital health and guideline-based risk assessment can improve monitoring and referral.",
    ]
    for i, p in enumerate(points):
        y = Inches(1.02 + i * 0.42)
        round_rect(s, Inches(0.42), y, Inches(0.32), Inches(0.32), TEAL)
        tb(s, Inches(0.42), y, Inches(0.32), Inches(0.32), str(i + 1),
           size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, Inches(0.86), y, Inches(12.0), Inches(0.34), p, size=14, color=INK, anchor=MSO_ANCHOR.MIDDLE)

    # Comparison
    round_rect(s, Inches(0.42), Inches(3.22), Inches(6.05), Inches(2.55), SOFT, LINE)
    round_rect(s, Inches(6.85), Inches(3.22), Inches(6.05), Inches(2.55), RGBColor(0xEC, 0xFD, 0xF5), TEAL)

    tb(s, Inches(0.62), Inches(3.36), Inches(5.7), Inches(0.3),
       "TRADITIONAL APPROACH", size=12, bold=True, color=NAVY)
    chain = "Scheduled ANC visits   →   Periodic assessment   →   Possible delay in detecting emerging complications"
    tb(s, Inches(0.62), Inches(3.72), Inches(5.65), Inches(1.15),
       chain, size=13, color=INK)
    tb(s, Inches(0.62), Inches(4.95), Inches(5.65), Inches(0.6),
       "Care is episodic. Danger signs such as pre-eclampsia or preterm labour may escalate before the next clinic visit (ACOG, 2022).",
       size=11, color=MUTED)

    tb(s, Inches(7.05), Inches(3.36), Inches(5.7), Inches(0.3),
       "PROPOSED DIGITAL APPROACH", size=12, bold=True, color=TEAL_DK)
    chain2 = "Patient health updates   →   Continuous record capture   →   Risk assessment   →   Clinician attention"
    tb(s, Inches(7.05), Inches(3.72), Inches(5.65), Inches(1.15),
       chain2, size=13, color=INK)
    tb(s, Inches(7.05), Inches(4.95), Inches(5.65), Inches(0.6),
       "The aim is continuity between contacts, earlier triage of urgent cases, and more coherent referral — not autonomous diagnosis.",
       size=11, color=MUTED)

    tb(s, Inches(0.42), Inches(5.92), Inches(12.4), Inches(1.15),
       "Why continuous monitoring matters.  Scheduled antenatal care remains essential, but it does not observe the mother between contacts. Continuous capture of symptoms, selected vitals and laboratory results creates a longitudinal record that can support guideline-based risk classification and timely clinician review in a resource-constrained setting.",
       size=13, color=INK)

    notes(s, "Explain that Nigerian maternal healthcare still depends on scheduled antenatal visits. Complications can appear between contacts, records are often fragmented, and clinicians cannot easily rank urgency across a large caseload. Digital capture plus guideline-based risk assessment is relevant because it supports continuity, earlier attention and more coherent referral. Do not dwell on mortality statistics. Emphasise the monitoring gap, not a claim that software will reduce deaths.")


def slide_03(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter One  ·  Introduction", "Statement of the problem", 3)

    problems = [
        "Limited continuity of monitoring between antenatal appointments.",
        "Delayed identification of potentially dangerous pregnancy complications.",
        "Fragmented maternal health information across paper records, laboratories and facilities.",
        "Limited automated risk assessment and patient prioritisation.",
        "Difficulty identifying appropriate healthcare facilities for referral.",
    ]
    consequences = [
        "Delayed clinical attention.",
        "Incomplete patient health histories.",
        "Difficulty prioritising high-risk patients.",
        "Inefficient referral coordination.",
        "Uneven use of scarce obstetric capacity.",
    ]

    tb(s, Inches(0.42), Inches(1.00), Inches(6.1), Inches(0.28),
       "CHALLENGES", size=12, bold=True, color=HIGH)
    tb(s, Inches(7.05), Inches(1.00), Inches(5.8), Inches(0.28),
       "CONSEQUENCES", size=12, bold=True, color=MED)

    for i, p in enumerate(problems):
        y = Inches(1.32 + i * 0.62)
        round_rect(s, Inches(0.42), y, Inches(6.05), Inches(0.54), SOFT, LINE)
        round_rect(s, Inches(0.54), y + Inches(0.12), Inches(0.30), Inches(0.30), NAVY)
        tb(s, Inches(0.54), y + Inches(0.12), Inches(0.30), Inches(0.30),
           str(i + 1), size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, Inches(0.96), y + Inches(0.08), Inches(5.35), Inches(0.40), p, size=12, color=INK, anchor=MSO_ANCHOR.MIDDLE)

        # arrow
        ar = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(6.55), y + Inches(0.16), Inches(0.38), Inches(0.22))
        _fill(ar, TEAL)

        c = consequences[i]
        round_rect(s, Inches(7.05), y, Inches(5.85), Inches(0.54), RGBColor(0xFF, 0xF7, 0xED), RGBColor(0xFD, 0xDC, 0xA7))
        tb(s, Inches(7.22), y + Inches(0.08), Inches(5.5), Inches(0.40), c, size=13, color=INK, anchor=MSO_ANCHOR.MIDDLE)

    round_rect(s, Inches(0.42), Inches(4.52), Inches(12.48), Inches(2.50), NAVY)
    tb(s, Inches(0.68), Inches(4.68), Inches(12.0), Inches(0.26),
       "RESEARCH STATEMENT", size=11, bold=True, color=TEAL)
    tb(s, Inches(0.68), Inches(5.00), Inches(12.0), Inches(1.75),
       "There is a need for an integrated web-based maternal health monitoring and referral system that supports continuous data capture, guideline-based risk assessment and appropriate healthcare facility recommendations.",
       size=18, bold=True, color=WHITE)

    notes(s, "Present the five operational gaps: continuity, delayed detection, fragmented records, weak automated triage, and weak referral matching. Link each gap to a consequence. Close with the research statement. Do not describe the solution architecture here; that belongs on later slides. The gap is an integrated monitoring, risk-assessment and referral platform suitable for Nigerian antenatal care.")


def slide_04(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter One  ·  Introduction", "Aim and objectives of the study", 4)

    round_rect(s, Inches(0.42), Inches(1.00), Inches(12.48), Inches(1.22), RGBColor(0xEC, 0xFD, 0xF5), TEAL)
    tb(s, Inches(0.62), Inches(1.10), Inches(12.1), Inches(0.22),
       "RESEARCH AIM", size=11, bold=True, color=TEAL_DK)
    tb(s, Inches(0.62), Inches(1.34), Inches(12.1), Inches(0.75),
       "To design, implement and deploy a web-based maternal health monitoring system that supports maternal health monitoring, risk assessment and healthcare facility referral within the Nigerian healthcare environment.",
       size=15, bold=True, color=NAVY)

    objs = [
        ("01", "Requirements", "Identify system requirements from WHO, ACOG and NICE guidelines and Nigerian healthcare needs."),
        ("02", "Database", "Develop a scalable store for symptoms, vitals, history, laboratory results and risk assessments."),
        ("03", "Patient portal", "Provide registration, symptom reporting, laboratory uploads, history and risk recommendations."),
        ("04", "Risk engine", "Implement decision support for complications including pre-eclampsia, gestational diabetes and preterm labour."),
        ("05", "Clinician dashboard", "Support risk-based caseload monitoring, alerts and clinical records."),
        ("06", "Referral and evaluation", "Recommend facilities by location and need, then evaluate the implemented system."),
    ]
    for i, (n, title, body) in enumerate(objs):
        col, row = i % 2, i // 2
        x = Inches(0.42 + col * 6.45)
        y = Inches(2.40 + row * 1.52)
        round_rect(s, x, y, Inches(6.22), Inches(1.40), SOFT, LINE)
        round_rect(s, x + Inches(0.16), y + Inches(0.18), Inches(0.58), Inches(0.40), NAVY)
        tb(s, x + Inches(0.16), y + Inches(0.18), Inches(0.58), Inches(0.40),
           n, size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x + Inches(0.86), y + Inches(0.18), Inches(5.1), Inches(0.36),
           title, size=15, bold=True, color=NAVY, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x + Inches(0.16), y + Inches(0.68), Inches(5.88), Inches(0.60),
           body, size=12, color=INK)

    notes(s, "State the aim first: design, implement and deploy a monitoring, risk-assessment and referral system for Nigeria. Then walk the six objectives as a chain: requirements, data store, patient portal, risk engine, clinician dashboard, and location-based referral plus evaluation. Each objective is a necessary part of the artefact, not a separate study.")


def slide_05(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Two  ·  Literature", "Literature review and research gap", 5)

    foci = [
        ("Monitoring challenges", "Traditional antenatal care is episodic. Records are often fragmented across paper notes, laboratories and facilities, with limited continuity between contacts."),
        ("Digital solutions", "SMS programmes, consumer pregnancy applications, electronic health records and AI-assisted tools each address parts of maternal care."),
        ("Research gap", "Few solutions integrate patient monitoring, explainable risk assessment, a clinician dashboard and location-based referral in one system."),
    ]
    for i, (t, b) in enumerate(foci):
        x = Inches(0.42 + i * 4.28)
        round_rect(s, x, Inches(1.00), Inches(4.10), Inches(1.55), SOFT, LINE)
        tb(s, x + Inches(0.16), Inches(1.10), Inches(3.78), Inches(0.30), t, size=13, bold=True, color=NAVY)
        tb(s, x + Inches(0.16), Inches(1.42), Inches(3.78), Inches(1.00), b, size=12, color=INK)

    # Table header
    cols = [Inches(0.42), Inches(4.55), Inches(8.68)]
    widths = [Inches(4.00), Inches(4.00), Inches(4.22)]
    headers = ["Existing approaches", "Identified limitations", "How this research responds"]
    for x, w, htxt in zip(cols, widths, headers):
        rect(s, x, Inches(2.70), w, Inches(0.38), NAVY)
        tb(s, x + Inches(0.12), Inches(2.70), w - Inches(0.2), Inches(0.38),
           htxt, size=12, bold=True, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)

    rows = [
        ["Scheduled ANC and paper records",
         "Limited continuity; delayed detection between visits",
         "Patient portal for ongoing symptom, test and history capture"],
        ["SMS tools and consumer pregnancy apps",
         "Often education-only; weak clinician workflow and referral",
         "Shared record plus clinician caseload, alerts and notes"],
        ["EHR modules and isolated AI tools",
         "Single-function tools; limited explainability or facility matching",
         "Guideline-based scoring, emergency overrides and Haversine referral"],
    ]
    for r, row in enumerate(rows):
        y = Inches(3.08 + r * 0.78)
        bg = WHITE if r % 2 == 0 else SOFT
        for x, w, cell in zip(cols, widths, row):
            rect(s, x, y, w, Inches(0.78), bg, LINE)
            tb(s, x + Inches(0.12), y + Inches(0.10), w - Inches(0.22), Inches(0.58),
               cell, size=12, color=INK)

    round_rect(s, Inches(0.42), Inches(5.52), Inches(6.15), Inches(1.52), RGBColor(0xEC, 0xFD, 0xF5), TEAL)
    round_rect(s, Inches(6.75), Inches(5.52), Inches(6.15), Inches(1.52), SOFT, LINE)
    tb(s, Inches(0.60), Inches(5.62), Inches(5.85), Inches(0.26),
       "HEALTH BELIEF MODEL (HBM)", size=11, bold=True, color=TEAL_DK)
    tb(s, Inches(0.60), Inches(5.90), Inches(5.85), Inches(0.95),
       "Helps explain why pregnant women may engage in health-monitoring activities when they perceive susceptibility, severity, benefits and cues to action (Rosenstock, 1974).",
       size=12, color=INK)
    tb(s, Inches(6.93), Inches(5.62), Inches(5.85), Inches(0.26),
       "TECHNOLOGY ACCEPTANCE MODEL (TAM)", size=11, bold=True, color=NAVY)
    tb(s, Inches(6.93), Inches(5.90), Inches(5.85), Inches(0.95),
       "Explains adoption through perceived usefulness and perceived ease of use (Davis, 1989) — both required if patients and clinicians are to use the portal in practice.",
       size=12, color=INK)

    notes(s, "Summarise three literature clusters: monitoring challenges, digital maternal-health tools, and the integration gap. Use the table to show that existing work often solves one fragment of the problem. Then mention HBM and TAM briefly: HBM informs why women may report symptoms; TAM informs why usefulness and ease of use matter for adoption. The contribution is an integrated artefact, not a new epidemiological study.")


def slide_06(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Three  ·  Methodology", "Research methodology", 6)

    round_rect(s, Inches(0.42), Inches(0.98), Inches(4.10), Inches(1.18), NAVY)
    tb(s, Inches(0.58), Inches(1.08), Inches(3.8), Inches(0.22),
       "RESEARCH DESIGN", size=10, bold=True, color=TEAL)
    tb(s, Inches(0.58), Inches(1.32), Inches(3.8), Inches(0.68),
       "Design Science Research (Hevner et al., 2004; Peffers et al., 2007)",
       size=14, bold=True, color=WHITE)

    round_rect(s, Inches(4.68), Inches(0.98), Inches(8.22), Inches(1.18), SOFT, LINE)
    tb(s, Inches(4.86), Inches(1.08), Inches(7.9), Inches(0.22),
       "DEVELOPMENT APPROACH", size=10, bold=True, color=TEAL)
    tb(s, Inches(4.86), Inches(1.32), Inches(7.9), Inches(0.68),
       "Agile Scrum, with selected SDLC practices for requirements, architecture, implementation and testing (Schwaber and Sutherland, 2020).",
       size=13, color=INK)

    sprints = [
        ("Sprint 1", "Foundations", "Database schema, authentication and patient registration.", TEAL),
        ("Sprint 2", "Clinical records", "Symptoms, laboratory results, patient dashboard and antenatal care schedule.", NAVY2),
        ("Sprint 3", "Decision support and referral", "Risk engine, alerts, notifications and facility matching.", MED),
        ("Sprint 4", "Hardening and demonstration", "Clinician dashboard, automated tests and cloud deployment.", HIGH),
    ]
    # DSR framework label + timeline spine
    round_rect(s, Inches(0.42), Inches(2.28), Inches(12.48), Inches(0.34), SOFT, LINE)
    tb(s, Inches(0.58), Inches(2.28), Inches(12.2), Inches(0.34),
       "SCRUM TIMELINE  ·  four two-week sprints inside the Design Science Research framework",
       size=10, bold=True, color=TEAL_DK, anchor=MSO_ANCHOR.MIDDLE)
    rect(s, Inches(0.80), Inches(2.92), Inches(11.75), Inches(0.05), TEAL)
    for i, (sp, title, body, col) in enumerate(sprints):
        x = Inches(0.42 + i * 3.22)
        dot = s.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.20), Inches(2.82), Inches(0.26), Inches(0.26))
        _fill(dot, col)
        round_rect(s, x, Inches(3.18), Inches(3.05), Inches(1.40), WHITE, LINE)
        rect(s, x, Inches(3.18), Inches(3.05), Inches(0.07), col)
        tb(s, x + Inches(0.14), Inches(3.28), Inches(2.8), Inches(0.22),
           sp.upper() + "  ·  2 WEEKS", size=10, bold=True, color=col)
        tb(s, x + Inches(0.14), Inches(3.50), Inches(2.8), Inches(0.28),
           title, size=12, bold=True, color=NAVY)
        tb(s, x + Inches(0.14), Inches(3.82), Inches(2.8), Inches(0.75),
           body, size=11, color=INK)

    # Bottom row
    round_rect(s, Inches(0.42), Inches(4.70), Inches(6.15), Inches(2.32), SOFT, LINE)
    tb(s, Inches(0.60), Inches(4.82), Inches(5.85), Inches(0.26),
       "REQUIREMENTS GATHERING", size=11, bold=True, color=NAVY)
    multi(s, Inches(0.60), Inches(5.14), Inches(5.85), Inches(1.75), [
        "•  Analysis of WHO maternal healthcare guidelines",
        "•  Review of ACOG and NICE clinical guidelines",
        "•  Review of existing digital maternal healthcare systems",
        "•  Scenario-based analysis of six maternal healthcare situations",
    ], size=13, color=INK, leading=4)

    round_rect(s, Inches(6.75), Inches(4.70), Inches(6.15), Inches(2.32), RGBColor(0xEC, 0xFD, 0xF5), TEAL)
    tb(s, Inches(6.93), Inches(4.82), Inches(5.85), Inches(0.26),
       "EVALUATION", size=11, bold=True, color=TEAL_DK)
    multi(s, Inches(6.93), Inches(5.14), Inches(5.85), Inches(1.75), [
        "•  Unit testing (Vitest)",
        "•  Functional testing of core modules",
        "•  Integration testing across the three tiers",
        "•  Clinical scenario checks on seeded demonstration data",
    ], size=13, color=INK, leading=4)

    notes(s, "Justify Design Science Research: the contribution is a working information-systems artefact, not a survey. DSR’s build–evaluate cycle matches Scrum. Requirements came from WHO, ACOG and NICE guidance plus six antenatal scenarios. Four two-week sprints produced the database, clinical records, decision support and hardening. Evaluation is technical verification on seeded data, not a clinical trial.")


def slide_07(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Three  ·  Analysis", "System requirements and functional modules", 7)

    roles = [
        ("Patients", "Pregnant women and new mothers", TEAL,
         ["Registration and authentication", "Obstetric profile", "Symptom reporting",
          "Laboratory submission and uploads", "Health history", "Risk results and recommendations",
          "WHO eight-contact ANC schedule", "Facility referrals"]),
        ("Clinicians", "Healthcare professionals with assigned patients", NAVY2,
         ["Caseload management", "Risk-distribution dashboard", "Patient health records",
          "Clinical alerts", "Clinical notes", "Referral management"]),
        ("Administrators", "System and user management", NAVY,
         ["User and role administration", "Access control", "Auditability of sensitive actions"]),
    ]
    for i, (title, sub, col, items) in enumerate(roles):
        x = Inches(0.42 + i * 4.28)
        round_rect(s, x, Inches(0.98), Inches(4.10), Inches(4.55), WHITE, LINE)
        rect(s, x, Inches(0.98), Inches(4.10), Inches(0.72), col)
        tb(s, x + Inches(0.16), Inches(1.02), Inches(3.78), Inches(0.32), title, size=16, bold=True, color=WHITE)
        tb(s, x + Inches(0.16), Inches(1.32), Inches(3.78), Inches(0.30), sub, size=11, color=WHITE)
        multi(s, x + Inches(0.18), Inches(1.82), Inches(3.74), Inches(3.5),
              ["•  " + it for it in items], size=12, color=INK, leading=3)

    round_rect(s, Inches(0.42), Inches(5.64), Inches(8.35), Inches(1.42), SOFT, LINE)
    tb(s, Inches(0.58), Inches(5.72), Inches(8.05), Inches(0.24),
       "SUPPORTING MODULES", size=11, bold=True, color=NAVY)
    tb(s, Inches(0.58), Inches(6.00), Inches(8.05), Inches(0.90),
       "Risk assessment engine  ·  Notifications  ·  Facility recommendation  ·  Health assistant  ·  Access control and auditability",
       size=13, color=INK)

    round_rect(s, Inches(8.92), Inches(5.64), Inches(3.98), Inches(1.42), RGBColor(0xEC, 0xFD, 0xF5), TEAL)
    tb(s, Inches(9.08), Inches(5.72), Inches(3.66), Inches(0.24),
       "NON-FUNCTIONAL", size=11, bold=True, color=TEAL_DK)
    tb(s, Inches(9.08), Inches(6.00), Inches(3.66), Inches(0.90),
       "Security, usability, scalability, maintainability and performance.",
       size=13, color=INK)

    notes(s, "Identify the three user roles and what each may do. Patients capture and review their own records. Clinicians see assigned caseloads, alerts and referrals. Administrators manage users and access. Supporting services — the risk engine, notifications, facility matching, assistant and audit controls — sit behind those roles. Mention the non-functional requirements without turning the slide into a full SRS.")


def slide_08(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Three–Four  ·  Design", "System architecture and technology stack", 8)

    # Users
    round_rect(s, Inches(0.42), Inches(0.98), Inches(12.48), Inches(0.58), SOFT, LINE)
    tb(s, Inches(0.58), Inches(1.08), Inches(12.2), Inches(0.38),
       "User browser (HTTPS / TLS)   →   Presentation   →   Application (Next.js Route Handlers)   →   Data   →   JSON response to the interface",
       size=13, bold=True, color=NAVY, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    tiers = [
        ("TIER 1  ·  PRESENTATION", RGBColor(0x1D, 0x4E, 0xD8),
         ["Next.js 14  ·  React 18  ·  TypeScript  ·  Tailwind CSS",
          "Patient portal   ·   Clinician portal",
          "Dashboards, forms, charts and map views"]),
        ("TIER 2  ·  APPLICATION", TEAL_DK,
         ["Next.js Route Handlers  ·  Node.js  (no separate Express server)",
          "NextAuth.js  ·  JWT  ·  validation and business logic",
          "Clinical risk engine  ·  facility matching  ·  alerts"]),
        ("TIER 3  ·  DATA", RGBColor(0x5B, 0x21, 0xB6),
         ["PostgreSQL 16  ·  Prisma ORM  ·  Neon cloud database",
          "Cloudinary for laboratory file storage",
          "Structured maternal records, assessments and referrals"]),
    ]
    for i, (title, col, lines) in enumerate(tiers):
        y = Inches(1.68 + i * 1.36)
        round_rect(s, Inches(0.42), y, Inches(9.15), Inches(1.06), WHITE, col)
        rect(s, Inches(0.42), y, Inches(0.14), Inches(1.06), col)
        tb(s, Inches(0.72), y + Inches(0.06), Inches(8.7), Inches(0.26), title, size=12, bold=True, color=col)
        tb(s, Inches(0.72), y + Inches(0.34), Inches(8.7), Inches(0.68),
           "\n".join(lines), size=12, color=INK)
        if i < 2:
            gy = y + Inches(1.06)
            down = s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(2.2), gy + Inches(0.03), Inches(0.26), Inches(0.24))
            _fill(down, col)
            up = s.shapes.add_shape(MSO_SHAPE.UP_ARROW, Inches(5.7), gy + Inches(0.03), Inches(0.26), Inches(0.24))
            _fill(up, MUTED)
            lab_dn = ["HTTPS · REST JSON request", "Prisma ORM · SQL queries"][i]
            lab_up = ["JSON response", "Result sets"][i]
            tb(s, Inches(2.52), gy, Inches(3.0), Inches(0.30), lab_dn, size=10, bold=True, color=col, anchor=MSO_ANCHOR.MIDDLE)
            tb(s, Inches(6.02), gy, Inches(3.0), Inches(0.30), lab_up, size=10, bold=True, color=MUTED, anchor=MSO_ANCHOR.MIDDLE)

    round_rect(s, Inches(9.75), Inches(1.68), Inches(3.15), Inches(3.84), NAVY)
    tb(s, Inches(9.93), Inches(1.86), Inches(2.80), Inches(0.28),
       "DEPLOYMENT", size=11, bold=True, color=TEAL)
    multi(s, Inches(9.93), Inches(2.24), Inches(2.80), Inches(3.1), [
        ("Vercel", {"size": 16, "bold": True, "color": WHITE}),
        ("Next.js UI and API routes", {"size": 12, "color": WHITE}),
        "",
        ("Neon", {"size": 16, "bold": True, "color": WHITE}),
        ("PostgreSQL 16  ·  pooling", {"size": 12, "color": WHITE}),
        "",
        ("Cloudinary", {"size": 16, "bold": True, "color": WHITE}),
        ("Laboratory files (PDF, JPG, PNG)", {"size": 12, "color": WHITE}),
    ], size=12, color=WHITE, leading=2)

    tb(s, Inches(0.42), Inches(5.62), Inches(12.48), Inches(1.40),
       "The presentation layer never talks to PostgreSQL directly. Browsers call Route Handlers; handlers authenticate the session, run Zod validation and the risk engine, then persist through Prisma. Results return as JSON and re-render the portal. Express.js is not used as a separate backend.",
       size=13, color=INK)

    notes(s, "Walk the three tiers top to bottom. Stress that the backend is Next.js Route Handlers on Node.js, not a separate Express server. Show the round trip: browser to presentation, to application logic, to Prisma/PostgreSQL, then back. Name Vercel, Neon and Cloudinary as the deployed services. This is the main technical architecture slide — be precise.")


def slide_09(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Four  ·  Implementation", "Database design and security", 9)

    tb(s, Inches(0.42), Inches(0.96), Inches(7.3), Inches(0.28),
       "PostgreSQL 16 with Prisma ORM", size=14, bold=True, color=NAVY)

    def ent(x, y, w, name, sub, col):
        round_rect(s, x, y, w, Inches(0.62), WHITE, col, radius=0.12)
        rect(s, x, y, w, Inches(0.24), col)
        tb(s, x, y, w, Inches(0.24), name, size=10, bold=True, color=WHITE,
           align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x, y + Inches(0.26), w, Inches(0.34), sub, size=9, color=MUTED,
           align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    def hline(x, y, w, col=MUTED):
        rect(s, x, y, w, Inches(0.025), col)

    def vline(x, y, h, col=MUTED):
        rect(s, x, y, Inches(0.025), h, col)

    # Row 1: identity and care
    w1 = Inches(1.62)
    xs1 = [Inches(0.42), Inches(2.33), Inches(4.24), Inches(6.15)]
    y1 = Inches(1.40)
    ent(xs1[0], y1, w1, "User", "email · role", NAVY)
    ent(xs1[1], y1, w1, "Patient", "LMP · EDD · parity", TEAL)
    ent(xs1[2], y1, w1, "Assignment", "patient–clinician", MED)
    ent(xs1[3], y1, w1, "Provider", "clinician profile", NAVY2)
    for i, lab in enumerate(["1 : 0..1", "1 : N", "N : 1"]):
        gx = xs1[i] + w1
        hline(gx, y1 + Inches(0.31), Inches(0.29))
        tb(s, gx - Inches(0.1), y1 + Inches(0.34), Inches(0.5), Inches(0.2), lab, size=8, color=MUTED, align=PP_ALIGN.CENTER)

    # Patient -> clinical records bus
    px = xs1[1] + w1 // 2
    vline(px, y1 + Inches(0.62), Inches(0.50))
    tb(s, px + Inches(0.06), y1 + Inches(0.70), Inches(2.6), Inches(0.22),
       "Patient 1 : N clinical records", size=9, bold=True, color=TEAL_DK)
    w2 = Inches(1.30)
    gap2 = (Inches(7.35) - 5 * w2) // 4
    xs2 = [Inches(0.42) + i * (w2 + gap2) for i in range(5)]
    y2 = Inches(2.78)
    hline(xs2[0] + w2 // 2, y2 - Inches(0.28), xs2[4] - xs2[0])
    for i, (nm, sb) in enumerate([("Symptom", "severity 1–5"), ("TestResult", "value · file URL"),
                                  ("RiskAssessment", "level · score"), ("Alert", "type · status"),
                                  ("AncAttendance", "contact 1–8")]):
        vline(xs2[i] + w2 // 2, y2 - Inches(0.28), Inches(0.28))
        ent(xs2[i], y2, w2, nm, sb, [HIGH, MED, NAVY, HIGH, TEAL][i])

    # Row 3: referral and notes
    y3 = Inches(4.25)
    xs3 = [Inches(0.42), Inches(2.33), Inches(4.24), Inches(6.15)]
    ent(xs3[0], y3, w1, "Referral", "status · reason", NAVY2)
    ent(xs3[1], y3, w1, "Facility", "location · services", RGBColor(0x5B, 0x21, 0xB6))
    ent(xs3[2], y3, w1, "ClinicalNote", "author · content", NAVY)
    ent(xs3[3], y3, w1, "Notification", "alert-linked", TEAL)
    hline(xs3[0] + w1, y3 + Inches(0.31), Inches(0.29))
    tb(s, xs3[0] + w1 - Inches(0.1), y3 + Inches(0.34), Inches(0.5), Inches(0.2), "N : 1", size=8, color=MUTED, align=PP_ALIGN.CENTER)
    vline(px, y2 + Inches(0.62), Inches(0.0))
    tb(s, Inches(0.42), y3 - Inches(0.34), Inches(7.3), Inches(0.24),
       "Coordination, notes and notifications", size=9, bold=True, color=TEAL_DK)

    round_rect(s, Inches(0.42), Inches(5.12), Inches(7.35), Inches(1.90), SOFT, LINE)
    tb(s, Inches(0.58), Inches(5.20), Inches(7.05), Inches(0.24),
       "PRINCIPAL RELATIONSHIPS", size=11, bold=True, color=NAVY)
    multi(s, Inches(0.58), Inches(5.48), Inches(7.05), Inches(1.5), [
        "•  A patient has many symptoms, tests, assessments, alerts and referrals.",
        "•  Patients are assigned to clinicians through a junction table (N : M).",
        "•  A healthcare facility can receive many referrals.",
        "•  Cascade rules keep clinical rows tied to the owning patient.",
    ], size=12, color=INK, leading=2)

    round_rect(s, Inches(8.00), Inches(0.96), Inches(4.90), Inches(6.06), NAVY)
    tb(s, Inches(8.18), Inches(1.10), Inches(4.54), Inches(0.28),
       "SECURITY CONTROLS", size=13, bold=True, color=TEAL)
    controls = [
        "bcryptjs hashing with 12 salt rounds",
        "NextAuth.js with JWT sessions",
        "HTTP-only session cookies",
        "Role-based access control (RBAC)",
        "Zod validation of inbound payloads",
        "HTTPS / TLS in production",
        "Role-restricted patient and clinician data",
        "Password-reset tokens expire in 30 minutes",
    ]
    for i, c in enumerate(controls):
        y = Inches(1.50 + i * 0.64)
        round_rect(s, Inches(8.22), y, Inches(0.36), Inches(0.36), TEAL)
        tb(s, Inches(8.22), y, Inches(0.36), Inches(0.36), str(i + 1),
           size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, Inches(8.68), y, Inches(4.00), Inches(0.36), c, size=12, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)

    notes(s, "Explain that maternal records live in PostgreSQL 16 via Prisma. Sketch the main entity groups rather than every column. Then cover security as a stack: hashing, JWT cookies, RBAC, validation, TLS, role-restricted queries and short-lived reset tokens. Sensitive health data is never treated as a public resource.")


def slide_10(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Four  ·  Decision support", "Clinical risk assessment engine", 10)

    steps = [
        ("1", "Collect", "Symptoms, history, available vitals and laboratory results."),
        ("2", "Extract", "Fourteen predictors plus contextual modifiers."),
        ("3", "Score", "Recorded features contribute to a normalised 0–1 score."),
        ("4", "Override", "Danger signs can override the numerical score."),
        ("5", "Classify", "LOW / MEDIUM / HIGH with contributing factors."),
        ("6", "Advise", "Recommendations, suggested tests and alerts."),
    ]
    for i, (n, t, b) in enumerate(steps):
        x = Inches(0.32 + i * 2.16)
        round_rect(s, x, Inches(0.98), Inches(2.05), Inches(1.72), SOFT, LINE)
        round_rect(s, x + Inches(0.12), Inches(1.10), Inches(0.32), Inches(0.32), TEAL)
        tb(s, x + Inches(0.12), Inches(1.10), Inches(0.32), Inches(0.32), n,
           size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x + Inches(0.48), Inches(1.12), Inches(1.45), Inches(0.30), t, size=13, bold=True, color=NAVY)
        tb(s, x + Inches(0.12), Inches(1.50), Inches(1.80), Inches(1.05), b, size=11, color=INK)

    # Classifications
    bands = [
        ("LOW", "Score below 0.28, without a higher-risk condition.", LOW, RGBColor(0xEC, 0xFD, 0xF5)),
        ("MEDIUM", "Score ≥ 0.28, or glucose ≥ 140 mg/dL, unless a higher-risk condition applies.", MED, RGBColor(0xFF, 0xF7, 0xED)),
        ("HIGH", "Score ≥ 0.55, or a qualifying emergency danger sign.", HIGH, RGBColor(0xFE, 0xF2, 0xF2)),
    ]
    for i, (t, b, col, bg) in enumerate(bands):
        x = Inches(0.42 + i * 4.28)
        round_rect(s, x, Inches(2.86), Inches(4.10), Inches(1.22), bg, col)
        tb(s, x + Inches(0.16), Inches(2.96), Inches(3.78), Inches(0.28), t, size=16, bold=True, color=col)
        tb(s, x + Inches(0.16), Inches(3.28), Inches(3.78), Inches(0.68), b, size=12, color=INK)

    round_rect(s, Inches(0.42), Inches(4.24), Inches(6.15), Inches(2.78), WHITE, LINE)
    tb(s, Inches(0.58), Inches(4.36), Inches(5.85), Inches(0.26),
       "SCREENING AREAS  ·  DECISION SUPPORT", size=11, bold=True, color=NAVY)
    multi(s, Inches(0.58), Inches(4.68), Inches(5.85), Inches(2.20), [
        "•  Pre-eclampsia",
        "•  Gestational diabetes",
        "•  Preterm labour",
        "•  Missing observations are flagged incomplete — never assumed normal.",
        "•  Output: factors, suggested tests/actions, care advice, urgency.",
    ], size=13, color=INK, leading=3)

    round_rect(s, Inches(6.75), Inches(4.24), Inches(6.15), Inches(2.78), NAVY)
    tb(s, Inches(6.93), Inches(4.36), Inches(5.80), Inches(0.26),
       "IMPORTANT TECHNICAL CLARIFICATION", size=11, bold=True, color=TEAL)
    tb(s, Inches(6.93), Inches(4.70), Inches(5.80), Inches(2.10),
       "The production engine is a deterministic TypeScript weighted scoring and rule-based component. The optional Random Forest model is an offline research artefact and is not executed during production requests. WMHS supports clinical decision-making; it does not autonomously diagnose disease.",
       size=14, color=WHITE)

    notes(s, "Walk the pipeline from data collection to alerts. Emphasise fourteen predictors, weighted scoring, and emergency overrides that can raise the class even when the numeric score is lower. State the LOW / MEDIUM / HIGH thresholds exactly. Stress two safety points: missing vitals are not treated as normal, and the live engine is deterministic TypeScript, not a production Random Forest. The system is decision support, not a diagnostic device.")


def slide_11(prs, shots):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Four  ·  Demonstration", "System implementation and demonstration", 11)

    cells = [
        ("1", "Patient registration", "Identity and obstetric details, including last menstrual period.", shots["register"]),
        ("2", "Patient dashboard", "Gestational age, current risk and recent records.", shots["dashboard"]),
        ("3", "Symptom submission", "Symptom, severity and notes; the engine runs on save.", shots["symptom"]),
        ("4", "Risk assessment", "Risk class, score, care plan and complication screens.", shots["risk"]),
        ("5", "Clinician dashboard", "Caseload, risk distribution and alerts.", shots["clinician"]),
        ("6", "Facility referral", "Ranked by location, emergency capability and service need.", shots["referral"]),
    ]
    cw, ch = Inches(4.02), Inches(2.96)
    for i, (n, cap, sub, path) in enumerate(cells):
        col, row = i % 3, i // 3
        x = Inches(0.42) + col * (cw + Inches(0.21))
        y = Inches(1.00) + row * (ch + Inches(0.10))
        round_rect(s, x, y, cw, ch, WHITE, LINE)
        ix, iy, iw, ih = x + Inches(0.08), y + Inches(0.08), cw - Inches(0.16), Inches(1.98)
        if path is not None:
            round_rect(s, ix, iy, iw, ih, SOFT, LINE, radius=0.02)
            add_contain(s, path, ix, iy, iw, ih, top=False)
        else:
            round_rect(s, ix, iy, iw, ih, SOFT, LINE, radius=0.02)
            tb(s, ix, iy + Inches(0.55), iw, Inches(0.4), "Insert screenshot from the running application",
               size=12, bold=True, color=TEAL_DK, align=PP_ALIGN.CENTER)
            tb(s, ix, iy + Inches(0.95), iw, Inches(0.5),
               "/patient/dashboard" if i == 1 else "/patient/referrals  (facility map)",
               size=11, color=MUTED, align=PP_ALIGN.CENTER)
        round_rect(s, x + Inches(0.14), y + Inches(2.18), Inches(0.30), Inches(0.30), TEAL)
        tb(s, x + Inches(0.14), y + Inches(2.18), Inches(0.30), Inches(0.30), n,
           size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x + Inches(0.52), y + Inches(2.16), cw - Inches(0.6), Inches(0.34), cap,
           size=13, bold=True, color=NAVY, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x + Inches(0.14), y + Inches(2.52), cw - Inches(0.28), Inches(0.42), sub, size=11, color=MUTED)

    notes(s, "Demonstrate the journey: a woman registers with her last menstrual period, lands on a dashboard showing gestational age and risk, logs a symptom, sees a classification with contributing factors, and a clinician reviews caseload and alerts. Referral then recommends a suitable facility by location, emergency capability and service need. Present this as a walkthrough of the artefact on seeded data, not a clinical claim.")
    return s


def _slide_11_old(prs, shots):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Four  ·  Demonstration", "System implementation and demonstration", 11)

    steps = [
        "1  Register + LMP",
        "2  Patient dashboard",
        "3  Log symptoms",
        "4  Risk result",
        "5  Clinician caseload",
        "6  Facility referral",
    ]
    for i, t in enumerate(steps):
        x = Inches(0.32 + i * 2.16)
        round_rect(s, x, Inches(0.96), Inches(2.05), Inches(0.40), TEAL if i in (0, 2, 3, 4) else NAVY)
        tb(s, x, Inches(0.96), Inches(2.05), Inches(0.40), t,
           size=10, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

    captions = [
        ("Registration", "Identity, obstetric profile and last menstrual period."),
        ("Symptom submission", "Type, severity and notes; engine runs on save."),
        ("Risk result", "LOW / MEDIUM / HIGH, factors and complication screens."),
        ("Clinician dashboard", "Caseload, risk distribution and alerts."),
    ]
    paths = [shots["register"], shots["symptom"], shots["risk"], shots["clinician"]]
    for i, ((cap, sub), path) in enumerate(zip(captions, paths)):
        col, row = i % 4, 0
        x = Inches(0.32 + col * 3.25)
        y = Inches(1.48)
        round_rect(s, x, y, Inches(3.12), Inches(4.55), WHITE, LINE)
        # picture
        try:
            s.shapes.add_picture(str(path), x + Inches(0.08), y + Inches(0.08), Inches(2.96), Inches(3.35))
        except Exception:
            pass
        tb(s, x + Inches(0.10), y + Inches(3.46), Inches(2.92), Inches(0.28),
           cap, size=12, bold=True, color=NAVY)
        tb(s, x + Inches(0.10), y + Inches(3.74), Inches(2.92), Inches(0.70),
           sub, size=11, color=MUTED)

    tb(s, Inches(0.42), Inches(6.10), Inches(12.48), Inches(0.95),
       "After login the patient dashboard shows gestational age, current risk and recent records. Referral ranks nearby facilities by location, emergency capability and service need (Haversine matching), then supports tracking and a printable letter. Screenshots are from the implemented WMHS interfaces in the project report — not stock medical software.",
       size=12, color=INK)

    notes(s, "Demonstrate the journey: a woman registers with last menstrual period, lands on a dashboard with gestational age and risk, logs a symptom, sees a classification with contributing factors, and a clinician reviews caseload and alerts. Referral then recommends a suitable facility. Keep the tone as a walkthrough of the artefact, not a live clinical claim. Invite the panel to inspect the running system if a demonstration follows.")


def slide_12(prs, shots):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Four  ·  Evaluation", "System testing and results", 12)

    metrics = [
        ("20", "Functional test cases passed"),
        ("7", "Integration workflows passed"),
        ("8", "Clinical scenarios passed"),
        ("~2 s", "Observed interactive response"),
    ]
    for i, (n, lab) in enumerate(metrics):
        x = Inches(0.42 + i * 3.22)
        round_rect(s, x, Inches(1.00), Inches(3.05), Inches(1.42), NAVY)
        tb(s, x, Inches(1.10), Inches(3.05), Inches(0.70), n,
           size=28, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        tb(s, x + Inches(0.12), Inches(1.80), Inches(2.80), Inches(0.48), lab,
           size=12, color=WHITE, align=PP_ALIGN.CENTER)

    methods = [
        ("Unit testing", "Vitest suites for the engine, vital rules, helpers and access guards."),
        ("Functional testing", "Twenty black-box cases across registration, risk, alerts, referral and uploads."),
        ("Integration testing", "Seven end-to-end workflows spanning presentation, application and data tiers."),
        ("Clinical scenarios", "Eight seeded scenario checks, including emergency HIGH classification."),
        ("Performance", "Informal workstation observations; interactive operations typically within about two seconds."),
    ]
    for i, (t, b) in enumerate(methods):
        y = Inches(2.58 + i * 0.62)
        round_rect(s, Inches(0.42), y, Inches(12.48), Inches(0.56), SOFT if i % 2 == 0 else WHITE, LINE)
        tb(s, Inches(0.58), y + Inches(0.06), Inches(2.6), Inches(0.44), t, size=13, bold=True, color=TEAL, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, Inches(3.20), y + Inches(0.06), Inches(9.5), Inches(0.44), b, size=13, color=INK, anchor=MSO_ANCHOR.MIDDLE)

    tb(s, Inches(0.42), Inches(5.78), Inches(12.48), Inches(1.25),
       "Verified behaviours.  Missing clinical observations were listed as missing/incomplete, not treated as normal. Emergency danger-sign scenarios classified as HIGH. Evaluation used seeded demonstration accounts and synthetic records.\nThese are technical verification results, not clinical validation of diagnostic accuracy or maternal-outcome improvement. The abstract’s 92.4% accuracy / 94.7% sensitivity figures are not presented here as validated clinical findings.",
       size=13, color=INK)

    notes(s, "Report only what was tested: unit, functional, integration and eight clinical scenarios on seeded data. State the four headline counts. Mention the two-second informal observation with its workstation limitation. Explicitly refuse claims of diagnostic accuracy or reduced mortality. If asked about 92.4% accuracy, say that figure is not used as a validated clinical result in this defence.")


def slide_13(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Five  ·  Contribution", "Contribution to knowledge", 13)

    items = [
        ("01", "Integrated monitoring",
         "The artefact combines symptom and test recording, antenatal monitoring, patient risk assessment, clinician dashboards, alerts and location-based facility referral in one web platform."),
        ("02", "Explainable decision support",
         "Guideline-based weighted scoring and emergency overrides make classifications and contributing factors inspectable, unlike an unexplained black-box prediction."),
        ("03", "Traceable evaluation",
         "Clinical guidelines and requirements are connected to implementation and verification through unit tests, functional tests, integration workflows and clinical scenarios."),
    ]
    for i, (n, t, b) in enumerate(items):
        x = Inches(0.42 + i * 4.28)
        round_rect(s, x, Inches(1.02), Inches(4.10), Inches(4.05), WHITE, LINE)
        rect(s, x, Inches(1.02), Inches(4.10), Inches(0.10), TEAL)
        tb(s, x + Inches(0.22), Inches(1.28), Inches(3.66), Inches(0.36), n, size=20, bold=True, color=TEAL)
        tb(s, x + Inches(0.22), Inches(1.72), Inches(3.66), Inches(0.80), t, size=18, bold=True, color=NAVY)
        tb(s, x + Inches(0.22), Inches(2.60), Inches(3.66), Inches(2.20), b, size=14, color=INK)

    round_rect(s, Inches(0.42), Inches(5.22), Inches(12.48), Inches(1.82), NAVY)
    tb(s, Inches(0.64), Inches(5.38), Inches(12.05), Inches(0.26),
       "ACADEMIC VALUE", size=11, bold=True, color=TEAL)
    tb(s, Inches(0.64), Inches(5.70), Inches(12.05), Inches(1.15),
       "The project demonstrates how web technologies and explainable clinical decision-support logic can be integrated into a maternal health monitoring and referral platform. It does not claim clinically established improvements in maternal outcomes or diagnostic accuracy.",
       size=16, color=WHITE)

    notes(s, "Frame the contribution as design knowledge: an integrated platform, an explainable engine, and a traceable evaluation path. Do not claim that maternal mortality fell or that the engine is diagnostically accurate. The value is showing that web technology plus guideline-based rules can be assembled, inspected and technically verified as a decision-support artefact.")


def slide_14(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    header(s, "Chapter Five  ·  Reflection", "Limitations and recommendations", 14)

    round_rect(s, Inches(0.42), Inches(0.98), Inches(6.15), Inches(0.44), RGBColor(0xFE, 0xF2, 0xF2), HIGH)
    tb(s, Inches(0.42), Inches(0.98), Inches(6.15), Inches(0.44),
       "LIMITATIONS", size=13, bold=True, color=HIGH, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    limits = [
        "No clinical field trial was conducted.",
        "Evaluation used seeded accounts and synthetic records.",
        "No external labelled dataset for diagnostic accuracy.",
        "SMS notifications are a demonstration stub.",
        "Facility directory is seeded, not a national register.",
        "No DHIS2 or EMR integration.",
        "No formal SUS study or large-scale load test.",
    ]
    for i, t in enumerate(limits):
        y = Inches(1.52 + i * 0.72)
        round_rect(s, Inches(0.42), y, Inches(6.15), Inches(0.64), SOFT, LINE)
        round_rect(s, Inches(0.56), y + Inches(0.16), Inches(0.32), Inches(0.32), HIGH)
        tb(s, Inches(0.56), y + Inches(0.16), Inches(0.32), Inches(0.32), str(i + 1),
           size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, Inches(1.02), y + Inches(0.12), Inches(5.35), Inches(0.40), t, size=13, color=INK, anchor=MSO_ANCHOR.MIDDLE)

    round_rect(s, Inches(6.75), Inches(0.98), Inches(6.15), Inches(0.44), RGBColor(0xEC, 0xFD, 0xF5), TEAL)
    tb(s, Inches(6.75), Inches(0.98), Inches(6.15), Inches(0.44),
       "RECOMMENDATIONS", size=13, bold=True, color=TEAL_DK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    recs = [
        "Conduct field evaluation in PHCs and referral hospitals.",
        "Involve midwives, nurses and obstetricians in validation.",
        "Validate the engine on labelled, de-identified clinical data.",
        "Explore SMS, USSD and offline use for low connectivity.",
        "Integrate with existing health information systems.",
        "Undertake formal usability, security and performance tests.",
        "Keep emergency rules if machine-learning is later added.",
    ]
    recs = recs[:6]
    for i, t in enumerate(recs):
        y = Inches(1.52 + i * 0.84)
        round_rect(s, Inches(6.75), y, Inches(6.15), Inches(0.74), RGBColor(0xF0, 0xFD, 0xFA), LINE)
        round_rect(s, Inches(6.89), y + Inches(0.20), Inches(0.32), Inches(0.32), TEAL)
        tb(s, Inches(6.89), y + Inches(0.20), Inches(0.32), Inches(0.32), str(i + 1),
           size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, Inches(7.35), y + Inches(0.12), Inches(5.35), Inches(0.50), t, size=13, color=INK, anchor=MSO_ANCHOR.MIDDLE)

    notes(s, "Be academically honest. The work is a technical demonstration on synthetic records. State the operational stubs — SMS, facility directory, no DHIS2 — without apology or concealment. Then turn each limitation into a future-research recommendation. This slide shows the candidate understands the boundary between software verification and clinical validation.")


def slide_15(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, WHITE)
    rect(s, 0, 0, Inches(0.14), H, TEAL)
    footer(s, 15)

    tb(s, Inches(0.42), Inches(0.18), Inches(12.4), Inches(0.22),
       "CONCLUSION  ·  REFERENCES  ·  QUESTIONS", size=10, bold=True, color=TEAL)
    tb(s, Inches(0.42), Inches(0.38), Inches(12.4), Inches(0.38),
       "Conclusion", size=22, bold=True, color=NAVY)
    rect(s, Inches(0.42), Inches(0.78), Inches(1.35), Inches(0.045), TEAL)

    tb(s, Inches(0.42), Inches(0.92), Inches(12.48), Inches(0.85),
       "The study designed, implemented and technically evaluated a web-based maternal health monitoring system that integrates patient health-data capture, guideline-based risk assessment, clinician monitoring, antenatal-care tracking and location-based healthcare facility referral.",
       size=14, color=INK)

    ach = [
        ("1", "A functional patient and clinician web platform."),
        ("2", "An explainable clinical risk assessment and alert mechanism."),
        ("3", "An integrated facility referral recommendation and tracking workflow."),
    ]
    for i, (n, t) in enumerate(ach):
        x = Inches(0.42 + i * 4.28)
        round_rect(s, x, Inches(1.82), Inches(4.10), Inches(0.85), SOFT, LINE)
        tb(s, x + Inches(0.16), Inches(1.92), Inches(3.78), Inches(0.65), f"{n}   {t}", size=13, color=NAVY)

    round_rect(s, Inches(0.42), Inches(2.80), Inches(12.48), Inches(1.15), NAVY)
    tb(s, Inches(0.62), Inches(2.96), Inches(12.10), Inches(0.85),
       "The study demonstrates the feasibility of integrating web technologies and guideline-based clinical decision support to support maternal health monitoring and referral in the Nigerian healthcare environment.",
       size=15, bold=True, color=WHITE)

    tb(s, Inches(0.42), Inches(4.08), Inches(8.6), Inches(0.26),
       "SELECTED REFERENCES", size=11, bold=True, color=TEAL)
    refs = [
        "WHO (2016). Recommendations on antenatal care for a positive pregnancy experience. Geneva: WHO.",
        "WHO (2017). Managing complications in pregnancy and childbirth. 2nd edn. Geneva: WHO.",
        "ACOG (2020). Practice Bulletin No. 222: Gestational hypertension and preeclampsia.",
        "NICE (2019). Hypertension in pregnancy: diagnosis and management. NG133.",
        "Hevner et al. (2004). Design science in information systems research. MIS Quarterly, 28(1), 75–105.",
        "Peffers et al. (2007). A design science research methodology. JMIS, 24(3), 45–77.",
        "Davis, F.D. (1989). Perceived usefulness, perceived ease of use… MIS Quarterly, 13(3), 319–340.",
    ]
    multi(s, Inches(0.42), Inches(4.36), Inches(8.7), Inches(2.70), refs, size=11, color=MUTED, leading=2)

    round_rect(s, Inches(9.30), Inches(4.08), Inches(3.60), Inches(2.95), TEAL)
    tb(s, Inches(9.48), Inches(4.40), Inches(3.24), Inches(0.70),
       "THANK YOU", size=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    tb(s, Inches(9.48), Inches(5.10), Inches(3.24), Inches(0.50),
       "Questions and answers", size=14, color=WHITE, align=PP_ALIGN.CENTER)
    tb(s, Inches(9.48), Inches(5.70), Inches(3.24), Inches(0.90),
       "Muritala, Muyideen Babatunde\n249074191  ·  MIT899",
       size=12, color=WHITE, align=PP_ALIGN.CENTER)

    notes(s, "Conclude confidently: the artefact was designed, implemented and technically evaluated. Restate the three achievements and the feasibility statement. Acknowledge the supervisors and the panel. Invite questions. If asked about clinical impact, return to the limitation that no field trial was conducted.")


def main():
    shots = {
        "register": prepare_jpeg(ASSETS / "p74_1.jpg", WORK / "register.jpg"),
        "symptom": prepare_jpeg(ASSETS / "p75_1.png", WORK / "symptom.jpg"),
        "risk": prepare_jpeg(ASSETS / "p76_1.png", WORK / "risk.jpg"),
        "clinician": prepare_jpeg(ASSETS / "p76_2.jpg", WORK / "clinician.jpg"),
        # Captured from the running WMHS application (seeded demo account)
        "dashboard": crop_aspect(ASSETS / "live/dashboard.png", WORK / "dashboard.jpg", 3.86 / 1.98),
        "referral": crop_aspect(ASSETS / "live/referrals_map.png", WORK / "referral.jpg", 3.86 / 1.98),
    }

    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H

    slide_01(prs)
    slide_02(prs)
    slide_03(prs)
    slide_04(prs)
    slide_05(prs)
    slide_06(prs)
    slide_07(prs)
    slide_08(prs)
    slide_09(prs)
    slide_10(prs)
    slide_11(prs, shots)
    slide_12(prs, shots)
    # drop the unused legacy slide helper output (never called)
    slide_13(prs)
    slide_14(prs)
    slide_15(prs)

    prs.save(OUT)
    print("Wrote", OUT, "slides", len(prs.slides), "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
