// Dinner Table Dash — hand-in program for turkey-run-game-01 (Node 22, standard library only).
//
// The game itself is the static site in game/ (index.html plus its ES modules and the vendored
// three.js build): it opens offline in a desktop browser and plays with keyboard and mouse.
// This program hands the entry in: it copies game/ and screenshots/ from beside this file to
// /output and writes /output/dossier.json with buildDossier from vendor/makefun-game.ts, so
// the judge reads exactly the files and screenshots that ship here.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps below are the scorer's own (see the competition's gate): they only shape the
// dossier text and refuse shapes the scorer itself would refuse — more than 4 screenshots or
// one over 256 KiB, more than 993 files or 48 MiB under game/, or a game path over 1,000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
