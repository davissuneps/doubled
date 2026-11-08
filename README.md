# Double D

Double D is Dmitry × Davis, a digital creative duo. This repository is their shared desk: a typographic playground for pairing two cuts of the letter D, then four small 3D machines that keep the same palette.

Switch between the Dmitry desk and the Davis desk. Each one keeps its own colors and its own tune. Drag either letter, or retune weight, softness, optical size, italics, gap, stroke, and drift. Shuffle a new pairing, swap the two Ds, or reset the active desk.

Below the pair, the machines share one square: Updraft, Jelly D, Wrong door, and One poke. Drag inside a pane or use its buttons. Reset restores that machine alone. They only move when you ask. If reduced motion is on, each action jumps to its result.

## Requirements

- Node.js 22 or newer
- npm

No accounts, API keys, or paid services.

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

- `npm run dev` starts the local site at [http://127.0.0.1:5173](http://127.0.0.1:5173).
- `npm test` runs the unit tests (desk logic, contrast, shortcuts, and machine simulations).
- `npm run build` typechecks and writes a static site to `dist/`.
- `npm run preview` serves that build.

## Keys

| Key | Action |
| --- | --- |
| `1` | Dmitry desk |
| `2` | Davis desk |
| `S` | Shuffle the active desk |
| `W` | Swap the two Ds |
| `R` | Reset the active desk |

Shortcuts pause while a machine pane or text control is focused. Position sliders mirror the drag gesture on the pair. In the machines, focus a pane and use the arrow keys to shove, squash, or aim. Enter sends a D through the portal or pokes the chain.

## Type

Fraunces by Undercase Type, Outfit by the Outfit Project, and IBM Plex Mono by IBM. All three are used under the SIL Open Font License and are bundled with the site.
