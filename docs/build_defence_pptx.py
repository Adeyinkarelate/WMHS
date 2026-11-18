#!/usr/bin/env python3
"""Build WMHS-MIT899-Defence-Professional.pptx (15 slides, editable shapes).

Design system lives in docs/pptx_design.py.  Content and research claims are
unchanged from the v1 deck (docs/build_defence_pptx_v1.py); this file is a
visual redesign only.
"""
from __future__ import annotations

import json
from pathlib import Path

from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches

from pptx_design import *  # noqa: F401,F403
from pptx_design import (ASSETS, PHOTOS, ROOT, I, T_BODY, T_BODY_S, T_H2, T_H3, T_LABEL)

OUT = ROOT / "WMHS-MIT899-Defence-Professional.pptx"
NOTES = json.loads((ROOT / "docs" / "speaker_notes.json").read_text(encoding="utf-8"))
LIVE = ASSETS / "live"
CREDIT = "Photographs: Unsplash (Unsplash licence)."

C = PP_ALIGN.CENTER
M = MSO_ANCHOR.MIDDLE
TOP = MSO_ANCHOR.TOP


def label(slide, x, y, w, txt, color=TEAL, size=T_LABEL, align=PP_ALIGN.LEFT, h=0.28):
    return text(slide, x, y, w, h, txt.upper(), size=size, bold=True, color=color, align=align,
                anchor=M)


# =========================================================================== 1
def slide_01(prs):
    s = new_slide(prs)
    px = 7.75
    img = prep_image(PHOTOS / "hero.jpg", "cover_hero.jpg", (SW - px) / SH, ax=0.52, tone=True,
                     tint=(0x10, 0x2A, 0x43), tint_alpha=0.10)
    picture(s, img, px, 0, SW - px, SH)
    shape(s, px, 0, 0.09, SH, fill=TEAL)
    text(s, SW - 3.3, 7.12, 3.1, 0.25, "Photograph: Unsplash", size=9, color=WHITE,
         align=PP_ALIGN.RIGHT, anchor=M)

    x = 0.7
    shape(s, x, 0.55, 0.07, 0.62, fill=TEAL)
    text(s, x + 0.22, 0.52, 6.5, 0.36, "UNIVERSITY OF LAGOS", size=17, bold=True, color=NAVY, anchor=M)
    text(s, x + 0.22, 0.88, 6.5, 0.3, "Department of Computer Sciences  ·  Nigeria", size=14,
         color=MUTED, anchor=M)

    label(s, x, 1.45, 6.8, "Master of Information Technology  ·  Project defence")
    text(s, x, 1.82, 6.8, 1.75,
         ["Design and Implementation", "of a Web-Based Maternal Health", "Monitoring System"],
         size=30, bold=True, color=NAVY, spacing=1.04)
    shape(s, x, 3.55, 1.2, 0.06, fill=TEAL)
    text(s, x, 3.75, 6.7, 0.7,
         "A Design Science Research artefact for antenatal monitoring, guideline-based risk "
         "assessment and facility referral", size=15, color=MUTED, spacing=1.05)

    grid = [
        ("Student", "Muritala, Muyideen Babatunde", 0.7, 4.7, 3.9),
        ("Matriculation number", "249074191", 4.95, 4.7, 2.5),
        ("Programme", "Master of Information Technology (MIT)", 0.7, 5.4, 3.9),
        ("Course code", "MIT899", 4.95, 5.4, 2.5),
        ("Supervisors", ["Professor C.O. Uwadia", "Dr R.A. Koleoso"], 0.7, 6.1, 3.9),
        ("Date", "October 2026", 4.95, 6.1, 2.5),
    ]
    hline(s, x, 4.55, 6.75, color=LINE)
    for lab, val, gx, gy, gw in grid:
        label(s, gx, gy, gw, lab, size=12)
        text(s, gx, gy + 0.27, gw, 0.5, val, size=15, bold=True, color=NAVY, spacing=1.0)
    notes(s, NOTES[0] + "  " + CREDIT)


# =========================================================================== 2
def slide_02(prs):
    s = new_slide(prs)
    page_title(s, "Chapter One  ·  Introduction", "Background of the study")
    footer(s, 2)

    pts = [
        "Maternal healthcare remains a significant public health challenge in Nigeria.",
        "Monitoring relies heavily on scheduled antenatal visits.",
        "Pregnancy complications may emerge between visits.",
        "Clinicians struggle to monitor many patients and identify urgent cases.",
        "Digital health and risk assessment can improve monitoring and referral.",
    ]
    y0, pitch = 1.5, 0.84
    for i, p in enumerate(pts):
        y = y0 + i * pitch
        oval(s, 0.6, y + 0.04, 0.34, fill=TEAL, paras=str(i + 1), size=13, bold=True,
             color=WHITE, align=C, margins=(0, 0, 0, 0))
        text(s, 1.1, y, 3.6, 0.78, p, size=14, color=INK, spacing=1.0)

    rx, rw = 4.95, 7.78
    th = prep_image(PHOTOS / "pregnant.jpg", "bg_trad.jpg", 1.7 / 1.7, ax=0.5, tone=True)
    dg = prep_image(PHOTOS / "hands.jpg", "bg_digi.jpg", 1.7 / 1.7, ax=0.35, tone=True)

    # Row A: traditional
    ya, rh = 1.55, 1.7
    shape(s, rx, ya, rw, rh, fill=GREY, line=LINE, lw=0.75)
    picture(s, th, rx, ya, 1.7, rh)
    label(s, rx + 1.9, ya + 0.1, 5.7, "Traditional antenatal monitoring", color=NAVY)
    nx, nw, gap = rx + 1.9, 1.66, 0.35
    trad = ["Scheduled antenatal visits", "Periodic assessment", "Possible delay in detecting complications"]
    prev = None
    for i, t in enumerate(trad):
        last = i == 2
        n = shape(s, nx + i * (nw + gap), ya + 0.5, nw, 1.0,
                  fill=AMBER_LT if last else WHITE, line=AMBER if last else LINE, lw=1.0,
                  paras=t, size=13, bold=last, color=AMBER if last else INK, align=C,
                  margins=(0.06, 0.04, 0.06, 0.04))
        if prev is not None:
            connector(s, prev, 3, n, 1, color=MUTED, lw=1.75)
        prev = n

    # transition arrow
    oval(s, rx + rw / 2 - 0.2, ya + rh + 0.07, 0.4, fill=TEAL)
    pic = icon(s, "arrow-right", "white", rx + rw / 2 - 0.12, ya + rh + 0.15, 0.24)
    pic.rotation = 90

    # Row B: digital
    yb = ya + rh + 0.54
    shape(s, rx, yb, rw, rh, fill=TEAL_LT, line=TEAL, lw=0.75)
    picture(s, dg, rx, yb, 1.7, rh)
    label(s, rx + 1.9, yb + 0.1, 5.7, "Digital maternal health monitoring", color=TEAL)
    dnw, dgap = 1.24, 0.25
    digi = ["Patient health updates", "Continuous record capture", "Risk assessment", "Clinician attention"]
    prev = None
    for i, t in enumerate(digi):
        last = i == 3
        n = shape(s, nx + i * (dnw + dgap), yb + 0.5, dnw, 1.0,
                  fill=TEAL if last else WHITE, line=TEAL, lw=1.0, paras=t, size=13,
                  bold=last, color=WHITE if last else INK, align=C,
                  margins=(0.05, 0.04, 0.05, 0.04))
        if prev is not None:
            connector(s, prev, 3, n, 1, color=TEAL, lw=1.75)
        prev = n
    text(s, rx, yb + rh + 0.03, rw, 0.22, CREDIT, size=9, color=MUTED, align=PP_ALIGN.RIGHT, anchor=M)

    # why it matters
    shape(s, 0.6, 5.78, CW, 1.1, fill=WHITE, line=LINE, lw=0.75)
    shape(s, 0.6, 5.78, 0.09, 1.1, fill=TEAL)
    label(s, 0.88, 5.84, 8, "Why continuous monitoring matters")
    text(s, 0.88, 6.14, 11.6, 0.72,
         "Scheduled visits remain essential but do not observe the mother between contacts. "
         "Continuous capture of symptoms, vitals and laboratory results supports guideline-based "
         "risk classification and timely clinician review.", size=15, color=INK, spacing=1.03)
    notes(s, NOTES[1] + "  " + CREDIT)


