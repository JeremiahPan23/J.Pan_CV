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

The hero uses a larger blue-and-teal spin lattice and rotating octahedral network. The two selected-research cards retain their original renderers. The About Me email is displayed with `[at]` and `[dot]` separators and has no `mailto:` link; this reduces direct harvesting of a literal address but does not prevent a determined crawler from reconstructing it.

## Content and publishing

Keep confirmed roles separate from project-wide work, and retain provisional titles, ongoing status and scientific limitations. The HSSRLM reliability work is described at project level pending confirmation of individual contributions. No research repository links should be added without verification that the URL is appropriate for public sharing.

Push and publish changes only when the user authorizes them. Certificate PDFs are linked from the corresponding certification, award or conference entry. Award years and conference details should follow the supplied certificates; mark certificates that have not yet been issued without adding placeholder links.

## License

MIT
