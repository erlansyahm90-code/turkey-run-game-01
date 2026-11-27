// Dinner Table Dash — the HUD and screens. Owns every DOM element the player reads:
// score, hearts, distance, the table-progress bar, centre flashes ("DODGE!", "+25"),
// and the title and end overlays. The 3D world never touches the DOM; main.js calls this.

import { TABLE, TURKEY } from './config.js';

const el = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.hud = el('hud');
    this.score = el('hud-score');
    this.lives = el('hud-lives');
    this.dist = el('hud-dist');
    this.fill = el('hud-progress-fill');
    this.flashEl = el('hud-flash');
    this.title = el('title-screen');
    this.end = el('end-screen');
    this.endTitle = el('end-title');
    this.endSub = el('end-sub');
    this.endStats = el('end-stats');
    this.flashTimer = null;
  }

  showTitle() {
    this.title.classList.add('on');
    this.end.classList.remove('on');
    this.hud.classList.remove('on');
  }

  showHud() {
    this.title.classList.remove('on');
    this.end.classList.remove('on');
    this.hud.classList.add('on');
  }

  showEnd(kind, stats) {
    this.hud.classList.remove('on');
    this.title.classList.remove('on');
    this.end.className = 'overlay on ' + kind;
    if (kind === 'caught') {
      this.endTitle.textContent = 'CAUGHT!';
      this.endSub.textContent = 'The cloche comes down. Dinner is served… and it is you.';
    } else {
      this.endTitle.textContent = 'ESCAPED!';
      this.endSub.textContent = 'Off the table and out the door — a free bird!';
    }
    this.endStats.innerHTML =
      `Distance <span>${Math.floor(stats.distance)} m</span><br>` +
      `Corn crumbs <span>${stats.corn}</span><br>` +
      `Near misses <span>${stats.nearMisses}</span><br>` +
      `FINAL SCORE <span>${stats.score}</span>`;
  }

  update(score, lives, distance) {
    this.score.textContent = 'SCORE ' + score;
    this.lives.textContent = '♥'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, TURKEY.lives - lives));
    this.dist.textContent = Math.floor(distance) + ' m';
    const f = Math.max(0, Math.min(1, distance / (TABLE.length + TURKEY.startZ)));
    this.fill.style.width = (f * 100).toFixed(1) + '%';
  }

  flash(text) {
    this.flashEl.textContent = text;
    this.flashEl.classList.remove('pop');
    void this.flashEl.offsetWidth; // restart the animation
    this.flashEl.classList.add('pop');
  }
}
