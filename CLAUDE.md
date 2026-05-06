# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

Learning playground for first-time open source contributors. Contributors open a PR that appends an entry to `src/contributors.js`; their card is then rendered on a static page. There is no application logic to extend — almost all PRs are data additions.

## Commands

- `npm install` — install deps
- `npm start` — serve `src/` with live-server for local preview
- `npm run lint` / `npm run lint:fix` — Biome lint (fix uses `--write --unsafe`)
- `npm run format` / `npm run format:fix` — Biome format

CI (`.github/workflows/tests.yml`) only runs `pnpm run lint` and `pnpm run format` (the "Tests" name is a misnomer — there is no test suite). CI uses pnpm even though the README tells contributors to use npm; both work since the only state is `package.json`.

## Architecture

Static site, no build step or framework:

- `src/index.html` — page shell. The inline `<script type="module">` imports `contributors`, **reverses** the array (newest entries render first), and injects a card per entry by setting `innerHTML`. Avatar is fetched from `https://avatars.githubusercontent.com/<github_username>`.
- `src/contributors.js` — single source of truth. Exports a `contributors` array of `{ name, github_username, favorite_coding_stack: string[], about_me: string, location?: string, favorite_emoji?: string }`. New contributors are appended to the **end** of this array. `location` and `favorite_emoji` are optional and the renderer omits them when missing.
- `src/style.css` — plain CSS for the grid/card layout (Tailwind is in devDependencies but is **not currently wired into the page**).

Rendering quirks to preserve when editing `index.html`:
- Names longer than 20 chars are truncated with `..`.
- Only the first 3 entries of `favorite_coding_stack` are rendered as tags.
- Empty `about_me` is replaced with a "No bio provided" span.
- All contributor-supplied strings flow through `escapeHtml` before reaching `innerHTML` — keep new fields on that path.

Page also includes:
- A **spotlight section** at the top that picks a random contributor on load (and via a Shuffle button); avoids re-picking the same one on shuffle when more than one entry exists.
- A **search bar** that filters the grid by matching against `name` and `github_username` only (case-insensitive substring match).

## Reviewing contributor PRs

A contributor entry is only accepted if all four fields are filled. `about_me` may be an empty string (the UI handles it), but per README all fields should be filled. Entries should be appended at the end of the array, not inserted mid-list, so the reverse-render order matches contribution order.
