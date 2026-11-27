// Dinner Table Dash — the HUD and screens. Owns every DOM element the player reads:
// score, hearts, distance, the per-level progress bar with its level name and goal,
// centre flashes ("DODGE!", "+25"), the red hit vignette, the level-complete overlay,
// and the title and end overlays. The 3D world never touches the DOM; main.js calls this.

import { TURKEY } from './config.js';

const el = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.hud = el('hud');
    this.score = el('hud-score');
    this.lives = el('hud-lives');
    this.dist = el('hud-dist');
    this.fill = el('hud-progress-fill');
    this.progressLeft = el('hud-progress-left');
    this.progressRight = el('hud-progress-right');
    this.flashEl = el('hud-flash');
    this.vignette = el('hit-vignette');
    this.title = el('title-screen');
    this.levelScreen = el('level-screen');
    this.levelTitle = el('level-title');
    this.levelSub = el('level-sub');
    this.levelStats = el('level-stats');
    this.continueBtn = el('continue-btn');
    this.end = el('end-screen');
    this.endTitle = el('end-title');
    this.endSub = el('end-sub');
    this.endStats = el('end-stats');
    this.levelLength = 180;
  }

  /** Point the progress bar and its labels at a level config. */
  setLevel(cfg) {
    this.levelLength = cfg.length;
    if (this.progressLeft) this.progressLeft.textContent = cfg.tag;
    if (this.progressRight) this.progressRight.textContent = cfg.goal;
    if (this.fill) this.fill.style.width = '0%';
  }

  showTitle() {
    this.title.classList.add('on');
    this.end.classList.remove('on');
    this.levelScreen.classList.remove('on');
    this.hud.classList.remove('on');
  }

  showHud() {
    this.title.classList.remove('on');
    this.end.classList.remove('on');
    this.levelScreen.classList.remove('on');
    this.hud.classList.add('on');
  }

  showLevelComplete(clearedCfg, nextCfg, stats) {
    this.hud.classList.remove('on');
    this.levelTitle.textContent = 'LEVEL CLEAR!';
    this.levelSub.textContent = `${clearedCfg.name} — escaped. Next: ${nextCfg.name}.`;
    this.levelStats.innerHTML =
      `Distance so far <span>${Math.floor(stats.distance)} m</span><br>` +
      `Corn crumbs <span>${stats.corn}</span><br>` +
      `Near misses <span>${stats.nearMisses}</span><br>` +
      `SCORE SO FAR <span>${stats.score}</span>`;
    this.continueBtn.textContent = `▶  NEXT: ${nextCfg.name}`;
    this.levelScreen.classList.add('on');
  }

  hideLevelComplete() {
    this.levelScreen.classList.remove('on');
  }

  showEnd(kind, stats) {
    this.hud.classList.remove('on');
    this.title.classList.remove('on');
    this.levelScreen.classList.remove('on');
    this.end.className = 'overlay on ' + kind;
    if (kind === 'caught') {
      this.endTitle.textContent = 'CAUGHT!';
      this.endSub.textContent = `The cloche comes down on ${stats.levelName}. Dinner is served… and it is you.`;
    } else {
      this.endTitle.textContent = 'ESCAPED!';
      this.endSub.textContent = 'Out the kitchen window — a free bird!';
    }
    this.endStats.innerHTML =
      `Escape <span>Level ${stats.level} of 3</span><br>` +
      `Distance <span>${Math.floor(stats.distance)} m</span><br>` +
      `Corn crumbs <span>${stats.corn}</span><br>` +
      `Near misses <span>${stats.nearMisses}</span><br>` +
      `FINAL SCORE <span>${stats.score}</span>`;
  }

  update(score, lives, distance) {
    this.score.textContent = 'SCORE ' + score;
    this.lives.textContent = '♥'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, TURKEY.lives - lives));
    this.dist.textContent = Math.floor(distance) + ' m';
    const f = Math.max(0, Math.min(1, distance / this.levelLength));
    this.fill.style.width = (f * 100).toFixed(1) + '%';
  }

  flash(text) {
    this.flashEl.textContent = text;
    this.flashEl.classList.remove('pop');
    void this.flashEl.offsetWidth; // restart the animation
    this.flashEl.classList.add('pop');
  }

  /** The red edge-flash that makes a hit land in the player's eyes. */
  hitFlash() {
    if (!this.vignette) return;
    this.vignette.classList.remove('pop');
    void this.vignette.offsetWidth;
    this.vignette.classList.add('pop');
  }
}