# =========================================================================== 3
def slide_03(prs):
    s = new_slide(prs)
    page_title(s, "Chapter One  ·  Introduction", "Statement of the problem")
    footer(s, 3)

    probs = [
        ("activity", "Limited continuity of monitoring between antenatal appointments"),
        ("triangle-alert", "Delayed identification of potentially dangerous complications"),
        ("folder-open", "Fragmented information across paper records, laboratories and facilities"),
        ("scale", "Limited automated risk assessment and patient prioritisation"),
        ("map-pin", "Difficulty identifying appropriate facilities for referral"),
    ]
    cons = [
        "Delayed clinical attention",
        "Incomplete patient health histories",
        "Difficulty prioritising high-risk patients",
        "Inefficient referral coordination",
    ]
    link = [0, 0, 1, 2, 3]

    label(s, 0.6, 1.42, 5.9, "Five challenges", color=NAVY)
    label(s, 8.2, 1.42, 4.5, "Consequences", color=AMBER)
    y0, pitch, rh = 1.78, 0.7, 0.6
    rows = []
    for i, (ic, t) in enumerate(probs):
        y = y0 + i * pitch
        r = shape(s, 0.6, y, 6.1, rh, fill=GREY, line=None)
        shape(s, 0.6, y, 0.06, rh, fill=NAVY)
        oval(s, 0.8, y + 0.07, 0.46, fill=WHITE, line=NAVY, lw=1.0)
        icon(s, ic, "navy", 0.9, y + 0.17, 0.26)
        text(s, 1.42, y, 5.2, rh, t, size=14, color=INK, anchor=M, spacing=1.0)
        rows.append(r)
    boxes = []
    by0, bp, bh = 1.78, 0.88, 0.76
    for j, t in enumerate(cons):
        y = by0 + j * bp
        b = shape(s, 8.2, y, 4.53, bh, fill=AMBER_LT, line=None, paras=t, size=T_BODY_S,
                  bold=True, color=INK, margins=(0.3, 0.02, 0.1, 0.02), anchor=M)
        shape(s, 8.2, y, 0.07, bh, fill=AMBER)
        boxes.append(b)
    for i, r in enumerate(rows):
        connector(s, r, 3, boxes[link[i]], 1, color=TEAL, lw=1.5, elbow=True)

    shape(s, 0.6, 5.5, CW, 1.38, fill=NAVY)
    shape(s, 0.6, 5.5, 0.09, 1.38, fill=TEAL)
    label(s, 0.95, 5.6, 6, "Research statement", color=TEAL_MID)
    text(s, 0.95, 5.92, 11.5, 0.92,
         "There is a need for an integrated web-based maternal health monitoring and referral "
         "system that supports continuous data capture, guideline-based risk assessment and "
         "appropriate healthcare facility recommendations.",
         size=18, bold=True, color=WHITE, spacing=1.03)
    notes(s, NOTES[2])


# =========================================================================== 4
def slide_04(prs):
    s = new_slide(prs)
    page_title(s, "Chapter One  ·  Introduction", "Aim and objectives of the study")
    footer(s, 4)

    shape(s, 0.6, 1.5, CW, 1.5, fill=TEAL_LT)
    shape(s, 0.6, 1.5, 0.09, 1.5, fill=TEAL)
    label(s, 0.95, 1.6, 6, "Research aim")
    text(s, 0.95, 1.92, 11.6, 1.0,
         "To design, implement and deploy a web-based maternal health monitoring system that "
         "supports maternal health monitoring, risk assessment and healthcare facility referral "
         "within the Nigerian healthcare environment.", size=18, bold=True, color=NAVY, spacing=1.04)

    label(s, 0.6, 3.22, 6, "Six objectives", color=NAVY)
    steps = [
        ("clipboard-list", "Requirements", "Identify requirements from clinical guidelines and healthcare needs"),
        ("database", "Database", "Scalable store for symptoms, vitals, history, laboratory results and risk assessments"),
        ("user", "Patient portal", "Registration, symptom reporting, laboratory uploads, history and risk recommendations"),
        ("heart-pulse", "Risk engine", "Identify potential complications, including pre-eclampsia, gestational diabetes and preterm labour"),
        ("layout-dashboard", "Clinician dashboard", "Risk-based monitoring, alerts and clinical records"),
        ("map-pin", "Referral and evaluation", "Location-based facility referral recommendation, then evaluate the system"),
    ]
    colw = CW / 6
    d = 0.86
    cy = 3.62
    for i, (ic, t, b) in enumerate(steps):
        cx = 0.6 + colw * i + colw / 2
        if i < 5:
            connector(s, p1=(cx + d / 2 + 0.04, cy + d / 2), p2=(cx + colw - d / 2 - 0.04, cy + d / 2),
                      color=TEAL, lw=2)
        icon_disc(s, ic, cx - d / 2, cy, d=d, fill=NAVY if i % 2 == 0 else TEAL)
        oval(s, cx + d / 2 - 0.2, cy - 0.06, 0.3, fill=WHITE, line=TEAL, lw=1.25,
             paras=str(i + 1), size=12, bold=True, color=TEAL, align=C, margins=(0, 0, 0, 0))
        text(s, cx - colw / 2 + 0.08, 4.66, colw - 0.16, 0.6, t, size=T_BODY_S, bold=True,
             color=NAVY, align=C, anchor=TOP, spacing=1.0)
        text(s, cx - colw / 2 + 0.1, 5.28, colw - 0.2, 1.55, b, size=13, color=INK, align=C,
             spacing=1.04)
    notes(s, NOTES[3])


