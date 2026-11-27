# Dinner Table Dash — a turkey escape game

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/erlansyahm90-code/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/erlansyahm90-code/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

An entry for the [make.fun](https://make.fun/bounty/turkey-run-game-01) bounty "Make the best turkey escape game" ($250 in USDC, 20 paid places).

You are the main course. **Dinner Table Dash** is a 3D escape in three levels, a location per level: a small turkey auto-runs across a set **dinner table** (checkered tablecloth, giant plates and glasses, carving knives plunging, forks sweeping, gravy spills, the farmer's hand swooping in), drops to the **kitchen floor** (giant tiles, table and chair legs in the lanes, water puddles, the kitchen cat's paw swiping, a cookbook stack to climb), and finishes along the **countertop** (hanging utensils, oven burners that flare where their grate glows, the carving knife still hunting) to the open kitchen window. Get caught on any level and a silver serving cloche slams down over you; clear the window and you are free.

Steer with the arrow keys / A,D (or touch), jump with Space / W / ↑ (or tap). Three hearts per level, corn crumbs and near-misses score points across the whole escape, and both endings — caught and escaped — come with a stats screen and restart.

## Run

Open `game/index.html` in a browser, or serve the folder statically (for example `npx serve game`). Everything is local — Three.js is vendored under `game/`, no network is needed.

## Layout

- `main.ts` — the make.fun harness entry; writes the submission dossier.
- `vendor/makefun-game.ts` — the kit's game harness helper.
- `game/` — the game itself (Three.js scene, mechanics, HUD, audio).
- `screenshots/` — real renders of the actual game.

## License

MIT — see `LICENSE`.
