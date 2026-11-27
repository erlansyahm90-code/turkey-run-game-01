# Dinner Table Dash — a turkey escape game

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/erlansyahm90-code/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/erlansyahm90-code/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

An entry for the [make.fun](https://make.fun/bounty/turkey-run-game-01) bounty "Make the best turkey escape game" ($250 in USDC, 20 paid places).

You are the main course. **Dinner Table Dash** is a 3D escape that happens on top of a set Thanksgiving dinner table: a small turkey auto-runs 254 m down a checkered tablecloth between giant plates, glasses and serving domes, while carving knives plunge from above, forks sweep the runner, gravy spills slow it down, and the farmer's hand swoops in to grab it. Get caught and a silver serving cloche slams down over you; reach the table edge and leap — you are free.

Steer with the arrow keys / A,D (or touch), jump with Space / W / ↑ (or tap). Three hearts, corn crumbs and near-misses score points, and both endings — caught and escaped — come with a stats screen and restart.

## Run

Open `game/index.html` in a browser, or serve the folder statically (for example `npx serve game`). Everything is local — Three.js is vendored under `game/`, no network is needed.

## Layout

- `main.ts` — the make.fun harness entry; writes the submission dossier.
- `vendor/makefun-game.ts` — the kit's game harness helper.
- `game/` — the game itself (Three.js scene, mechanics, HUD, audio).
- `screenshots/` — real renders of the actual game.

## License

MIT — see `LICENSE`.
