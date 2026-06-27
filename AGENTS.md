# Agent Notes

This repository is the Research Notes archive for `https://dev-heps.github.io/research-notes/`.

## Purpose

- Keep research writing separate from the main portfolio.
- Use this archive for paper notes, research ideas, and experiment logs.
- Keep public pages reachable even before real entries exist.

## Structure

- `docs/`: GitHub Pages source. Pages is configured to publish `main` branch `/docs`.
- `docs/index.html`: Research Notes home.
- `docs/papers/index.html`: Papers shell.
- `docs/ideas/index.html`: Ideas shell.
- `docs/experiments/index.html`: Experiments shell.
- `docs/styles.css`: shared styling for public pages.
- `content/`: Markdown working notes and long-term source material.

## Editing Rules

- Public links should point inside `docs/`, not directly to `content/`.
- Keep nav labels and page titles aligned: `Research Notes`, `Papers`, `Ideas`, `Experiments`.
- Every public section should include a link back to `Research Notes` and `Portfolio`.
- Do not add GitHub Actions workflows unless the token has `workflow` scope. This repo currently uses `/docs` Pages publishing.
- Keep the visual style consistent with the portfolio: quiet header, thin borders, compact cards.

## Checks

Before commit:

```bash
git diff --check
```

After pushing, verify:

- `https://dev-heps.github.io/research-notes/`
- `https://dev-heps.github.io/research-notes/papers/`
- `https://dev-heps.github.io/research-notes/ideas/`
- `https://dev-heps.github.io/research-notes/experiments/`