# =========================================================================== 5
def slide_05(prs):
    from pptx.oxml.ns import qn
    from lxml import etree
    s = new_slide(prs)
    page_title(s, "Chapter Two  ·  Literature review", "Literature review and research gap")
    footer(s, 5)

    cols = [3.45, 4.2, 4.483]
    heads = ["Existing approaches", "Identified limitations", "How this research responds"]
    rows = [
        ("Scheduled ANC and paper records", "Limited continuity; delayed detection between visits",
         "Patient portal for ongoing symptom, test and history capture"),
        ("SMS tools and consumer pregnancy apps", "Often education-only; weak clinician workflow and referral",
         "Shared record with clinician caseload, alerts and notes"),
        ("Electronic records and AI-assisted tools", "Single-function; limited explainability or facility matching",
         "Guideline-based scoring, emergency overrides and location-based referral"),
    ]
    gf = s.shapes.add_table(4, 3, I(0.6), I(1.45), I(sum(cols)), I(2.52))
    tbl = gf.table
    tblPr = tbl._tbl.tblPr
    for a in ("firstRow", "bandRow"):
        tblPr.set(a, "0")
    sid = tblPr.find(qn("a:tableStyleId"))
    if sid is not None:
        sid.text = "{2D5ABB26-0587-4C30-8999-92F81FD0307C}"  # No style, no grid
    for i, w in enumerate(cols):
        tbl.columns[i].width = I(w)
    tbl.rows[0].height = I(0.46)
    for r in range(1, 4):
        tbl.rows[r].height = I(0.69)

    def border(cell, color, w=9525, side="b"):
        tcPr = cell._tc.get_or_add_tcPr()
        ln = etree.SubElement(tcPr, qn(f"a:ln{side.upper()}"))
        ln.set("w", str(w))
        sf = etree.SubElement(ln, qn("a:solidFill"))
        c = etree.SubElement(sf, qn("a:srgbClr"))
        c.set("val", color)
        tcPr.remove(ln)
        tcPr.insert(0, ln)

    for c, h in enumerate(heads):
        cell = tbl.cell(0, c)
        cell.margin_left = cell.margin_right = I(0.12)
        cell.vertical_anchor = M
        fill_text(cell.text_frame, h, size=14, bold=True, color=WHITE if c == 2 else NAVY,
                  margins=(0, 0, 0, 0))
        if c == 2:
            cell.fill.solid(); cell.fill.fore_color.rgb = TEAL
        else:
            cell.fill.solid(); cell.fill.fore_color.rgb = GREY
        border(cell, "0F766E", 19050)
    for r, row in enumerate(rows, start=1):
        for c, v in enumerate(row):
            cell = tbl.cell(r, c)
            cell.margin_left = cell.margin_right = I(0.12)
            cell.margin_top = cell.margin_bottom = I(0.05)
            cell.vertical_anchor = M
            fill_text(cell.text_frame, v, size=14, bold=(c == 0), color=NAVY if c == 0 else INK,
                      margins=(0, 0, 0, 0), spacing=1.0)
            cell.fill.solid()
            cell.fill.fore_color.rgb = TEAL_LT if c == 2 else WHITE
            border(cell, "D9E2EC")

    # lower row: research gap | HBM | TAM
    y = 4.25
    shape(s, 0.6, y, 4.9, 2.63, fill=NAVY)
    shape(s, 0.6, y, 0.09, 2.63, fill=TEAL)
    label(s, 0.92, y + 0.12, 4.2, "The research gap", color=TEAL_MID)
    text(s, 0.92, y + 0.45, 4.4, 2.1,
         "Existing solutions address individual aspects of maternal care. Few integrate patient "
         "monitoring, risk assessment, clinician dashboards and location-based referral in one system.",
         size=16, bold=True, color=WHITE, spacing=1.05)

    def concept(x, title, cap, a, b, out, src):
        text(s, x, y, 3.45, 0.3, title, size=13, bold=True, color=NAVY, anchor=M, margins=(0, 0, 0, 0))
        text(s, x, y + 0.32, 3.4, 0.3, cap, size=13, color=MUTED, anchor=M)
        n1 = shape(s, x, y + 0.82, 1.5, 0.62, fill=WHITE, line=TEAL, lw=1, paras=a, size=13,
                   color=INK, align=C, margins=(0.05, 0.02, 0.05, 0.02))
        n2 = shape(s, x, y + 1.58, 1.5, 0.62, fill=WHITE, line=TEAL, lw=1, paras=b, size=13,
                   color=INK, align=C, margins=(0.05, 0.02, 0.05, 0.02))
        o = shape(s, x + 1.95, y + 1.0, 1.45, 1.04, fill=TEAL, paras=out, size=13, bold=True,
                  color=WHITE, align=C, margins=(0.06, 0.02, 0.06, 0.02))
        connector(s, n1, 3, o, 1, color=TEAL, lw=1.75)
        connector(s, n2, 3, o, 1, color=TEAL, lw=1.75)
        text(s, x, y + 2.35, 3.4, 0.25, src, size=10, color=MUTED, anchor=M)

    concept(5.78, "Health Belief Model (HBM)", "Why women engage in monitoring",
            "Perceived threat", "Perceived benefits", "Health-monitoring behaviour",
            "Rosenstock (1974)")
    concept(9.33, "Technology Acceptance Model (TAM)", "Why users adopt a technology",
            "Perceived usefulness", "Perceived ease of use", "Adoption and use", "Davis (1989)")
    notes(s, NOTES[4])


