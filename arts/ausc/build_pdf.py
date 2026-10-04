"""Render the public performance record from main.tex without a TeX runtime.

This small ReportLab renderer reads the event and imagecard macros directly.
The accompanying main.tex and assets can also be compiled together in Overleaf.
Run from any directory: python arts/ausc/build_pdf.py
"""
from pathlib import Path
import re
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from PIL import Image

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parents[1] / 'cv'))
from build_pdf import group, inline  # Shared limited TeX text parser and fonts.


def paragraph(pdf, text, x, top, width, size=10, color='#25332e', bold=False):
    style = ParagraphStyle('record', fontName='CVSans-Bold' if bold else 'CVSans',
                           fontSize=size, leading=size * 1.35, textColor=colors.HexColor(color))
    item = Paragraph(inline(text), style)
    _, height = item.wrap(width, 1000)
    item.drawOn(pdf, x, top - height)
    return height


def main():
    body = (ROOT / 'main.tex').read_text(encoding='utf-8').split(r'\begin{document}', 1)[1]
    events = []
    for match in re.finditer(r'\\(event|imagecard|href)\b', body):
        command = match.group(1)
        pos = match.end()
        args = []
        for _ in range(3 if command == 'event' else 2):
            value, pos = group(body, pos)
            args.append(value)
        if command == 'event':
            events.append({'heading': args, 'images': [], 'link': None})
        elif command == 'imagecard':
            events[-1]['images'].append(args)
        else:
            events[-1]['link'] = args
    assert len(events) == 2 and all(len(e['images']) == 4 for e in events)
    target = ROOT.parent / 'AUSC_Performance_Record.pdf'
    pdf = canvas.Canvas(str(target), pagesize=A4, pageCompression=1)
    pdf.setTitle('AUSC Performance Record - Jiaxin (Jeremiah) Pan')
    pdf.setAuthor('Jiaxin (Jeremiah) Pan')
    width, height = A4
    left, usable = 42, width - 84
    for page, event in enumerate(events, 1):
        date, title, description = event['heading']
        paragraph(pdf, 'MUSIC / PERFORMANCE RECORD', left, height-40, usable, 9, '#516a60', True)
        paragraph(pdf, 'Auckland University', left, height-65, usable, 23, bold=True)
        paragraph(pdf, 'Student Choir', left, height-95, usable, 23, bold=True)
        paragraph(pdf, 'Jiaxin (Jeremiah) Pan · Tenor · Spring 2026', left, height-130, usable, 10)
        pdf.setStrokeColor(colors.HexColor('#cbd7cf'))
        pdf.line(left, height-156, width-left, height-156)
        paragraph(pdf, title, left, height-174, usable, 18, bold=True)
        paragraph(pdf, date, left, height-204, usable, 9, '#516a60')
        paragraph(pdf, description, left, height-225, usable, 10)
        cell = (usable - 18) / 2
        for n, (filename, caption) in enumerate(event['images']):
            x = left + (n % 2) * (cell + 18)
            top = height - 280 - (n // 2) * 245
            pdf.setFillColor(colors.HexColor('#f4f6f3'))
            pdf.rect(x, top-215, cell, 215, stroke=0, fill=1)
            with Image.open(ROOT / filename) as im:
                scale = min((cell-12)/im.width, 203/im.height)
                iw, ih = im.width*scale, im.height*scale
                # Embed the supplied JPEG stream directly; no decode/re-encode.
                pdf.drawImage(str(ROOT / filename), x+(cell-iw)/2, top-(215+ih)/2,
                              width=iw, height=ih)
            paragraph(pdf, caption, x, top-220, cell, 8, '#516a60')
        if event['link']:
            url, label = event['link']
            paragraph(pdf, r'\href{' + url + '}{' + label + '}', left, 63, usable, 9, '#516a60')
        paragraph(pdf, 'Personal performance record · Concert programmes and photographs', left, 28, usable-30, 7, '#66766c')
        paragraph(pdf, str(page) + ' / 2', width-65, 28, 25, 7, '#66766c')
        pdf.showPage()
    pdf.save()
    print(target)


if __name__ == '__main__':
    main()
