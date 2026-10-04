# Jiaxin Pan — Physics & AI for Science

A bilingual research portfolio built with static HTML, CSS and JavaScript. No build step is required.

## Files

- `index.html`: shared semantic layout, English content and verified links.
- `translations.zh.js`: Chinese copy, accessible labels and metadata.
- `styles.css`: light editorial design and responsive layouts.
- `script.js`: language selection, section navigation and project deep links.
- `visuals.js`: Canvas2D spin fields, crystal geometry and subtle pointer parallax.
- `images/`: existing portraits, logos and icons.

## Preview and checks

Serve the project directory with a local static server, for example:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. Check desktop and mobile layouts, both languages, navigation and expandable project details.

```sh
node --check script.js
node --check translations.zh.js
node --check visuals.js
git diff --check
```

First-time visitors see English. The EN / 中文 control remembers a manual choice in local storage when available. Both languages share the same panels and project links; changing language preserves expanded details. The document language, title, descriptions and accessible labels update with the selection.

English text in `index.html` serves as the translation key. When editing it, update the corresponding key and Chinese copy in `translations.zh.js`. The page reports missing translations in the console and exposes their count as `document.documentElement.dataset.translationMissing` (expected: `0`). Names and technology identifiers may remain in English intentionally.

The graphics are conceptual artwork, not research outputs or physical simulations. Motion can be paused and respects the system's reduced-motion preference. Rendering stops when the page is hidden or all canvases are outside the viewport. Parallax is restricted to a fine pointer over the hero illustration.

The enlarged hero shows only a 23×23 conceptual XY spin lattice with a moving vortex, rotating arrows, traveling phase modulation and subtle pointer parallax. It uses a dedicated renderer; the two selected-research cards retain their original spin and crystal renderers. The hero is not a depiction of the project's 4×4 experimental system or an actual physical simulation. The About Me email is displayed with `[at]` and `[dot]` separators and has no `mailto:` link; this reduces direct harvesting of a literal address but does not prevent a determined crawler from reconstructing it.

## Content and publishing

Keep confirmed roles separate from project-wide work, and retain provisional titles, ongoing status and scientific limitations. HSSRLM preprocessing, candidate verification and the three-structure audit are confirmed individual contributions. The metal-node registry remains project-level work; individual ownership is not asserted. No research repository links should be added without verification that the URL is appropriate for public sharing.

HSSRLM is a working paper. User-confirmed submission history and plans are shown separately from completed work: the initial AAAI plan was deferred, IJCAI/ACL are possible future venues, and collaborator feedback supports potential co-first authorship for current contributions. Final author order and submission plans remain undecided; no submitted/accepted publication or confirmed co-first credit is asserted.

Push and publish changes only when the user authorizes them. Certificate PDFs are linked from the corresponding certification, award or conference entry. Award years and conference details should follow the supplied certificates; mark certificates that have not yet been issued without adding placeholder links.

The URC2026 entry links to `papers/URC2026_Paper_Public.pdf`, the privacy-reviewed copy of the presented research paper. The student-number line, WeChat contact-card image and six Microsoft Forms editor URLs have been permanently removed. The unredacted original and local output folder are ignored by Git. Publish only the reviewed copy when updating this paper.

The four conference photographs use responsive lossless WebP previews in `images/previews/` at 640px and 1200px widths. The links retain the original full-resolution JPEGs. Resizing reduces detail beyond the preview resolution, while lossless encoding avoids additional compression artifacts; visitors can open the unchanged originals for full detail.

## Choral music

The Experience panel contains three choir entries, linked directly by `#choir`.
Use **School of Music Choir, CUHK-SZ** in English and **音乐学院合唱班** in Chinese;
the university chorus retains its official English name **CUHK-SZ Chorus**.
The Auckland exchange semester is Spring 2026, confirmed by the user and the supplied
concert materials. The December 2025 poster spells the concert title **Winter Carols**.

`arts/AUSC_Performance_Record.pdf` is a two-page public performance record with
award-application headings removed. Its editable Overleaf project is in `arts/ausc/`;
compile `main.tex` together with `assets/` in Overleaf. When TeX is unavailable,
`python arts/ausc/build_pdf.py` reads the source's event/image macros and generates
the PDF through ReportLab. This is a limited renderer, not a LaTeX compiler.
The original application ZIP remains local and is ignored by Git.

Chorus photographs use responsive lossless WebP previews at 640px and 1200px widths,
loaded lazily inside an expandable gallery. Posters use 320px lossless previews.
Each links to its original supplied image. The six-video YouTube playlist was
verified on the choir's public channel; it opens on request rather than loading
an embedded player with the main page. The comprehensive CV includes all three
choir experiences and performance links; the two-page research CV stays focused
on research.

## Traditional CVs

`cv/research-cv.tex` is the research-application version; `cv/comprehensive-cv.tex` is the complete version. Both are standalone moderncv documents with no external image or input-file dependencies. The About Me section links to their PDF counterparts. See `cv/README.md` for regeneration, compilation limitations and the content-sync checklist.

## License

MIT
