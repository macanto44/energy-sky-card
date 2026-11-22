# Contributing

Thanks for helping. Bug reports, ideas and translations are as welcome as code.

## Before you write code

For anything bigger than a fix, open an issue first and say what you'd like to do: the card has a written design, and it's a shame to spend an evening on something that won't fit.

## Getting started

```bash
npm install
npm run build        # the two bundles, at the repository's root
npm run dev          # rebuild on change
```

`demo/index.html` runs the built card on sample readings in your browser, no Home Assistant needed (its query options are listed in `demo/main.js`). `demo/live.html` is the live demo.

## The rules the checks enforce

- **Don't commit the bundles.** `energy-sky-card.js` and `energy-sky-card-editor.js` at the root are rebuilt and committed after the merge; leave them out of your pull request.
- **Tests pass**: `npm run type-check`, `npm test`, and `npm run test:browser` (headless Chrome: no text overflows on a 320 px phone in any language, no animation under reduced motion, the sky keeps clear of the text). CI runs them all.
- **Six languages.** Every new string goes in French, English, German, Spanish, Italian and Dutch: `src/localize.ts` for the card, `LABELS` / `HELPERS` in `src/energy-sky-card-editor.ts` for the editor. A test checks every language has every key. If you only speak some of them, say so in the pull request and leave your best attempt.
- **White text stays readable**: 4.5:1 contrast where it sits, on every sky. `test/sky.test.ts` checks the palettes; a change to colours or layout must keep it green.
- **Your own code.** Nothing copied from other projects, whatever their licence. Third-party material is listed in `NOTICE.md`.
- **No network requests at runtime**, no new runtime dependencies, and the card stays under its size budget (tested).

## Style

- TypeScript strict, plain `HTMLElement` with a shadow root (no Lit).
- The DOM is built once; a Home Assistant update changes text in place. Entity data never goes into `innerHTML` without `escapeHtml`.
- Animations: CSS `@keyframes` on `opacity` and `transform` only.
- `CLAUDE.md` maps the code, file by file.

## The changelog

Add a line under `## Unreleased` in `CHANGELOG.md`, in its section: `### ⚠️ Breaking changes`, `### 🚀 Features and enhancements`, `### 🐛 Bugfixes`, `### 🌍 Translations` or `### 🧰 Maintenance`. One short line, starting with a verb, saying what the user sees: « Keep the battery arrow steady when the power hovers around 0 W ». It becomes the release note as is.

## Pull requests

One change per pull request, a title that says what it does, and a screenshot for anything visible. Pull requests are squashed when merged.
