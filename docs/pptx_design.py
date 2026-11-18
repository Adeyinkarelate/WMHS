"""Reusable design system for the WMHS MIT899 defence deck (python-pptx).

Everything is built from native, editable PowerPoint objects: rectangles,
text frames, connectors (glued to shapes) and PNG icons / images.
"""
from __future__ import annotations

from pathlib import Path

from lxml import etree
from PIL import Image, ImageEnhance
from pptx.dml.color import RGBColor
from pptx.enum.dml import MSO_LINE
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "docs" / "slide_assets"
ICONS = ASSETS / "icons"
PHOTOS = ASSETS / "photos"
PREP = ASSETS / "prepared_pro"
PREP.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------- palette
def rgb(h: str) -> RGBColor:
    h = h.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


NAVY = rgb("102A43")
TEAL = rgb("0F766E")
TEAL_LT = rgb("E8F5F2")
WHITE = rgb("FFFFFF")
GREY = rgb("F4F7FA")
INK = rgb("243447")
MUTED = rgb("64748B")
LINE = rgb("D9E2EC")
TEAL_MID = rgb("99D5CC")  # on-navy accent (derived from teal)
NAVY_SOFT = rgb("1F4468")  # secondary navy tint

GREEN, GREEN_LT = rgb("047857"), rgb("E6F4EE")
AMBER, AMBER_LT = rgb("B45309"), rgb("FDF3E3")
RED, RED_LT = rgb("B91C1C"), rgb("FBEAEA")

FONT = "Arial"

# ---------------------------------------------------------------- type scale (pt)
T_TITLE = 30
T_H2 = 22
T_H3 = 18
T_BODY = 17
T_BODY_S = 15
T_LABEL = 13
T_FOOT = 10

# ---------------------------------------------------------------- geometry (in)
SW, SH = 13.333, 7.5
MX = 0.6  # side margin
CW = SW - 2 * MX  # content width = 12.133
CONTENT_TOP = 1.5
CONTENT_BOTTOM = 6.88


def I(v: float) -> Emu:
    return Inches(v)


# ---------------------------------------------------------------- low-level helpers
def _strip_style(shape):
    """Remove theme style reference (kills inherited shadow / line / fill)."""
    st = shape._element.find(qn("p:style"))
    if st is not None:
        shape._element.remove(st)


def _fmt_run(run, size, color, bold=False, italic=False):
    f = run.font
    f.name = FONT
    f.size = Pt(size)
    f.bold = bold
    f.italic = italic
    f.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = etree.SubElement(rPr, qn(tag))
        el.set("typeface", FONT)


def _bullet(p, color, char="•", indent=0.2):
    pPr = p._p.get_or_add_pPr()
    pPr.set("marL", str(int(Inches(indent))))
    pPr.set("indent", str(-int(Inches(indent))))
    clr = etree.SubElement(pPr, qn("a:buClr"))
    c = etree.SubElement(clr, qn("a:srgbClr"))
    c.set("val", str(color))
    font = etree.SubElement(pPr, qn("a:buFont"))
    font.set("typeface", "Arial")
    ch = etree.SubElement(pPr, qn("a:buChar"))
    ch.set("char", char)


def fill_text(tf, paras, size=T_BODY, color=INK, bold=False, align=PP_ALIGN.LEFT,
              spacing=1.0, after=0, anchor=MSO_ANCHOR.TOP, margins=(0, 0, 0, 0),
              italic=False):
    """paras: str | list[str | dict(text|runs, bullet, size, color, bold, after, align)]"""
    tf.word_wrap = True
    tf.margin_left, tf.margin_top, tf.margin_right, tf.margin_bottom = [I(m) for m in margins]
    tf.vertical_anchor = anchor
    if isinstance(paras, str):
        paras = [paras]
    for i, item in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        spec = item if isinstance(item, dict) else {"text": item}
        p.alignment = spec.get("align", align)
        p.line_spacing = spec.get("spacing", spacing)
        p.space_after = Pt(spec.get("after", after))
        p.space_before = Pt(0)
        psize = spec.get("size", size)
        pcolor = spec.get("color", color)
        pbold = spec.get("bold", bold)
        runs = spec.get("runs") or [(spec.get("text", ""), {})]
        for text, fmt in runs:
            r = p.add_run()
            r.text = text
            _fmt_run(r, fmt.get("size", psize), fmt.get("color", pcolor),
                     fmt.get("bold", pbold), fmt.get("italic", spec.get("italic", italic)))
        if spec.get("bullet"):
            _bullet(p, spec.get("bullet_color", TEAL), spec.get("char", "•"))


def text(slide, x, y, w, h, paras, **kw):
    box = slide.shapes.add_textbox(I(x), I(y), I(w), I(h))
    fill_text(box.text_frame, paras, **kw)
    return box


def shape(slide, x, y, w, h, fill=None, line=None, lw=1.0, kind=MSO_SHAPE.RECTANGLE,
          radius=None, dash=False, paras=None, name=None, **kw):
    s = slide.shapes.add_shape(kind, I(x), I(y), I(w), I(h))
    _strip_style(s)
    if radius is not None and kind == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = radius
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(lw)
        if dash:
            s.line.dash_style = MSO_LINE.DASH
    if paras is not None:
        kw.setdefault("anchor", MSO_ANCHOR.MIDDLE)
        fill_text(s.text_frame, paras, **kw)
    if name:
        s.name = name
    return s


def rrect(slide, x, y, w, h, radius=0.06, **kw):
    return shape(slide, x, y, w, h, kind=MSO_SHAPE.ROUNDED_RECTANGLE, radius=radius, **kw)


