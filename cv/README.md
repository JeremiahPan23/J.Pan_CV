# Traditional CV sources and PDFs

- `research-cv.tex`: two-page research-application selection.
- `comprehensive-cv.tex`: full research, education, work, awards and activities.
- Their matching PDFs are the website download targets.

Both sources are standalone moderncv documents, preserving the original casual, black, sans-serif style. No portrait or additional source file is required. Open either `.tex` in Codex's LaTeX editor or upload it to Overleaf as the main document. The original `AI_refined_Version.tex` in the repository root is historical and is not a current CV or website download target.

## PDF generation and current limitation

On 2026-10-03, the built-in LaTeX compiler failed before reading either source with `Unable to find standard directories for platform`. This is an environment failure, not a successful LaTeX compile or a verified source diagnostic. No terminal TeX distribution was installed.

The same environment failure was reproduced for both edited sources on 2026-10-04. Downloadable PDFs for this revision use the existing source-driven renderer; native moderncv compilation remains unverified.

The comprehensive source was checked again on 2026-10-05 with the same environment
failure. Its reviewed PDF now has five pages, with extracurricular activities
starting on the final page. The research-application PDF remains two pages.

To provide usable PDF documents, `build_pdf.py` reads the body and header directly from each `.tex` and renders a traditional two-column CV with ReportLab. It is a limited renderer, **not a LaTeX compiler**. Supported commands include `section`, `cventry`, `cvitem`, `newpage`, `itemize`, `href` and the inline formatting used here; unsupported commands cause an error. It uses Arial from Windows, and requires `reportlab` and `pypdf`.

On 2026-10-13, native compilation became available. Both current sources compiled
successfully after escaping the underscore in the homepage displayed by moderncv.
Downloadable PDFs continue to use the source-driven renderer to preserve their
existing layout; the built-in compilation check does not export PDF files.

```powershell
python cv/build_pdf.py
```

The script checks that the research PDF has exactly two pages. Re-render and visually review both PDFs after edits. Overleaf/native moderncv will use its own typography and pagination; the native LaTeX version's exact page count has not been confirmed in this environment. Keep the PDF download links pointing to the reviewed files.

Both PDF headers also print the complete portfolio URL so it remains
usable on paper. The existing Portfolio, GitHub, LinkedIn, Google Scholar and
ORCID link row is retained.

## Content sync checklist

2026-10-18 repository update: the computational physics report has a verified Zenodo technical-note record (DOI `10.5281/zenodo.23439036`; co-authors Jiaxin Pan and Mengxiang Zhu; deposited 2026-10-17). Preserve Spring 2025 as the coursework date and distinguish the 2026 deposit. The user reports SSRN submission 7625599 is pending platform screening; automated access returned HTTP 403. Both CVs retain Reinvention as submitted/awaiting editorial assessment and separately label SSRN screening pending. Neither repository activity establishes a peer-reviewed or conference publication.

1. Update confirmed website facts in `index.html` and the matching keys in `translations.zh.js`.
2. Update both `.tex` files; the short CV deliberately omits less relevant items.
3. Regenerate PDFs from the updated sources, confirm the research PDF is two pages, and inspect all pages. Check website PDF links before publishing.
4. Retain ongoing status, provisional names, limited study scope, and the distinction between personal contributions and project-wide infrastructure.

### Source decisions for this revision

- High-school education is commented out in the comprehensive source for possible
  restoration. Economics Club appears before the Physics Society, as requested.

- Choir experiences are included in the comprehensive CV: School of Music Choir,
  CUHK-SZ (Fall 2025), Auckland University Student Choir (Spring 2026, confirmed by
  the user), and CUHK-SZ Chorus (Fall 2026). Chinese distinguishes the music-school
  choir class (合唱班) from the university chorus (合唱团). Concert titles and dates
  follow the supplied posters/programmes; the public AUSC record and verified
  six-video playlist are linked.

