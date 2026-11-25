# Contributing to Scroll Time

Thanks for taking the time to improve Scroll Time! This document explains how to set up the project, make changes, and submit a pull request.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- A modern browser with WebGL enabled (Chrome, Edge, Firefox, or Safari)

## Local setup

```bash
git clone https://github.com/iderek937/scroll-timer-web.git
cd scroll-time-web
npm install
npm run dev
```

Then open <http://localhost:5173>.

## Making a change

1. Create a branch from `main`:
   ```bash
   git switch -c feat/short-description
   ```
2. Make your change in small, focused commits.
3. Run the checks before pushing:
   ```bash
   npm run lint
   npm run build
   ```
4. Manually verify the UI at both desktop and mobile widths.
5. Push your branch and open a pull request.

## Branch naming

Use a short prefix plus a slug:

| Prefix | Use for |
| --- | --- |
| `feat/` | New behavior or UI |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code cleanup without behavior changes |
| `chore/` | Tooling, dependencies, configuration |

Examples: `feat/skin-drawer`, `fix/countdown-exit-focus`, `docs/readme-refresh`.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) style:

```text
feat: add amber skin
fix: keep focus on the displayed countdown number
docs: rewrite README for GitHub
chore: bump three to 0.187
```

Keep the subject lowercase, imperative, and under ~72 characters.

## Code style

- TypeScript for all application code; keep components as small function components with typed props.
- Follow the existing formatting: two spaces in `.ts`/`.tsx`, tabs in `.css`.
- Prefer plain CSS custom properties for theme values; avoid adding CSS-in-JS libraries.
- Keep Three.js geometry/material disposal in place when adding scene objects.
- Do not commit temporary debug hooks such as `window.__engine` or `window.__setRemaining`.
- Do not commit build output (`dist/`), `node_modules/`, or local environment files.

`npm run lint` must pass. If a rule gets in your way, fix the code rather than disabling the rule unless there is a clear reason.

## Testing checklist

There is no automated test suite yet, so please verify manually:

- [ ] Fresh load plays the `1 → 10` intro and ends centered on `10`.
- [ ] Wheel scrolls `90 → 1 → +` with visible gaps between numbers.
- [ ] Clicking a number starts `MM:00`; minute boundaries update the main 3D number.
- [ ] Below one minute, the readout disappears and the main number counts `59 → 0`.
- [ ] `+` starts an uptimer from `00:00` and stops on click / `Escape`.
- [ ] Exiting the timer focuses the displayed number, or `1` during the seconds phase.
- [ ] Settings opens from the right on desktop and from the bottom on mobile.
- [ ] All three skins apply to both scroller and timer views and survive a reload.
- [ ] `npm run lint` and `npm run build` pass.
- [ ] No browser console errors or WebGL warnings.

For UI changes, include a screenshot or short screen recording in the pull request description.

## Adding a skin

1. Add an entry to `SKINS` in [`src/skins.ts`](src/skins.ts) with all six color fields.
2. The settings card preview updates automatically from those fields.
3. Verify both the scroller and timer views, shadow tint, and the gear icon color.
4. Update the **Skins** table in [`README.md`](README.md) if the new skin is user-facing.

## Reporting bugs

Open an issue with:

- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS
- Viewport size / device
- Console errors or screenshots, if any

## Pull request checklist

- [ ] Branch is based on the latest `main`
- [ ] Commits follow the convention above
- [ ] `npm run lint` and `npm run build` pass
- [ ] Manual checklist completed
- [ ] Docs updated when behavior changes
- [ ] No debug code, secrets, or generated files included

By contributing, you agree that your changes will be licensed under the same terms as the repository.
