# Double D

Double D is Dmitry × Davis, a digital creative duo. This repository is their shared desk: a small typographic playground for pairing two cuts of the letter D.

Switch between the Dmitry desk and the Davis desk. Each one keeps its own palette and its own tune. Drag either letter, or retune weight, softness, optical size, italics, gap, stroke, and drift. Shuffle a new pairing, swap the two Ds, or reset the active desk.

Nothing is submitted anywhere. The note at the bottom can be copied, or opened as a mail draft with the To field left empty. 

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
- `npm test` runs the unit tests (desk logic, contrast, shortcuts, and the note draft).
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

Shortcuts do nothing while the note field is focused. Position sliders mirror the drag gesture, so the sheet works from the keyboard. If reduced motion is on, drift stays editable and does not play.

## Type

Fraunces by Undercase Type, Outfit by the Outfit Project, and IBM Plex Mono by IBM. All three are used under the SIL Open Font License and are bundled with the site.