- Latest user confirmation: cumulative GPA is **3.61/4.0** (2026-10-03).
- Degree: **B.Sc. in Physics (with Honours) — First Class Honours expected**, **2023–2027**. The earlier Economics enrolment is background, not a B.B.A. award. Expected classification, not an awarded honour: the user confirmed on 2026-10-05 that Major GPA meets 3.50, and cumulative GPA is 3.61/4.0. The applicable CUHK-SZ regulations require minimum Major GPA 3.50 and Overall GPA 3.30; final classification remains subject to the university’s assessment.
- HSSRLM preprocessing, candidate verification and the three-structure audit are confirmed personal contributions. The 26-record registry remains project-level work.
- HSSRLM is a working paper with confirmed co-first authorship. The user confirmed on 2026-10-17 that ACL is the planned submission venue, superseding the earlier tentative venue list. Both CVs state manuscript in preparation for planned submission to the Annual Meeting of the Association for Computational Linguistics (ACL); not yet submitted. Do not infer a conference year or track, completed submission, or acceptance.
- XY project title is provisional; no invented starting year or quantified advantage over Wolff. Experimental scope remains a 4×4 lattice at one temperature.
- Full-tuition scholarship uses the current website/certificate record's **2023–2026** span rather than extending the old CV claim to 2027.
- Dean's List includes AY2025–2026; the 2026 certificate has been issued and is linked from the website.
- Help Room service is a form of USTF, covering CSC1005, CSC1001 and PHY1001, 23 October–12 December 2025.
- URC2026 is a conference presentation, not a publication. The user confirmed on 2026-10-05 that the ENG2001 paper is original single-author work and was presented by invitation. Supplied instructor feedback calls it a great quantitative paper and requests permission for anonymised classroom use; do not infer that this feedback establishes the reason for the conference invitation.
- The comprehensive CV retains a separate `Conference` section; the two-page research CV combines the related manuscript and presentation under `Manuscript and Conference`. Both link to the privacy-reviewed earlier course paper.
- Submission receipt supplied by the user confirms that "Mathematics self confidence and STEM major choice in an undergraduate survey" was submitted to Reinvention: an International Journal of Undergraduate Research (submission 2736). Both CVs and the bilingual website use `Submitted; awaiting editorial assessment`, not accepted or confirmed external peer review. The Zenodo and SSRN records contain the same final URC2026 paper, with presentation slides additionally included on Zenodo; do not replace it with an unreviewed submission file or expose the private submission dashboard. This submission does not change HSSRLM's manuscript-in-preparation status.
- Earlier diffusion-model work from the supplied full CV is retained as research training, without inventing a separate current project's dates.
- The public CV copy removes unsupported machine-level precision, publication, award and independent-invention claims; no planned exchange programme or unverified research repository is added.

- User confirmation (2026-10-05): the ongoing XY study is the undergraduate thesis project. Its portfolio display title remains provisional.

- User confirmation (2026-10-05): Tenor in all three choir experiences. Economics Club responsibilities include member recruitment, Secretary Department team management and task delegation, cross-department coordination, mailbox and email communications, Wenjuanxing registration forms and response consolidation, EC Academic Weekly and event copy, social media, documents and event logistics. These activity updates belong to the comprehensive CV; the research-application selection has no corresponding entries.

- User update (2026-10-13): choir pronunciation training includes German, Cantonese,
  Latin, Maori, and Japanese; this replaces the earlier Cantonese conversation claim
  in both CVs. The comprehensive CV also records a passed Chinese Musicians
  Association amateur piano Grade 8 examination and approximately 1200 Elo on
  Duolingo against Oscar. No examination year or other rating system is inferred.

- User update (2026-10-14): the two-page research CV now includes a compact
  Musical Training and Performance section: passed Chinese Musicians Association
  amateur piano Grade 8, tenor participation in all three choir experiences, two
  public Auckland concerts, Winter Carols, and existing performance-record/video
  links. Music-related AI is listed as a research interest, not completed music-AI
  research. The conference entry is shortened to preserve the two-page limit.


2026-10-20 SSRN update: the user supplied confirmation that record 7625599 is now publicly posted. Both CVs now say preprint posted on SSRN, superseding the October 18 screening status above. Reinvention remains submitted / awaiting editorial assessment.