# =========================================================================== 6
def slide_06(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Three  ·  Methodology", "Research methodology")
    footer(s, 6)

    label(s, 0.6, 1.4, 8, "Research framework  ·  Design Science Research", color=NAVY)
    phases = ["Problem identification", "Objectives", "Design and development",
              "Demonstration", "Evaluation", "Communication"]
    cw, step = 2.18, 1.99
    chev = []
    for i, t in enumerate(phases):
        hot = i == 2
        c = shape(s, 0.6 + i * step, 1.72, cw, 0.72, kind=MSO_SHAPE.CHEVRON if i else MSO_SHAPE.PENTAGON,
                  fill=TEAL if hot else GREY, line=None)
        text(s, 0.6 + i * step + (0.12 if i == 0 else 0.42), 1.72, cw - (0.5 if i == 0 else 0.8), 0.72, t,
             size=13, bold=hot, color=WHITE if hot else NAVY, align=C, anchor=M, spacing=1.0,
             margins=(0, 0, 0, 0))
        chev.append(c)

    # Scrum band
    by, bh = 2.78, 2.62
    shape(s, 0.6, by, CW, bh, fill=TEAL_LT, line=None)
    hot_cx = 0.6 + 2 * step + cw / 2
    connector(s, p1=(hot_cx, 2.44), p2=(hot_cx, by), color=TEAL, lw=1.75, dash=True)
    label(s, 0.85, by + 0.1, 10, "Agile Scrum development  ·  four two-week sprints", color=TEAL)
    sprints = [
        ("database", "Sprint 1", "Foundations", "Database schema, authentication and patient registration"),
        ("clipboard-check", "Sprint 2", "Clinical records", "Symptoms, laboratory results, patient dashboard and antenatal care schedule"),
        ("route", "Sprint 3", "Decision support and referral", "Risk engine, alerts, notifications and facility matching"),
        ("rocket", "Sprint 4", "Hardening and demonstration", "Clinician dashboard, automated tests and cloud deployment"),
    ]
    colw = CW / 4
    ly = by + 0.7
    connector(s, p1=(0.6 + colw / 2, ly + 0.3), p2=(0.6 + colw * 3.5, ly + 0.3), color=TEAL, lw=2.25,
              arrow=False)
    for i, (ic, sp, t, b) in enumerate(sprints):
        cx = 0.6 + colw * i + colw / 2
        icon_disc(s, ic, cx - 0.3, ly, d=0.6, fill=NAVY if i % 2 == 0 else TEAL)
        label(s, cx - colw / 2 + 0.1, ly + 0.7, colw - 0.2, f"{sp}  ·  2 weeks", size=12, align=C)
        text(s, cx - colw / 2 + 0.03, ly + 0.97, colw - 0.06, 0.3, t, size=13.5, bold=True, color=NAVY,
             align=C, spacing=1.0, margins=(0, 0, 0, 0))
        text(s, cx - colw / 2 + 0.12, ly + 1.25, colw - 0.24, 0.62, b, size=12, color=INK, align=C,
             spacing=1.0)

    # bottom: requirements + evaluation
    def block(x, title, items, ic):
        shape(s, x, 5.52, 5.95, 1.38, fill=WHITE, line=LINE, lw=0.75)
        icon(s, ic, "teal", x + 0.15, 5.6, 0.3)
        label(s, x + 0.55, 5.6, 5, title, color=NAVY, size=13, h=0.3)
        for k, t in enumerate(items):
            text(s, x + 0.2 + (k % 2) * 2.95, 5.98 + (k // 2) * 0.44, 2.85, 0.42,
                 [{"text": t, "bullet": True}], size=13, color=INK, anchor=M, spacing=0.95)

    block(0.6, "Requirements gathering",
          ["WHO maternal healthcare guidelines", "ACOG and NICE clinical guidelines",
           "Existing digital maternal health systems", "Six maternal healthcare scenarios"],
          "book-open")
    block(6.78, "Evaluation",
          ["Unit testing", "Functional testing", "Integration testing",
           "Clinical scenario checks on seeded data"], "circle-check")
    notes(s, NOTES[5])


# =========================================================================== 7
def slide_07(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Three  ·  Requirements and analysis", "System users and functional modules")
    footer(s, 7)

    roles = [
        ("user", "Patients", "Pregnant women and new mothers", TEAL,
         ["Register and manage the obstetric profile", "Report symptoms; submit laboratory tests",
          "View history, risk results and recommendations", "Follow the antenatal care schedule",
          "View facility referrals"]),
        ("stethoscope", "Clinicians", "Healthcare professionals with assigned patients", NAVY,
         ["Manage the patient caseload", "Monitor the risk-distribution dashboard",
          "Review health records, alerts and clinical notes", "Manage referrals"]),
        ("user-cog", "Administrators", "System and user management", NAVY_SOFT,
         ["Manage system users and roles", "Control access to patient and clinician data",
          "Maintain auditability of actions"]),
    ]
    cw, gap = 3.93, 0.177
    bottoms = []
    for i, (ic, name, sub, col, items) in enumerate(roles):
        x = 0.6 + i * (cw + gap)
        shape(s, x, 1.5, cw, 3.7, fill=WHITE, line=LINE, lw=0.75)
        shape(s, x, 1.5, cw, 1.0, fill=col)
        oval(s, x + 0.2, 1.7, 0.6, fill=WHITE)
        icon(s, ic, {TEAL: "teal", NAVY: "navy", NAVY_SOFT: "navy"}[col], x + 0.33, 1.83, 0.34)
        text(s, x + 1.0, 1.58, cw - 1.1, 0.4, name, size=T_H2, bold=True, color=WHITE, anchor=M)
        text(s, x + 1.0, 1.98, cw - 1.1, 0.45, sub, size=12, color=WHITE, spacing=1.0)
        text(s, x + 0.22, 2.7, cw - 0.4, 2.45,
             [{"text": t, "bullet": True, "after": 5} for t in items], size=14, color=INK, spacing=1.0)
        bottoms.append(x + cw / 2)

    # shared modules bus
    for cx in bottoms:
        connector(s, p1=(cx, 5.2), p2=(cx, 5.5), color=MUTED, lw=1.5, arrow=False)
    shape(s, 0.6, 5.5, CW, 1.0, fill=GREY, line=None)
    label(s, 0.8, 5.55, 6, "Shared supporting modules", color=NAVY, size=12)
    mods = [("heart-pulse", "Risk assessment engine"), ("bell", "Notifications"),
            ("map-pin", "Facility recommendation"), ("activity", "Health assistant"),
            ("shield-check", "Access control and auditability")]
    mw = (CW - 0.4 - 4 * 0.12) / 5
    for k, (ic, t) in enumerate(mods):
        x = 0.8 + k * (mw + 0.12)
        shape(s, x, 5.88, mw, 0.5, fill=WHITE, line=LINE, lw=0.75)
        icon(s, ic, "teal", x + 0.1, 5.99, 0.28)
        text(s, x + 0.45, 5.88, mw - 0.5, 0.5, t, size=12, color=INK, anchor=M, spacing=0.95)
    label(s, 0.6, 6.6, 4, "Non-functional requirements", color=TEAL, size=12, h=0.3)
    text(s, 3.6, 6.6, 9.1, 0.3,
         "Security  ·  Usability  ·  Scalability  ·  Maintainability  ·  Performance",
         size=T_BODY_S, bold=True, color=NAVY, anchor=M)
    notes(s, NOTES[6])


# =========================================================================== 8
def slide_08(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Three  ·  Design", "System architecture and technology stack")
    footer(s, 8)

    top, bot = 1.5, 5.3
    g = 0.72
    bx, bw = 0.6, 1.3
    t1x, t1w = bx + bw + g, 2.75
    t2x, t2w = t1x + t1w + g, 3.2
    t3x, t3w = t2x + t2w + g, 2.5

    # browser
    br = shape(s, bx, 2.4, bw, 1.65, fill=NAVY)
    icon(s, "monitor", "white", bx + bw / 2 - 0.22, 2.52, 0.44)
    text(s, bx + 0.05, 3.02, bw - 0.1, 0.3, "User browser", size=13, bold=True, color=WHITE, align=C)
    text(s, bx + 0.05, 3.3, bw - 0.1, 0.7, ["Patients and", "clinicians"], size=12, color=WHITE,
         align=C, spacing=1.0)

    def tier(x, w, col, ttl, sub):
        shape(s, x, top, w, bot - top, fill=GREY, line=LINE, lw=0.75)
        shape(s, x, top, w, 0.66, fill=col)
        text(s, x + 0.15, top + 0.04, w - 0.3, 0.3, ttl, size=13, bold=True, color=WHITE, anchor=M)
        text(s, x + 0.15, top + 0.33, w - 0.3, 0.3, sub, size=12, color=WHITE, anchor=M)

    def ch(x, y, w, h, t, sub=None, bold=False, fill=WHITE, line=LINE, color=INK, subcolor=MUTED):
        paras = [{"text": t, "bold": True if bold or sub else False, "size": 13, "color": color}]
        if sub:
            paras.append({"text": sub, "size": 11, "color": subcolor})
        return shape(s, x, y, w, h, fill=fill, line=line, lw=0.75, paras=paras, align=C,
                     margins=(0.05, 0.02, 0.05, 0.02), spacing=1.0)

    # Tier 1
    tier(t1x, t1w, TEAL, "TIER 1  ·  PRESENTATION", "Presentation layer")
    ix, iw = t1x + 0.15, (t1w - 0.4) / 2
    ch(ix, 2.3, iw, 0.46, "Next.js 14")
    ch(ix + iw + 0.1, 2.3, iw, 0.46, "React 18")
    ch(ix, 2.86, iw, 0.46, "TypeScript")
    ch(ix + iw + 0.1, 2.86, iw, 0.46, "Tailwind CSS")
    label(s, ix, 3.52, t1w - 0.3, "User interfaces", color=MUTED, size=11, h=0.24)
    ch(ix, 3.82, t1w - 0.3, 0.52, "Patient portal", fill=TEAL_LT, line=TEAL, bold=True, color=NAVY)
    ch(ix, 4.44, t1w - 0.3, 0.52, "Clinician portal", fill=TEAL_LT, line=TEAL, bold=True, color=NAVY)

    # Tier 2
    tier(t2x, t2w, NAVY, "TIER 2  ·  APPLICATION", "Application layer")
    ax, aw = t2x + 0.15, (t2w - 0.4) / 2
    label(s, ax, 2.2, t2w - 0.3, "API and security", color=MUTED, size=11, h=0.24)
    ch(ax, 2.46, t2w - 0.3, 0.62, "Next.js Route Handlers", sub="REST JSON · no Express.js server",
       fill=NAVY, line=NAVY, color=WHITE, subcolor=LINE)
    # sub colour on navy chip
    ch(ax, 3.16, aw, 0.44, "Node.js")
    ch(ax + aw + 0.1, 3.16, aw, 0.44, "Zod validation")
    ch(ax, 3.68, aw, 0.44, "NextAuth.js")
    ch(ax + aw + 0.1, 3.68, aw, 0.44, "JWT")
    label(s, ax, 4.2, t2w - 0.3, "Business logic", color=MUTED, size=11, h=0.24)
    ch(ax, 4.46, aw, 0.44, "Risk engine", fill=TEAL_LT, line=TEAL, bold=True, color=NAVY)
    ch(ax + aw + 0.1, 4.46, aw, 0.44, "Facility match", fill=TEAL_LT, line=TEAL, bold=True, color=NAVY)
    ch(ax, 4.94, t2w - 0.3, 0.3, "Alerts and notifications", fill=TEAL_LT, line=TEAL, bold=True, color=NAVY)

    # Tier 3
    tier(t3x, t3w, NAVY_SOFT, "TIER 3  ·  DATA", "Data layer")
    dx, dw = t3x + 0.15, t3w - 0.3
    pr = ch(dx, 2.5, dw, 0.5, "Prisma ORM", bold=True)
    pg = ch(dx, 3.42, dw, 0.8, "PostgreSQL 16", sub="Neon cloud database", fill=NAVY_SOFT,
            line=NAVY_SOFT, color=WHITE, subcolor=LINE)
    connector(s, pr, 2, pg, 0, color=NAVY, lw=1.75)
    ch(dx, 4.5, dw, 0.7, "Cloudinary", sub="Laboratory file storage", fill=WHITE)

    # request / response flow
    y_req, y_res = 2.75, 3.7
    gaps = [(bx + bw, t1x), (t1x + t1w, t2x), (t2x + t2w, t3x)]
    for a, b in gaps:
        connector(s, p1=(a + 0.02, y_req), p2=(b - 0.02, y_req), color=TEAL, lw=2.25)
        connector(s, p1=(b - 0.02, y_res), p2=(a + 0.02, y_res), color=MUTED, lw=2.25, dash=True)
        text(s, a, y_req - 0.3, b - a, 0.25, "request", size=11, bold=True, color=TEAL, align=C, anchor=M, margins=(0, 0, 0, 0))
        text(s, a, y_res + 0.04, b - a, 0.25, "response", size=11, bold=True, color=MUTED, align=C, anchor=M, margins=(0, 0, 0, 0))

    # deployment services
    dy, dh = 5.72, 1.14
    label(s, 0.6, dy + 0.1, 1.9, "Deployment services", color=NAVY, size=12, h=0.5)
    hosts = [
        (t1x, t2x + t2w - t1x, "cloud", "Vercel", "Hosts the Next.js application: user interface and Route Handlers",
         [t1x + t1w / 2, t2x + t2w / 2]),
        (t3x, 1.2, "database", "Neon", "Managed PostgreSQL", [t3x + 0.6]),
        (t3x + 1.3, 1.2, "folder-open", "Cloudinary", "Laboratory files", [t3x + 1.3 + 0.6]),
    ]
    for x, w, ic, nm, desc, links in hosts:
        shape(s, x, dy, w, dh, fill=WHITE, line=TEAL, lw=1.0)
        icon(s, ic, "teal", x + 0.12, dy + 0.1, 0.3)
        if w > 2:
            text(s, x + 0.5, dy + 0.08, w - 0.55, 0.34, nm, size=14, bold=True, color=NAVY, anchor=M)
            text(s, x + 0.12, dy + 0.48, w - 0.22, dh - 0.5, desc, size=12, color=INK, spacing=1.0)
        else:
            text(s, x + 0.12, dy + 0.42, w - 0.16, 0.28, nm, size=13, bold=True, color=NAVY, anchor=M,
                 margins=(0, 0, 0, 0))
            text(s, x + 0.12, dy + 0.72, w - 0.16, 0.4, desc, size=11, color=INK, spacing=1.0,
                 margins=(0, 0, 0, 0))
        for lx in links:
            connector(s, p1=(lx, dy), p2=(lx, bot + 0.02), color=TEAL, lw=1.5, dash=True)
    notes(s, NOTES[7])


# =========================================================================== 9
def slide_09(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Four  ·  Implementation", "Database design and security")
    footer(s, 9)

    label(s, 0.6, 1.4, 7.8, "Entity-relationship overview  ·  PostgreSQL 16  ·  Prisma ORM", color=TEAL, size=12)

    def ent(x, y, w, h, t, fill=WHITE, line=NAVY, color=NAVY, size=13):
        return shape(s, x, y, w, h, fill=fill, line=line, lw=1.25, paras=t, size=size, bold=True,
                     color=color, align=C, margins=(0.04, 0.02, 0.04, 0.02))

    def card(x, y, txt_, w=0.7):
        text(s, x, y, w, 0.22, txt_, size=10, bold=True, color=MUTED, align=C, anchor=M)

    # row 1
    ex = [0.6, 2.67, 4.74, 6.81]
    ew, eh, ey = 1.55, 0.64, 1.8
    user = ent(ex[0], ey, ew, eh, "User")
    pat = ent(ex[1], ey, ew, eh, "Patient", fill=TEAL, line=TEAL, color=WHITE)
    asg = ent(ex[2], ey, ew, eh, "Assignment")
    prov = ent(ex[3], ey, ew, eh, "Provider")
    for a, b, lab in ((user, pat, "1 : 0..1"), (pat, asg, "1 : N"), (asg, prov, "N : 1")):
        connector(s, a, 3, b, 1, color=MUTED, lw=1.5, arrow=False)
        cx = (a.left + a.width + b.left) / 2 / 914400
        card(cx - 0.35, ey + 0.05, lab)

    # clinical records container
    cx0, cy0, cw_, ch_ = 2.3, 3.05, 6.06, 1.92
    shape(s, cx0, cy0, cw_, ch_, fill=TEAL_LT, line=TEAL, lw=1.0, dash=True)
    label(s, cx0 + 0.15, cy0 + 0.06, 5.5, "Clinical records (owned by the patient)", color=TEAL, size=11, h=0.26)
    names = [["Symptom", "TestResult", "RiskAssessment"], ["Alert", "ANC Attendance", "ClinicalNote"]]
    for r, row in enumerate(names):
        for c, t in enumerate(row):
            ent(cx0 + 0.15 + c * 1.9, cy0 + 0.42 + r * 0.7, 1.8, 0.54, t, size=12)
    pcx = ex[1] + ew / 2
    connector(s, p1=(pcx, ey + eh), p2=(pcx, cy0), color=TEAL, lw=1.75)
    card(pcx + 0.05, 2.62, "1 : N", w=0.6)

    # row 3
    r3 = 5.38
    notif = ent(ex[0], r3, ew, eh, "Notification")
    connector(s, p1=(ex[0] + ew / 2, ey + eh), p2=(ex[0] + ew / 2, r3), color=MUTED, lw=1.5)
    card(ex[0] + ew / 2 + 0.05, 3.9, "1 : N", w=0.6)
    ref = ent(3.2, r3, 1.7, eh, "Referral")
    fac = ent(6.3, r3, 1.7, eh, "Facility")
    connector(s, p1=(4.05, cy0 + ch_), p2=(4.05, r3), color=TEAL, lw=1.75)
    card(4.1, 5.05, "1 : N", w=0.6)
    connector(s, fac, 1, ref, 3, color=MUTED, lw=1.5, arrow=False)
    card(5.1, r3 + 0.04, "1 : N")

    text(s, 0.6, 6.2, 7.8, 0.7,
         [{"text": "A patient has many clinical records and referrals", "bullet": True},
          {"text": "Patients are assigned to clinicians through Assignment (N : M)", "bullet": True},
          {"text": "A healthcare facility can receive many referrals", "bullet": True}],
         size=12, color=INK, spacing=1.0, after=1)

    # security
    sx, sw = 8.75, 3.98
    shape(s, sx, 1.4, sw, 5.48, fill=GREY, line=None)
    shape(s, sx, 1.4, sw, 0.07, fill=TEAL)
    text(s, sx + 0.25, 1.55, sw - 0.5, 0.45, "Security controls", size=T_H2, bold=True, color=NAVY, anchor=M)
    ctrl = [
        ("key-round", "bcryptjs password hashing (12 salt rounds)"),
        ("shield-check", "NextAuth.js authentication with JWT"),
        ("cookie", "HTTP-only session cookies"),
        ("users", "Role-based access control (RBAC)"),
        ("list-checks", "Zod input validation"),
        ("lock", "HTTPS / TLS in production"),
        ("user-check", "Restricted patient and clinician data access"),
        ("clock", "Password-reset tokens expire after 30 minutes"),
    ]
    for i, (ic, t) in enumerate(ctrl):
        y = 2.18 + i * 0.57
        oval(s, sx + 0.25, y + 0.04, 0.44, fill=WHITE, line=TEAL, lw=1.0)
        icon(s, ic, "teal", sx + 0.34, y + 0.13, 0.26)
        text(s, sx + 0.85, y, sw - 1.0, 0.52, t, size=13, color=INK, anchor=M, spacing=1.0)
    notes(s, NOTES[8])


# =========================================================================== 10
def slide_10(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Four  ·  Decision support", "Clinical risk assessment engine")
    footer(s, 10)

    steps = [
        ("clipboard-list", "Collect", "Symptoms, history, vitals and laboratory results"),
        ("search", "Extract", "14 predictors and contextual modifiers"),
        ("scale", "Score", "Weighted score normalised between 0 and 1"),
        ("siren", "Override", "Emergency danger signs override the score"),
        ("gauge", "Classify", "LOW, MEDIUM or HIGH risk"),
        ("bell", "Advise", "Recommendations, tests, urgency and alerts"),
    ]
    colw = CW / 6
    d, cy = 0.72, 1.5
    for i, (ic, t, b) in enumerate(steps):
        cx = 0.6 + colw * i + colw / 2
        if i < 5:
            connector(s, p1=(cx + d / 2 + 0.05, cy + d / 2), p2=(cx + colw - d / 2 - 0.05, cy + d / 2),
                      color=TEAL, lw=2)
        icon_disc(s, ic, cx - d / 2, cy, d=d, fill=RED if i == 3 else (NAVY if i % 2 == 0 else TEAL))
        text(s, cx - colw / 2 + 0.05, cy + 0.8, colw - 0.1, 0.3, f"{i + 1}  {t}", size=T_BODY_S,
             bold=True, color=NAVY, align=C, anchor=M)
        text(s, cx - colw / 2 + 0.12, cy + 1.12, colw - 0.24, 0.75, b, size=12, color=INK, align=C,
             spacing=1.0)

    label(s, 0.6, 3.5, 6, "Risk classification", color=NAVY)
    bands = [
        ("LOW", GREEN, GREEN_LT, "Score below 0.28, without an applicable higher-risk condition."),
        ("MEDIUM", AMBER, AMBER_LT, "Score of at least 0.28, or glucose of at least 140 mg/dL, unless a higher-risk condition applies."),
        ("HIGH", RED, RED_LT, "Score of at least 0.55, or a qualifying emergency danger sign."),
    ]
    bw, gap = 3.93, 0.177
    for i, (t, col, lt, b) in enumerate(bands):
        x = 0.6 + i * (bw + gap)
        shape(s, x, 3.82, bw, 1.4, fill=lt, line=None)
        shape(s, x, 3.82, bw, 0.46, fill=col, paras=t, size=T_H3, bold=True, color=WHITE,
              margins=(0.2, 0, 0.1, 0), anchor=M)
        text(s, x + 0.2, 4.36, bw - 0.4, 0.85, b, size=14, color=INK, spacing=1.02)

    # screening + safety
    label(s, 0.6, 5.36, 5, "Screening areas", color=NAVY, size=12, h=0.26)
    for k, t in enumerate(["Pre-eclampsia", "Gestational diabetes", "Preterm labour"]):
        w = [1.55, 2.05, 1.6][k]
        x = 0.6 + sum([1.55, 2.05, 1.6][:k]) + k * 0.1
        shape(s, x, 5.66, w, 0.42, fill=WHITE, line=TEAL, lw=1.0, paras=t, size=13, color=NAVY,
              bold=True, align=C, margins=(0.04, 0, 0.04, 0))
    shape(s, 6.75, 5.36, 5.98, 0.72, fill=TEAL_LT, line=None)
    shape(s, 6.75, 5.36, 0.07, 0.72, fill=TEAL)
    icon(s, "circle-check", "teal", 6.95, 5.58, 0.3)
    text(s, 7.4, 5.36, 5.25, 0.72,
         [{"runs": [("Safety feature: ", {"bold": True, "color": TEAL}),
                    ("missing clinical observations are flagged as incomplete, never assumed normal.", {})]}],
         size=13, color=INK, anchor=M, spacing=1.0)

    shape(s, 0.6, 6.2, CW, 0.68, fill=NAVY)
    text(s, 0.85, 6.2, 11.65, 0.68,
         "The production engine is a deterministic TypeScript weighted scoring and rule-based "
         "component. It supports clinical decision-making and does not autonomously diagnose disease. "
         "The optional Random Forest model is an offline research artefact and is not executed in production.",
         size=12, color=WHITE, anchor=M, spacing=1.0)
    notes(s, NOTES[9])


# =========================================================================== 11
def slide_11(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Four  ·  Demonstration", "System implementation and demonstration")
    footer(s, 11)
    a = 3.95 / 1.95
    gal = [
        ("Patient registration", "Identity and last menstrual period",
         ASSETS / "p74_1.jpg", dict(ax=0.78, ay=0.0)),
        ("Patient dashboard", "Gestational age, risk and recent records",
         LIVE / "dashboard.png", dict(ax=0.0, ay=0.0)),
        ("Symptom submission", "Symptoms, severity and notes",
         ASSETS / "p75_1.png", dict(ax=0.5, ay=0.06)),
        ("Risk assessment", "Risk class, score, care plan and screens",
         ASSETS / "p76_1.png", dict(ax=0.0, ay=0.0)),
        ("Clinician dashboard", "Caseload, risk distribution and alerts",
         ASSETS / "p76_2.jpg", dict(ax=0.0, ay=0.0)),
        ("Facility referral", "Ranked by location and emergency capability",
         LIVE / "referrals_map.png", dict(ax=0.0, ay=0.0)),
    ]
    for i, (t, d, src, kw) in enumerate(gal):
        col, row = i % 3, i // 3
        x = 0.6 + col * 4.09
        y = 1.45 + row * 2.72
        if i == 0:   # whole screenshot, letter-boxed (the left half is decorative photography)
            from PIL import Image as _Im
            iw_, ih_ = _Im.open(src).size
            hh = 3.95 * ih_ / iw_
            shape(s, x, y, 3.95, 1.95, fill=GREY, line=LINE, lw=1.0)
            picture(s, src, x, y + (1.95 - hh) / 2, 3.95, hh)
        else:
            img = prep_image(src, f"gallery_{i + 1}.jpg", a, **kw)
            picture(s, img, x, y, 3.95, 1.95, border=LINE, lw=1.0)
        oval(s, x, y + 2.04, 0.3, fill=TEAL, paras=str(i + 1), size=12, bold=True, color=WHITE,
             align=C, margins=(0, 0, 0, 0))
        text(s, x + 0.4, y + 2.02, 3.5, 0.34, t, size=T_BODY_S, bold=True, color=NAVY, anchor=M)
        text(s, x + 0.4, y + 2.34, 3.5, 0.3, d, size=12, color=MUTED, anchor=M)
    notes(s, NOTES[10] + "  Screenshots are taken from the implemented WMHS application on seeded demonstration data.")


# =========================================================================== 12
def slide_12(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Four  ·  Evaluation", "System testing and results")
    footer(s, 12)

    tiles = [("20", "Functional test cases passed", 20, 0.1),
             ("7", "Integration workflows passed", 7, 0.2),
             ("8", "Clinical scenarios passed", 8, 0.2),
             ("~2 s", "Approximately 2 seconds observed interactive response", None, 0)]
    tw, gap = 2.85, (CW - 4 * 2.85) / 3
    for i, (num, lab, n, sq) in enumerate(tiles):
        x = 0.6 + i * (tw + gap)
        shape(s, x, 1.5, tw, 2.05, fill=GREY, line=None)
        shape(s, x, 1.5, tw, 0.07, fill=TEAL)
        text(s, x + 0.22, 1.68, tw - 0.4, 0.95, num, size=54, bold=True, color=NAVY, anchor=M)
        text(s, x + 0.22, 2.62, tw - 0.4, 0.5, lab, size=13, color=INK, spacing=1.0)
        if n:
            gp = 0.028
            size = sq
            for k in range(n):
                shape(s, x + 0.22 + k * (size + gp), 3.22, size, size, fill=TEAL)
        else:
            icon(s, "timer", "teal", x + 0.22, 3.15, 0.3)
            shape(s, x + 0.65, 3.27, 1.9, 0.09, fill=LINE)
            shape(s, x + 0.65, 3.27, 0.38, 0.09, fill=TEAL)
        if n:
            icon(s, "circle-check", "green", x + tw - 0.5, 1.7, 0.3)

    label(s, 0.6, 3.82, 6, "How the system was evaluated", color=NAVY, size=T_BODY_S, h=0.32)
    cats = [("code", "Unit testing", "Vitest suites for engine, rules and helpers"),
            ("clipboard-check", "Functional testing", "Core application modules"),
            ("layers", "Integration testing", "Presentation, application and data tiers"),
            ("stethoscope", "Clinical scenarios", "Eight seeded scenario checks"),
            ("timer", "Performance", "Informal workstation observations")]
    cw5 = CW / 5
    for i, (ic, t, d) in enumerate(cats):
        x = 0.6 + i * cw5
        if i:
            vline(s, x, 4.2, 1.3, color=LINE)
        icon_disc(s, ic, x + 0.18, 4.2, d=0.46, fill=NAVY, ratio=0.55)
        text(s, x + 0.18, 4.72, cw5 - 0.26, 0.3, t, size=14, bold=True, color=NAVY, anchor=M,
             spacing=1.0, margins=(0, 0, 0, 0))
        text(s, x + 0.18, 5.03, cw5 - 0.3, 0.5, d, size=12, color=INK, spacing=1.0, margins=(0, 0, 0, 0))

    for k, t in enumerate(["Missing clinical observations were not treated as normal.",
                           "Emergency danger-sign scenarios were classified as HIGH risk."]):
        x = 0.6 + k * 5.5
        icon(s, "circle-check", "green", x, 5.68, 0.3)
        text(s, x + 0.45, 5.63, 6.6, 0.4, t, size=T_BODY_S - 1, color=INK, anchor=M, spacing=1.0)

    shape(s, 0.6, 6.22, CW, 0.66, fill=TEAL_LT, line=None)
    shape(s, 0.6, 6.22, 0.09, 0.66, fill=TEAL)
    text(s, 0.95, 6.22, 11.6, 0.66,
         [{"runs": [("Technical verification on seeded demonstration data; not clinical validation. ",
                     {"bold": True, "color": NAVY, "size": 15}),
                    ("Seeded accounts and synthetic records.", {"color": INK, "size": 13})]}],
         size=15, anchor=M, spacing=1.0)
    notes(s, NOTES[11])


# =========================================================================== 13
def slide_13(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Five  ·  Contribution", "Contribution to knowledge")
    footer(s, 13)
    items = [
        ("layers", "Integrated maternal health monitoring",
         "Symptom and test recording, antenatal monitoring, risk assessment, clinician dashboards, "
         "alerts and location-based referral in one web platform."),
        ("search", "Explainable guideline-based decision support",
         "Weighted scoring and emergency overrides make classifications and contributing factors "
         "inspectable, unlike an unexplained black-box prediction."),
        ("file-check", "Traceable technical evaluation",
         "Guidelines and requirements are traced to implementation and verification through unit, "
         "functional, integration and clinical scenario tests."),
    ]
    cw, gap = 3.93, 0.177
    d = 1.1
    cy = 1.55
    cols = []
    for i, (ic, t, b) in enumerate(items):
        x = 0.6 + i * (cw + gap)
        cx = x + cw / 2
        cols.append(cx)
        icon_disc(s, ic, cx - d / 2, cy, d=d, fill=TEAL if i != 1 else NAVY, ratio=0.5)
        label(s, x, cy + 1.25, cw, f"Contribution {i + 1}", align=C, size=12)
        text(s, x + 0.15, cy + 1.55, cw - 0.3, 0.85, t, size=T_H3 + 1, bold=True, color=NAVY,
             align=C, anchor=TOP, spacing=1.0)
        hline(s, cx - 0.4, cy + 2.45, 0.8, color=TEAL, lw=2)
        text(s, x + 0.2, cy + 2.62, cw - 0.4, 1.4, b, size=14, color=INK, align=C, spacing=1.05)
    for k in range(2):
        mid = (cols[k] + cols[k + 1]) / 2
        connector(s, p1=(cols[k] + d / 2 + 0.1, cy + d / 2), p2=(cols[k + 1] - d / 2 - 0.1, cy + d / 2),
                  color=LINE, lw=2, arrow=False)
        oval(s, mid - 0.17, cy + d / 2 - 0.17, 0.34, fill=WHITE, line=TEAL, lw=1.25,
             paras="+", size=15, bold=True, color=TEAL, align=C, margins=(0, 0, 0, 0))

    shape(s, 0.6, 5.55, CW, 1.33, fill=NAVY)
    shape(s, 0.6, 5.55, 0.09, 1.33, fill=TEAL)
    label(s, 0.95, 5.63, 6, "Academic value", color=TEAL_MID, size=12)
    text(s, 0.95, 5.93, 11.6, 0.92,
         "The project demonstrates how web technologies and explainable clinical decision-support "
         "logic can be integrated into a maternal health monitoring and referral platform. It does "
         "not claim clinically established improvements in maternal outcomes or diagnostic accuracy.",
         size=15, color=WHITE, spacing=1.05)
    notes(s, NOTES[12])


# =========================================================================== 14
def slide_14(prs):
    s = new_slide(prs)
    page_title(s, "Chapter Five  ·  Reflection", "Limitations and recommendations")
    footer(s, 14)

    icon(s, "triangle-alert", "amber", 0.6, 1.42, 0.32)
    label(s, 1.05, 1.4, 5, "Limitations", color=AMBER, size=14, h=0.36)
    icon(s, "lightbulb", "teal", 7.35, 1.42, 0.32)
    label(s, 7.8, 1.4, 5, "Recommendations for further research", color=TEAL, size=14, h=0.36)

    lims = [
        "No clinical field trial was conducted.",
        "Evaluation used seeded accounts and synthetic records.",
        "No external labelled clinical dataset to establish diagnostic accuracy.",
        "SMS notifications use a demonstration stub, not a live SMS service.",
        "Facility directory uses seeded data, not a national facility database.",
        "No integration with DHIS2 or existing electronic medical record platforms.",
        "No formal System Usability Scale assessment or large-scale load testing.",
    ]
    recs = [
        (0, 1, "Conduct clinical field evaluation in primary healthcare facilities and referral hospitals."),
        (1, 1, "Involve midwives, nurses and obstetricians in validating requirements and risk outputs."),
        (2, 1, "Validate the risk engine on labelled, de-identified clinical datasets."),
        (3, 1, "Explore SMS, USSD and offline capabilities for low-connectivity areas."),
        (4, 2, "Integrate with existing healthcare information systems."),
        (6, 1, "Conduct formal usability, security and performance evaluations."),
    ]
    y0, pitch, rh = 1.92, 0.69, 0.6
    L = []
    for i, t in enumerate(lims):
        y = y0 + i * pitch
        b = shape(s, 0.6, y, 5.9, rh, fill=GREY, line=None, paras=t, size=13, color=INK,
                  margins=(0.25, 0.02, 0.1, 0.02), anchor=M, spacing=1.0)
        shape(s, 0.6, y, 0.07, rh, fill=AMBER)
        L.append(b)
    rows_for = {0: [0], 1: [1], 2: [2], 3: [3], 4: [4, 5], 6: [6]}
    for first, span, t in recs:
        y = y0 + first * pitch
        h = rh + (span - 1) * pitch
        b = shape(s, 7.35, y, 5.38, h, fill=TEAL_LT, line=None, paras=t, size=13, color=INK,
                  margins=(0.25, 0.02, 0.1, 0.02), anchor=M, spacing=1.0)
        shape(s, 7.35, y, 0.07, h, fill=TEAL)
        for li in rows_for[first]:
            connector(s, L[li], 3, b, 1, color=TEAL, lw=1.5)
    notes(s, NOTES[13])


# =========================================================================== 15
def slide_15(prs):
    s = new_slide(prs)
    px = 8.75
    img = prep_image(PHOTOS / "consult.jpg", "closing_consult.jpg", (SW - px) / SH, ax=0.45,
                     tone=True, tint=(0x10, 0x2A, 0x43), tint_alpha=0.8)
    picture(s, img, px, 0, SW - px, SH)
    shape(s, px, 0, 0.09, SH, fill=TEAL)

    page_title(s, "Conclusion  ·  References  ·  Questions", "Conclusion")
    # narrower footer on this slide
    hline(s, MX, 7.02, px - MX - 0.4, color=LINE, lw=0.75)
    text(s, MX, 7.08, 6.5, 0.26, "University of Lagos  ·  Department of Computer Sciences  ·  MIT899",
         size=10, color=MUTED, anchor=M)
    text(s, px - 1.9, 7.08, 1.5, 0.26, "15 / 15", size=10, color=MUTED, align=PP_ALIGN.RIGHT, anchor=M)

    lw_ = px - MX - 0.4
    text(s, MX, 1.4, lw_, 1.15,
         "The study designed, implemented and technically evaluated a web-based maternal health "
         "monitoring system integrating patient data capture, guideline-based risk assessment, "
         "clinician monitoring, antenatal care tracking and location-based facility referral.",
         size=14, color=INK, spacing=1.04)
    ach = [("monitor", "A functional patient and clinician web platform"),
           ("heart-pulse", "An explainable risk assessment and alert mechanism"),
           ("map-pin", "An integrated facility referral and tracking workflow")]
    for i, (ic, t) in enumerate(ach):
        y = 2.62 + i * 0.5
        icon_disc(s, ic, MX, y, d=0.4, fill=TEAL, ratio=0.55)
        text(s, MX + 0.55, y, lw_ - 0.6, 0.4, t, size=T_BODY_S, bold=True, color=NAVY, anchor=M)

    shape(s, MX, 4.22, lw_, 1.22, fill=TEAL_LT, line=None)
    shape(s, MX, 4.22, 0.09, 1.22, fill=TEAL)
    text(s, MX + 0.28, 4.22, lw_ - 0.4, 1.22,
         "The study demonstrates the feasibility of integrating web technologies and guideline-based "
         "clinical decision support to support maternal health monitoring and referral in the "
         "Nigerian healthcare environment.", size=14, bold=True, color=NAVY, anchor=M, spacing=1.04)

    label(s, MX, 5.6, 5, "Selected references", size=11, h=0.24)
    refs = [
        "WHO (2016). Recommendations on antenatal care for a positive pregnancy experience. Geneva: WHO.",
        "ACOG (2020). Practice Bulletin No. 222: Gestational hypertension and preeclampsia. Washington, DC: ACOG.",
        "NICE (2019). Hypertension in pregnancy: diagnosis and management. NICE guideline NG133. London: NICE.",
        "Hevner, A.R., March, S.T., Park, J. and Ram, S. (2004). MIS Quarterly, 28(1), pp. 75–105.",
        "Peffers, K., Tuunanen, T., Rothenberger, M.A. and Chatterjee, S. (2007). JMIS, 24(3), pp. 45–77.",
        "Davis, F.D. (1989). MIS Quarterly, 13(3), pp. 319–340.",
    ]
    text(s, MX, 5.86, lw_, 1.12, refs, size=10, color=MUTED, spacing=1.0, after=1)

    tx = px + 0.5
    tw = SW - px - 0.8
    text(s, tx, 2.35, tw, 0.9, "Thank you", size=38, bold=True, color=WHITE, anchor=M)
    shape(s, tx, 3.3, 1.0, 0.06, fill=TEAL_MID)
    text(s, tx, 3.5, tw, 0.9, ["Questions and", "Answers"], size=T_H2 + 2, color=WHITE, spacing=1.05)
    text(s, tx, 5.2, tw, 0.9, ["Muritala, Muyideen Babatunde", "MIT899  ·  University of Lagos"],
         size=T_LABEL, color=TEAL_MID, spacing=1.1)
    text(s, SW - 2.9, 7.12, 2.7, 0.25, "Photograph: Unsplash", size=9, color=WHITE,
         align=PP_ALIGN.RIGHT, anchor=M)
    notes(s, NOTES[14] + "  " + CREDIT)


def main():
    prs = Presentation()
    prs.slide_width = I(SW)
    prs.slide_height = I(SH)
    for fn in (slide_01, slide_02, slide_03, slide_04, slide_05, slide_06, slide_07, slide_08,
               slide_09, slide_10, slide_11, slide_12, slide_13, slide_14, slide_15):
        fn(prs)
    prs.core_properties.title = "Design and Implementation of a Web-Based Maternal Health Monitoring System"
    prs.core_properties.author = "Muritala, Muyideen Babatunde"
    prs.save(OUT)
    print("Wrote", OUT, len(prs.slides), "slides")


if __name__ == "__main__":
    main()
