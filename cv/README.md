# Traditional CV sources and PDFs

- `research-cv.tex`: two-page research-application selection.
- `comprehensive-cv.tex`: full research, education, work, awards and activities.
- Their matching PDFs are the website download targets.

Both sources are standalone moderncv documents, preserving the original casual, black, sans-serif style. No portrait or additional source file is required. Open either `.tex` in Codex's LaTeX editor or upload it to Overleaf as the main document. The original `AI_refined_Version.tex` in the repository root is historical and is not a current CV or website download target.

## PDF generation and current limitation

On 2026-10-03, the built-in LaTeX compiler failed before reading either source with `Unable to find standard directories for platform`. This is an environment failure, not a successful LaTeX compile or a verified source diagnostic. No terminal TeX distribution was installed.

The same environment failure was reproduced for both edited sources on 2026-10-04. Downloadable PDFs for this revision use the existing source-driven renderer; native moderncv compilation remains unverified.

To provide usable PDF documents, `build_pdf.py` reads the body and header directly from each `.tex` and renders a traditional two-column CV with ReportLab. It is a limited renderer, **not a LaTeX compiler**. Supported commands include `section`, `cventry`, `cvitem`, `newpage`, `itemize`, `href` and the inline formatting used here; unsupported commands cause an error. It uses Arial from Windows, and requires `reportlab` and `pypdf`.

```powershell
python cv/build_pdf.py
```

The script checks that the research PDF has exactly two pages. Re-render and visually review both PDFs after edits. Overleaf/native moderncv will use its own typography and pagination; the native LaTeX version's exact page count has not been confirmed in this environment. Keep the PDF download links pointing to the reviewed files.

## Content sync checklist

1. Update confirmed website facts in `index.html` and the matching keys in `translations.zh.js`.
2. Update both `.tex` files; the short CV deliberately omits less relevant items.
3. Regenerate PDFs from the updated sources, confirm the research PDF is two pages, and inspect all pages. Check website PDF links before publishing.
4. Retain ongoing status, provisional names, limited study scope, and the distinction between personal contributions and project-wide infrastructure.

### Source decisions for this revision

- Latest user confirmation: cumulative GPA is **3.61/4.0** (2026-10-03).
- Degree: **B.Sc. in Physics (with honours) — Expected**, **2023–2027**. The earlier Economics enrolment is background, not a B.B.A. award. First Class Honours is not asserted.
- HSSRLM preprocessing, candidate verification and the three-structure audit are confirmed personal contributions. The 26-record registry remains project-level work.
- User update (2026-10-04): HSSRLM is a working paper. An initial AAAI submission plan was deferred while another manuscript took priority; IJCAI/ACL are possible future venues. A collaborator has indicated that current contributions could support co-first authorship. Final author order and submission plans remain unconfirmed; do not list this as a submitted/accepted publication or confirmed co-first author credit.
- XY project title is provisional; no invented starting year or quantified advantage over Wolff. Experimental scope remains a 4×4 lattice at one temperature.
- Full-tuition scholarship uses the current website/certificate record's **2023–2026** span rather than extending the old CV claim to 2027.
- Dean's List includes AY2025–2026, with the 2026 certificate pending issuance.
- Help Room service is a form of USTF, covering CSC1005, CSC1001 and PHY1001, 23 October–12 December 2025.
- URC2026 is a conference presentation, not a publication or an assertion of sole authorship.
- Both CVs use the broader `Conference` section heading and contain a clickable HTTPS link to the privacy-reviewed public paper.
- Earlier diffusion-model work from the supplied full CV is retained as research training, without inventing a separate current project's dates.
- The public CV copy removes unsupported machine-level precision, publication, award and independent-invention claims; no planned exchange programme or unverified research repository is added.