def oval(slide, x, y, d, fill=None, line=None, lw=1.0, **kw):
    return shape(slide, x, y, d, d, fill=fill, line=line, lw=lw, kind=MSO_SHAPE.OVAL, **kw)


def hline(slide, x, y, w, color=LINE, lw=1.0):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, I(x), I(y), I(x + w), I(y))
    _strip_style(c)
    c.line.color.rgb = color
    c.line.width = Pt(lw)
    return c


def vline(slide, x, y, h, color=LINE, lw=1.0):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, I(x), I(y), I(x), I(y + h))
    _strip_style(c)
    c.line.color.rgb = color
    c.line.width = Pt(lw)
    return c


def connector(slide, a=None, a_site=None, b=None, b_site=None, *, p1=None, p2=None,
              color=MUTED, lw=1.75, arrow=True, both=False, dash=False, elbow=False):
    """Native connector. Glue to shapes (a/b + site idx 0=top 1=left 2=bottom 3=right)
    or pass explicit points p1/p2 in inches."""
    kind = MSO_CONNECTOR.ELBOW if elbow else MSO_CONNECTOR.STRAIGHT
    x1, y1 = p1 if p1 else (0, 0)
    x2, y2 = p2 if p2 else (1, 1)
    c = slide.shapes.add_connector(kind, I(x1), I(y1), I(x2), I(y2))
    _strip_style(c)
    if a is not None:
        c.begin_connect(a, a_site)
    if b is not None:
        c.end_connect(b, b_site)
    c.line.color.rgb = color
    c.line.width = Pt(lw)
    if dash:
        c.line.dash_style = MSO_LINE.DASH
    ln = c.line._get_or_add_ln()
    if arrow:
        te = etree.SubElement(ln, qn("a:tailEnd"))
        te.set("type", "triangle")
        te.set("w", "med")
        te.set("len", "med")
    if both:
        he = etree.SubElement(ln, qn("a:headEnd"))
        he.set("type", "triangle")
        he.set("w", "med")
        he.set("len", "med")
        # schema order: headEnd must precede tailEnd
        ln.remove(he)
        ln.insert(list(ln).index(ln.find(qn("a:tailEnd"))) if arrow else len(ln), he)
    return c


def icon(slide, name, color, x, y, size=0.4):
    path = ICONS / f"{name}_{color}.png"
    return slide.shapes.add_picture(str(path), I(x), I(y), I(size), I(size))


def icon_disc(slide, name, x, y, d=0.7, fill=TEAL, icon_color="white", ratio=0.52,
              line=None):
    oval(slide, x, y, d, fill=fill, line=line)
    s = d * ratio
    icon(slide, name, icon_color, x + (d - s) / 2, y + (d - s) / 2, s)


# ---------------------------------------------------------------- images
def prep_image(src: Path, out_name: str, aspect: float, ax=0.5, ay=0.5,
               max_w=1700, tone=False, tint=None, tint_alpha=0.0):
    """Crop to aspect (w/h) around anchor (ax, ay), optional consistent tone."""
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if w / h > aspect:
        nw = int(h * aspect)
        x0 = int((w - nw) * ax)
        im = im.crop((x0, 0, x0 + nw, h))
    else:
        nh = int(w / aspect)
        y0 = int((h - nh) * ay)
        im = im.crop((0, y0, w, y0 + nh))
    if im.width > max_w:
        im = im.resize((max_w, int(max_w / aspect)), Image.Resampling.LANCZOS)
    if tone:  # consistent, slightly restrained photographic treatment
        im = ImageEnhance.Color(im).enhance(0.82)
        im = ImageEnhance.Contrast(im).enhance(1.04)
    if tint is not None and tint_alpha > 0:
        overlay = Image.new("RGB", im.size, tint)
        im = Image.blend(im, overlay, tint_alpha)
    out = PREP / out_name
    im.save(out, "JPEG", quality=90, optimize=True)
    return out


def picture(slide, path, x, y, w, h, border=None, lw=0.75):
    pic = slide.shapes.add_picture(str(path), I(x), I(y), I(w), I(h))
    if border is not None:
        pic.line.color.rgb = border
        pic.line.width = Pt(lw)
    return pic


# ---------------------------------------------------------------- page furniture
def notes(slide, txt):
    slide.notes_slide.notes_text_frame.text = txt


def page_title(slide, kicker, title):
    shape(slide, MX, 0.42, 0.14, 0.14, fill=TEAL)
    text(slide, MX + 0.26, 0.35, 10.5, 0.3, kicker.upper(), size=T_LABEL, bold=True, color=TEAL,
         anchor=MSO_ANCHOR.MIDDLE)
    text(slide, MX, 0.68, CW, 0.62, title, size=T_TITLE, bold=True, color=NAVY,
         anchor=MSO_ANCHOR.MIDDLE)


def footer(slide, n, total=15, width=CW):
    hline(slide, MX, 7.02, width, color=LINE, lw=0.75)
    text(slide, MX, 7.08, 8.5, 0.26,
         "University of Lagos  ·  Department of Computer Sciences  ·  MIT899  ·  WMHS defence",
         size=T_FOOT, color=MUTED, anchor=MSO_ANCHOR.MIDDLE)
    text(slide, MX + width - 1.5, 7.08, 1.5, 0.26, f"{n} / {total}", size=T_FOOT,
         color=MUTED, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)


def new_slide(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    return s


def chip(slide, x, y, w, h, label, fill=GREY, line=LINE, color=INK, size=T_LABEL, bold=False,
         align=PP_ALIGN.CENTER):
    return shape(slide, x, y, w, h, fill=fill, line=line, lw=0.75, paras=label, size=size,
                 color=color, bold=bold, align=align, margins=(0.08, 0.02, 0.08, 0.02))
