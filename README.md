# Scroll Time

A tactile scroll-wheel timer built with React, TypeScript, Vite, and Three.js. The numbers `1`–`90` are real extruded 3D models that scroll past the center of the screen. Pick a number to turn it into a countdown, or scroll past `1` and choose `+` to start an uptimer.

## Features

- **Descending 3D wheel** from `90 → 1`, with a quick intro animation from `1 → 10` on a fresh load.
- **Real 3D digits** built with `TextGeometry`, bevels, lighting, and soft shadows — no CSS faux-3D or image assets.
- **Countdown timer** that starts at `MM:00`. The main 3D number follows whole minutes (`10 → 9 → … → 1`), then switches to raw seconds (`59 → 0`) while the `MM:SS` readout is hidden below one minute.
- **Uptimer** via the `+` entry below `1`, counting upward from `00:00` until stopped.
- **Smart exit focus** — stopping the timer returns the wheel to the number currently displayed (or `1` during the final seconds phase).
- **Responsive layout** — wider spacing on mobile so only the tips of neighboring numbers peek into view; desktop keeps the roomier two-digit preview.
- **Skin drawer** with three selectable themes, horizontally scrollable options, and a **Save** button that applies and persists the choice.
  - Drawer opens from the **right on desktop** and from the **bottom on mobile**.
- **Accessible controls** — keyboard focusable scroll targets, `Escape` to close the drawer or stop the timer, and descriptive `aria-label`s.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| 3D | Three.js (`TextGeometry`, `MeshStandardMaterial`, shadow mapping) |
| Styling | Plain CSS with custom properties |
| Linting | ESLint 10 + typescript-eslint |
| Font data | Local copy of Three.js `helvetiker_bold.typeface.json` |

## Getting started

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm 10+

```bash
git clone https://github.com/iderek937/scroll-timer-web.git
cd scroll-time-web
npm install
npm run dev
```

Open <http://localhost:5173> in your browser.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite development server with HMR |
| `npm run build` | Type-checks with `tsc -b` and creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint across the project |

## How to use

| Action | Result |
| --- | --- |
| Scroll / swipe the wheel | Moves through `90 → 1`, then `+` |
| Click the centered number | Starts a countdown from that many minutes |
| Click `+` | Starts an uptimer from `00:00` |
| Click the active number again, or press `Escape` | Stops the timer and returns to the wheel |
| Click the gear icon (top right) | Opens the settings drawer |
| Select a skin and press **Save** | Applies and remembers the theme |

### Countdown behavior

For a `10` minute timer:

| Time readout | Main 3D number |
| --- | --- |
| `10:00 → 09:01` | `10` |
| `09:00 → 08:01` | `9` |
| `01:00` | `1` |
| `00:59 → 00:00` | `59 → 0` (readout hidden) |

Stopping during `00:59 → 00:00` always returns focus to `1`; otherwise it returns to the number currently shown.

## Skins

Skins are defined in [`src/skins.ts`](src/skins.ts). Each one controls the scroller background, digit color, timer background, timer digit color, and shadow tints.

| Skin | Scroller | Timer |
| --- | --- | --- |
| **Ink** | White background, black digits | Black background, white digits |
| **Paper** (default) | Dark background, white digits | White background, black digits |
| **Amber** | Dark background, orange digits | Orange background, black digits |

The saved skin is stored in `localStorage` under `scroller-skin`.

## Project structure

```text
src/
├─ App.tsx          # Skin state and top-level composition
├─ Scroller3D.tsx   # Three.js scene, scroll rail, timer state machine
├─ Settings.tsx     # Gear button and skin drawer
├─ skins.ts         # Theme definitions and default skin
├─ index.css        # Layout, timer readout, drawer, and theme variables
└─ main.tsx         # React entry point
public/
├─ fonts/helvetiker_bold.typeface.json
└─ favicon.svg
```

### How it works

A transparent DOM scroll container handles snapping, scrolling, and touch input. Its `scrollTop` is mapped to the `y` position of a Three.js `Group` holding all 90 digit models. During a timer, only the active model stays at `z = 0`; the others recede into `-Z` and fade out. Theme changes update both CSS custom properties and the live Three.js material colors, so the 3D digits and 2D UI stay in sync.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Acknowledgements

- Digit geometry uses [`helvetiker_bold.typeface.json`](https://github.com/mrdoob/three.js/blob/master/examples/fonts/helvetiker_bold.typeface.json) from the Three.js examples (MIT licensed).
- Built with [Three.js](https://threejs.org/), [React](https://react.dev/), and [Vite](https://vite.dev/).
