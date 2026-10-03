"""Render the two standalone moderncv sources when native TeX is unavailable.

This is a deliberately limited source-to-PDF renderer, not a LaTeX compiler.
Content is read directly from the .tex files so PDFs do not have separate copy.
Unsupported body commands fail loudly. Overleaf produces moderncv's own layout.
Requires reportlab and pypdf. Run: python cv/build_pdf.py
"""
from pathlib import Path
from html import escape
import re
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table,
    TableStyle, PageBreak,
)
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
FONT_DIR = Path('C:/Windows/Fonts')
for name, file in [('CVSans', 'arial.ttf'), ('CVSans-Bold', 'arialbd.ttf'),
                   ('CVSans-Italic', 'ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / file)))
pdfmetrics.registerFontFamily('CVSans', normal='CVSans', bold='CVSans-Bold', italic='CVSans-Italic')


def group(text, position):
    while position < len(text) and text[position].isspace():
        position += 1
    if position >= len(text) or text[position] != '{':
        raise ValueError(f'Expected braced argument near {text[position:position+60]!r}')
    start = position + 1
    depth = 1
    position += 1
    while position < len(text):
        char = text[position]
        if char == '\\':
            position += 2
            continue
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if not depth:
                return text[start:position], position + 1
        position += 1
    raise ValueError('Unbalanced TeX braces')


def inline(text):
    """Interpret only the small set of inline commands used by these CVs."""
    output = []
    i = 0
    while i < len(text):
        if text[i] != '\\':
            if text.startswith('---', i):
                output.append(' — '); i += 3; continue
            if text.startswith('--', i):
                output.append('–'); i += 2; continue
            if text.startswith('``', i) or text.startswith("''", i):
                output.append('“' if text.startswith('``', i) else '”'); i += 2; continue
            if text[i] in '${}':
                i += 1; continue
            if text[i] == '_':
                # Only the MoS_2 chemical formula uses subscripts in body copy.
                if i + 1 < len(text) and text[i + 1] == '2':
                    output.append('<sub>2</sub>'); i += 2; continue
            output.append(escape(text[i])); i += 1; continue
        if i + 1 < len(text) and text[i + 1] in '&_%#':
            output.append(escape(text[i + 1])); i += 2; continue
        if text.startswith('\\"o', i):
            output.append('ö'); i += 3; continue
        match = re.match(r'\\([A-Za-z]+)', text[i:])
        if not match:
            raise ValueError(f'Unsupported inline sequence: {text[i:i+30]!r}')
        command = match.group(1)
        i += len(match.group(0))
        if command in ('textbf', 'textit', 'emph', 'mathrm'):
            value, i = group(text, i)
            tag = {'textbf': 'b', 'textit': 'i', 'emph': 'i', 'mathrm': None}[command]
            output.append(f'<{tag}>{inline(value)}</{tag}>' if tag else inline(value))
        elif command == 'LaTeX':
            output.append('LaTeX')
            if text[i:i+2] == '{}':
                i += 2
        elif command == 'times':
            output.append('×')
        else:
            raise ValueError(f'Unsupported inline command: {command}')
    return re.sub(r'\s+', ' ', ''.join(output)).strip()


def parse(text):
    text = re.sub(r'(?m)^\s*%.*$', '', text)
    begin, end = '\\begin{document}', '\\end{document}'
    body = text.split(begin, 1)[1].split(end, 1)[0]
    commands = {'maketitle': 0, 'section': 1, 'cventry': 6, 'cvitem': 2, 'newpage': 0}
    i = 0
    blocks = []
    while i < len(body):
        if body[i].isspace():
            i += 1; continue
        match = re.match(r'\\([A-Za-z]+)', body[i:])
        if not match or match.group(1) not in commands:
            raise ValueError(f'Unsupported body syntax: {body[i:i+70]!r}')
        name = match.group(1)
        i += len(match.group(0))
        arguments = []
        for _ in range(commands[name]):
            value, i = group(body, i)
            arguments.append(value)
        blocks.append((name, arguments))
    return blocks


class CVDocument(BaseDocTemplate):
    def __init__(self, path, version, name):
        super().__init__(str(path), pagesize=A4, leftMargin=36, rightMargin=36,
                         topMargin=32, bottomMargin=34, title=f'{name} — {version}',
                         author=name, pageCompression=1)
        self.person_name = name
        self.addPageTemplates(PageTemplate(id='cv', frames=[Frame(
            self.leftMargin, self.bottomMargin, self.width, self.height,
            leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)],
            onPage=self.footer))

    def footer(self, canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#d6d6d6'))
        canvas.setLineWidth(.35)
        canvas.line(36, 25, A4[0] - 36, 25)
        canvas.setFillColor(colors.HexColor('#666666'))
        canvas.setFont('CVSans', 8)
        canvas.drawString(36, 13, self.person_name)
        canvas.drawRightString(A4[0] - 36, 13, str(doc.page))
        canvas.restoreState()


def render(source):
    research = source.stem == 'research-cv'
    text = source.read_text(encoding='utf-8')
    def metadata(command):
        match = re.search(r'\\' + command + r'\s*\{', text)
        if not match:
            raise ValueError(f'Missing header field: {command}')
        return group(text, match.end() - 1)[0]
    person_name = metadata('firstname') + ' ' + metadata('familyname')
    email = metadata('email')
    homepage = metadata('homepage')
    profiles = dict(re.findall(r'\\social\[([^\]]+)\]\{([^}]+)\}', text))
    blocks = parse(text)
    size = 10.3 if research else 10.5
    body_style = ParagraphStyle('body', fontName='CVSans', fontSize=size,
                                leading=size * 1.25 if research else 12.2, textColor=colors.HexColor('#262626'),
                                spaceAfter=3, allowWidows=0, allowOrphans=0)
    heading_style = ParagraphStyle('heading', parent=body_style, fontName='CVSans-Bold',
                                  fontSize=13, leading=16, spaceBefore=11 if research else 9, spaceAfter=6,
                                  keepWithNext=True)
    date_style = ParagraphStyle('date', parent=body_style, fontSize=9, leading=11.6,
                               textColor=colors.HexColor('#666666'), alignment=TA_RIGHT)
    title_style = ParagraphStyle('title', parent=body_style, fontName='CVSans-Bold',
                                leading=size * 1.25, spaceAfter=2)
    sub_style = ParagraphStyle('sub', parent=body_style, textColor=colors.HexColor('#555555'), spaceAfter=3)
    bullet_style = ParagraphStyle('bullet', parent=body_style, leftIndent=9, firstLineIndent=-8,
                                 spaceAfter=2)
    output = source.with_suffix('.pdf')
    doc = CVDocument(output, 'Research CV' if research else 'Comprehensive CV', person_name)
    story = []
    hint = 67

    def content(value):
        begin, end = '\\begin{itemize}', '\\end{itemize}'
        if begin not in value:
            return [Paragraph(inline(value), body_style)] if value.strip() else []
        pre, rest = value.split(begin, 1)
        items, post = rest.split(end, 1)
        if begin in post:
            raise ValueError('Multiple lists in one CV entry are unsupported')
        result = [Paragraph(inline(pre), body_style)] if pre.strip() else []
        for item in items.split('\\item')[1:]:
            result.append(Paragraph('• ' + inline(item), bullet_style))
        if post.strip():
            result.append(Paragraph(inline(post), body_style))
        return result

    def table(date, right):
        # Separate long entries at paragraph/bullet boundaries. A section heading
        # stays with just the entry header and introduction, not the entire entry.
        if not research and len(right) > 3:
            rows = [[Paragraph(inline(date), date_style), right[:2]]]
            rows.extend([['', [p]] for p in right[2:]])
        else:
            rows = [[Paragraph(inline(date), date_style), right]]
        result = []
        for index, row in enumerate(rows):
            t = Table([row], colWidths=[hint, doc.width - hint], hAlign='LEFT')
            t.keepWithNext = len(rows) > 1 and index == 0
            t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (0, 0), 0), ('RIGHTPADDING', (0, 0), (0, 0), 9),
            ('LEFTPADDING', (1, 0), (1, 0), 4), ('RIGHTPADDING', (1, 0), (1, 0), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), (6 if research else 5) if index == len(rows) - 1 else 0),
            ]))
            result.append(t)
        return result

    for name, args in blocks:
        if name == 'maketitle':
            story.append(Paragraph(escape(person_name), ParagraphStyle(
                'name', parent=body_style, fontSize=27, leading=32, spaceAfter=8)))
            contact = f'<link href="mailto:{escape(email)}">{escape(email)}</link>'
            story.append(Paragraph(contact, body_style))
            links = f'<link href="https://{escape(homepage)}">Portfolio</link> · <link href="https://github.com/{escape(profiles["github"])}">GitHub</link> · <link href="https://www.linkedin.com/in/{escape(profiles["linkedin"])}">LinkedIn</link>'
            story.append(Paragraph(links, body_style))
            story.append(Spacer(1, 4))
        elif name == 'section':
            story.append(Paragraph(inline(args[0]), heading_style))
        elif name == 'newpage':
            story.append(PageBreak())
        elif name == 'cvitem':
            story.extend(table(args[0], content(args[1])))
        elif name == 'cventry':
            date, title, institution, location, grade, description = args
            right = [Paragraph(inline(title), title_style)]
            subtitle = ' · '.join(inline(x) for x in [institution, location, grade] if x)
            if subtitle:
                right.append(Paragraph(subtitle, sub_style))
            right.extend(content(description))
            story.extend(table(date, right))
    doc.build(story)
    reader = PdfReader(output)
    if research and len(reader.pages) != 2:
        raise RuntimeError(f'Research CV must have exactly two pages; got {len(reader.pages)}')
    print(f'{output.name}: {len(reader.pages)} pages; {output.stat().st_size:,} bytes')
    return output


if __name__ == '__main__':
    for filename in ['research-cv.tex', 'comprehensive-cv.tex']:
        render(ROOT / filename)
