// Dinner Table Dash — the game itself. Owns the run's state machine (title, playing,
// level complete, the cloche falling, the leap out of the window, both end screens),
// the turkey's movement, the camera, scoring and lives. The escape is three levels —
// the dinner table, the kitchen floor, the countertop — each its own world in the same
// local frame; score and corn carry across, hearts refill at each level start. The
// worlds, turkey, farmer, hazards, HUD, input, audio and screenshot staging each live
// in their own module; this file conducts them.

import * as THREE from 'three';
import { TURKEY, SCORING, HAZARDS, CAMERA, LEVELS, DASH } from './config.js';
import { makeRandom, randomSeed } from './random.js';
import { initAudio, sfx } from './audio.js';
import { initInput, steerInput, takePresses } from './input.js';
import { buildTableWorld, buildFloorWorld, buildCounterWorld } from './table-world.js';
import { buildTurkey, animateTurkey } from './turkey.js';
import { buildFarmer, buildCloche } from './farmer.js';
import { Hazards } from './hazards.js';
import { Hud } from './hud.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(location.search);
const seedParam = params.get('seed') ? Number(params.get('seed')) : null;

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CAMERA.fov, window.innerWidth / window.innerHeight, 0.1, 700);

// A small painted equirect of a warm kitchen, used only as the reflection environment:
// it is what makes the steel knife, the silver cloche and the cutlery shine instead of
// rendering black. (Reflections of a gradient and three lamp glows — no image files.)
function kitchenEnvTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#4a2c14');
  grad.addColorStop(0.55, '#2a170a');
  grad.addColorStop(1, '#120802');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 256);
  for (const [x, y, r] of [[110, 120, 60], [400, 110, 70], [256, 150, 95]]) {
    const rg = g.createRadialGradient(x, y, 4, x, y, r);
    rg.addColorStop(0, 'rgba(255,190,110,0.95)');
    rg.addColorStop(1, 'rgba(255,150,60,0)');
    g.fillStyle = rg;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromEquirectangular(kitchenEnvTexture()).texture;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let random = makeRandom(seedParam ?? randomSeed());
const worlds = [
  buildTableWorld(scene, random, {
    edgeZ: TURKEY.startZ - LEVELS[0].length, floorY: -34, halfWidth: LEVELS[0].halfWidth,
  }),
  buildFloorWorld(scene, random, {
    length: LEVELS[1].length, halfWidth: LEVELS[1].halfWidth, laneHalf: LEVELS[1].laneHalf,
  }),
  buildCounterWorld(scene, random, {
    length: LEVELS[2].length, halfWidth: LEVELS[2].halfWidth,
  }),
];
let activeWorld = worlds[0];

const turkeyParts = buildTurkey();
scene.add(turkeyParts.group);
const farmer = buildFarmer();
farmer.rotation.y = Math.PI; // face down the run, toward the turkey
scene.add(farmer);
const cloche = buildCloche();
scene.add(cloche);
const hazards = new Hazards(scene, random);

// Feather burst: a puff of loose feathers kicked up behind the turkey when it dashes —
// a small pool of tumbling feather cards, spawned at dash start and trailed while it lasts.
const featherBursts = [];
{
  const geo = new THREE.BoxGeometry(0.36, 0.05, 0.62);
  const matTip = new THREE.MeshStandardMaterial({ color: 0xe8dcc4, roughness: 0.85 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x4e2c14, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group();
    const bits = [];
    for (let j = 0; j < 8; j++) {
      const m = new THREE.Mesh(geo, j % 2 ? matTip : matDark);
      group.add(m);
      bits.push({ mesh: m, vx: 0, vy: 0, vz: 0, spin: 0 });
    }
    group.visible = false;
    scene.add(group);
    featherBursts.push({ group, bits, t: 0, active: false });
  }
}

function spawnFeatherBurst() {
  const b = featherBursts.find((b2) => !b2.active);
  if (!b) return;
  const pos = turkeyPos();
  b.t = 0;
  b.active = true;
  b.group.visible = true;
  b.group.position.set(pos.x, pos.y + 1.1, pos.z + 1.2);
  for (const bit of b.bits) {
    bit.mesh.position.set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.9);
    bit.mesh.scale.setScalar(1);
    bit.vx = (Math.random() - 0.5) * 3.2;
    bit.vy = 1.6 + Math.random() * 2.6;
    bit.vz = 3 + Math.random() * 4.5; // drift backward, behind the running bird
    bit.spin = (Math.random() - 0.5) * 11;
  }
}

function updateFeatherFx(dt) {
  for (const b of featherBursts) {
    if (!b.active) continue;
    b.t += dt;
    if (b.t > 0.6) { b.active = false; b.group.visible = false; continue; }
    for (const bit of b.bits) {
      bit.mesh.position.x += bit.vx * dt;
      bit.mesh.position.y += bit.vy * dt;
      bit.mesh.position.z += bit.vz * dt;
      bit.vy -= 6.5 * dt;
      bit.mesh.rotation.x += bit.spin * dt;
      bit.mesh.rotation.z += bit.spin * 0.7 * dt;
      bit.mesh.scale.setScalar(Math.max(0.15, 1 - b.t / 0.6));
    }
  }
}

const FARMER_SPOTS = [
  (fz) => ({ x: 10, y: 0, z: fz - 52, s: 1 }),     // behind the oven, end of the table
  (fz) => ({ x: 16, y: 0, z: fz - 20, s: 1 }),     // standing on the kitchen floor
  (fz) => ({ x: 15, y: -20, z: fz - 26, s: 1 }),   // on the floor below the counter's end
];

const game = {
  state: 'title',
  paused: false,
  time: 0,
  levelIndex: 0,
  level: LEVELS[0],
  distance: 0,
  totalDistance: 0,
  score: 0,
  lives: TURKEY.lives,
  corn: 0,
  nearMisses: 0,
  turkeyX: 0,
  turkeyY: 0,
  vy: 0,
  steerVis: 0,
  runPhase: 0,
  slowUntil: -1,
  invulnUntil: -1,
  stumbleUntil: -1,
  stamina: DASH.staminaMax,
  dashUntil: -1,
  dashTrailT: 0,
  dashHintShown: false,
  shake: 0,
  clocheT: 0,
  clocheRang: false,
  leapT: 0,
  hud: new Hud(),
  stats() {
    return {
      distance: this.totalDistance + this.distance,
      corn: this.corn, nearMisses: this.nearMisses, score: Math.floor(this.score),
      level: this.levelIndex + 1, levelName: this.level.name,
    };
  },
  finishZ() {
    return TURKEY.startZ - this.level.length;
  },
  poseCamera(pos, look) {
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(look.x, look.y, look.z);
  },
  dropCloche(x, z) {
    cloche.position.set(x, 0.15, z);
    cloche.visible = true;
    turkeyParts.group.visible = false;
  },
  // Screenshot staging only: scale the farmer so his loom reads at cover size.
  poseFarmer(scale) {
    farmer.scale.setScalar(scale);
  },
  setSeededScene() {
    // Screenshot scenes are staged on the seeded worlds built at load; nothing to reset.
  },
  /** Switch the visible world, backdrop, farmer and hazard set to a level. */
  setWorld(i) {
    this.levelIndex = i;
    this.level = LEVELS[i];
    activeWorld = worlds[i];
    worlds.forEach((w, j) => { w.group.visible = j === i; });
    scene.background = new THREE.Color(this.level.bg);
    scene.fog = new THREE.Fog(this.level.fog, 55, this.level.length + 95);
    const spot = FARMER_SPOTS[i](this.finishZ());
    farmer.position.set(spot.x, spot.y, spot.z);
    farmer.scale.setScalar(spot.s);
    farmer.visible = true;
    hazards.setLevel(this.level, i === 1 ? worlds[1].statics : []);
    this.hud.setLevel(this.level);
  },
};
game.turkey = turkeyParts;
game.hazards = hazards;
game.spawnDashFx = spawnFeatherBurst; // screenshot staging poses a dash burst with this
game.dashFx = featherBursts;
game.worlds = worlds;

initInput(canvas);

function turkeyPos() {
  return { x: game.turkeyX, y: game.turkeyY, z: TURKEY.startZ - game.distance };
}

function stumbleAmt() {
  return Math.max(0, (game.stumbleUntil - game.time) / 0.5);
}

function startLevel(i) {
  if (i > 0) game.totalDistance += game.distance; // bank the finished level's metres
  game.setWorld(i);
  game.distance = 0;
  game.lives = TURKEY.lives;
  game.turkeyX = 0;
  game.turkeyY = 0;
  game.vy = 0;
  game.slowUntil = -1;
  game.invulnUntil = -1;
  game.stumbleUntil = -1;
  game.stamina = DASH.staminaMax;
  game.dashUntil = -1;
  game.dashTrailT = 0;
  game.shake = 0;
  game.paused = false;
  game.clocheRang = false;
  cloche.visible = false;
  turkeyParts.group.visible = true;
  game.state = 'playing';
  game.hud.showHud();
  game.hud.update(Math.floor(game.score), game.lives, 0);
  // The countertop sits in bright window light; the other levels keep the base exposure.
  renderer.toneMappingExposure = i === 2 ? 1.3 : 1.12;
}

function resetRun() {
  random = makeRandom(randomSeed());
  hazards.random = random;
  game.score = 0;
  game.corn = 0;
  game.nearMisses = 0;
  game.totalDistance = 0;
  game.dashHintShown = false;
  startLevel(0);
}

function completeLevel() {
  game.score += HAZARDS.levelBonus;
  game.state = 'leveldone';
  sfx.fanfare();
  game.hud.showLevelComplete(game.level, LEVELS[game.levelIndex + 1], game.stats());
}

function startCaught() {
  game.state = 'cloche';
  game.clocheT = 0;
  cloche.position.set(game.turkeyX, 15, turkeyPos().z);
  cloche.visible = true;
}

function startLeap() {
  game.state = 'leaping';
  game.leapT = 0;
  game.score += game.lives * SCORING.escapeLifeBonus;
  sfx.fanfare();
}

const HIT_FLASH = {
  hand: 'GRABBED! −1 ♥',
  paw: 'SCRATCHED! −1 ♥',
  flare: 'SCORCHED! −1 ♥',
  leg: 'BONK! −1 ♥',
  plate: 'CLATTER! −1 ♥',
};

function applyHit(kind) {
  if (game.time < game.invulnUntil) return;
  game.lives -= 1;
  game.invulnUntil = game.time + TURKEY.invulnerableSecs;
  game.stumbleUntil = game.time + 0.5;
  game.shake = Math.max(game.shake, 0.55);
  sfx.hurt();
  game.hud.hitFlash();
  if (game.lives <= 0) {
    startCaught();
  } else {
    game.hud.flash(HIT_FLASH[kind] ?? 'OUCH! −1 ♥');
  }
}

const SPILL_FLASH = { gravy: 'GRAVY! SLOW…', water: 'PUDDLE! SLOW…', oil: 'OIL SLICK! SLOW…' };

function handleEvents(events) {
  for (const ev of events) {
    if (ev.type === 'warn') {
      if (ev.kind === 'knife') sfx.knifeWarn();
      else if (ev.kind === 'fork') sfx.forkSweep();
      else if (ev.kind === 'hand') { sfx.handWhoosh(); game.hud.flash('✋ THE HAND!'); }
      else if (ev.kind === 'paw') { sfx.pawWarn(); game.hud.flash('🐾 THE CAT!'); }
      else if (ev.kind === 'flare') sfx.flareWarn();
    } else if (ev.type === 'slam') {
      if (ev.kind === 'knife') { sfx.knifeHit(); game.shake = Math.max(game.shake, 0.3); }
      else if (ev.kind === 'paw') sfx.pawSlam();
      else if (ev.kind === 'flare') { sfx.flare(); game.shake = Math.max(game.shake, 0.3); }
    } else if (ev.type === 'hit') {
      applyHit(ev.kind);
    } else if (ev.type === 'bump') {
      game.turkeyX = THREE.MathUtils.clamp(game.turkeyX + ev.dx, -game.level.laneHalf, game.level.laneHalf);
    } else if (ev.type === 'nearMiss') {
      game.nearMisses += 1;
      game.score += SCORING.nearMiss;
      sfx.nearMiss();
      game.hud.flash('CLOSE! +' + SCORING.nearMiss);
    } else if (ev.type === 'spill') {
      game.slowUntil = game.time + HAZARDS.gravySlowSecs;
      if (ev.skin === 'gravy') sfx.splat(); else sfx.splash();
      game.hud.flash(SPILL_FLASH[ev.skin] ?? 'SLOW…');
    } else if (ev.type === 'corn') {
      game.corn += 1;
      game.score += SCORING.cornKernel;
      sfx.corn();
      game.hud.flash('+' + SCORING.cornKernel);
    }
  }
}

/** Start a dash if the stamina bar can pay for it. Speed only — never armour:
 *  every hazard keeps checking the turkey's position exactly as before. */
function tryDash() {
  if (game.time < game.dashUntil) return;
  if (game.stamina < DASH.staminaCost) return;
  game.stamina -= DASH.staminaCost;
  game.dashUntil = game.time + DASH.durationSecs;
  game.dashTrailT = 0;
  sfx.dash();
  spawnFeatherBurst();
}

function updatePlaying(dt) {
  const level = game.level;
  const presses = takePresses();
  if (presses.has('dash')) tryDash();
  const dashing = game.time < game.dashUntil;

  const f = Math.min(1, game.distance / level.length);
  let speed = TURKEY.baseSpeed + (TURKEY.topSpeed - TURKEY.baseSpeed) * f;
  if (game.time < game.slowUntil) speed *= HAZARDS.gravySlowFactor;
  if (dashing) speed *= DASH.speedFactor;
  game.distance += speed * dt;
  game.score += SCORING.perMetre * speed * dt;
  game.runPhase += dt * speed * 1.5;

  if (!dashing) {
    game.stamina = Math.min(DASH.staminaMax, game.stamina + (DASH.staminaMax / DASH.refillSecs) * dt);
  } else {
    game.dashTrailT += dt;
    if (game.dashTrailT > 0.3) { game.dashTrailT = 0; spawnFeatherBurst(); }
  }
  updateFeatherFx(dt);

  // The FOV blooms a little while the dash burns, easing back as it ends.
  const kick = dashing ? DASH.fovKick * Math.max(0, (game.dashUntil - game.time) / DASH.durationSecs) : 0;
  camera.fov += (CAMERA.fov + kick - camera.fov) * Math.min(1, dt * 9);
  camera.updateProjectionMatrix();

  // One-time discovery hint, early in Level 1 while the bar sits full.
  if (!game.dashHintShown && game.levelIndex === 0 && game.distance > 10) {
    game.dashHintShown = true;
    game.hud.flash('SHIFT — DASH!');
  }

  const steer = steerInput();
  game.steerVis += (steer - game.steerVis) * Math.min(1, dt * 10);
  game.turkeyX = THREE.MathUtils.clamp(
    game.turkeyX + steer * TURKEY.steerSpeed * dt, -level.laneHalf, level.laneHalf);

  if (presses.has('jump') && game.turkeyY <= 0) {
    game.vy = TURKEY.jumpVelocity;
    sfx.jump();
  }
  if (presses.has('pause')) {
    game.paused = !game.paused;
    game.hud.flash(game.paused ? 'PAUSED' : 'GO!');
  }
  if (game.turkeyY > 0 || game.vy > 0) {
    game.turkeyY += game.vy * dt;
    game.vy += TURKEY.gravity * dt;
    if (game.turkeyY <= 0) { game.turkeyY = 0; game.vy = 0; }
  }

  const pos = turkeyPos();
  const events = hazards.update(dt, pos, game.distance);
  handleEvents(events);
  if (game.state !== 'playing') return; // a hit may have ended the run mid-frame

  turkeyParts.group.position.set(pos.x, pos.y, pos.z);
  const invulnBlink = game.time < game.invulnUntil && Math.floor(game.time * 9) % 2 === 0;
  turkeyParts.group.visible = !invulnBlink;
  animateTurkey(turkeyParts, {
    runPhase: game.runPhase, airborne: game.turkeyY > 0.05 ? 1 : 0,
    steer: game.steerVis, t: game.time, baseY: game.turkeyY, stumble: stumbleAmt(),
  });

  if (game.distance >= level.length) {
    if (game.levelIndex >= LEVELS.length - 1) startLeap();
    else completeLevel();
  }
  game.hud.update(Math.floor(game.score), game.lives, game.distance,
    game.stamina / DASH.staminaMax, dashing);
}

function updateCamera(dt) {
  const pos = turkeyPos();
  const tx = pos.x * 0.55;
  const tz = pos.z + CAMERA.back;
  camera.position.x += (tx - camera.position.x) * Math.min(1, dt * 5);
  camera.position.y += (CAMERA.height - camera.position.y) * Math.min(1, dt * 5);
  camera.position.z += (tz - camera.position.z) * Math.min(1, dt * 7);
  if (game.shake > 0) {
    game.shake = Math.max(0, game.shake - dt * 1.4);
    camera.position.x += (Math.random() - 0.5) * game.shake * 0.9;
    camera.position.y += (Math.random() - 0.5) * game.shake * 0.9;
  }
  camera.lookAt(pos.x * 0.7, 1.7, pos.z - CAMERA.lookAhead);
  activeWorld.keyLight.position.set(pos.x + 16, 30, pos.z + 12);
  activeWorld.keyLight.target.position.set(pos.x, 0, pos.z - 14);
  activeWorld.keyLight.target.updateMatrixWorld();
}

function updateCloche(dt) {
  game.clocheT += dt;
  const p = Math.min(1, game.clocheT / 0.75);
  const ease = p * p;
  const pos = turkeyPos();
  cloche.position.set(pos.x, 15 - ease * 14.85, pos.z);
  if (p > 0.8) turkeyParts.group.visible = false;
  if (p >= 1 && game.clocheT > 1.35) {
    game.state = 'caught';
    game.hud.showEnd('caught', game.stats());
  }
  if (p >= 1 && !game.clocheRang) {
    game.clocheRang = true;
    sfx.cloche();
    game.shake = 0.7;
  }
  updateCamera(dt);
}

function updateLeap(dt) {
  game.leapT += dt;
  const p = Math.min(1, game.leapT / 1.7);
  const z0 = game.finishZ();
  const z = z0 - p * 16;
  const y = Math.sin(p * Math.PI) * 6 - 20 * p * p;
  turkeyParts.group.position.set(game.turkeyX * (1 - p * 0.4), y, z);
  animateTurkey(turkeyParts, {
    runPhase: game.runPhase + p * 6, airborne: 1, steer: 0, t: game.time, baseY: y,
  });
  camera.position.x += (game.turkeyX * 0.4 - camera.position.x) * Math.min(1, dt * 3);
  camera.position.y += ((y + 9) - camera.position.y) * Math.min(1, dt * 3);
  camera.position.z += ((z + 13) - camera.position.z) * Math.min(1, dt * 3);
  camera.lookAt(game.turkeyX * 0.6, y + 1, z - 8);
  if (p >= 1) {
    game.state = 'escaped';
    game.hud.showEnd('escaped', game.stats());
  }
}

function updateLevelDone(dt) {
  // The turkey catches its breath at the finish while the overlay waits for Continue.
  const pos = turkeyPos();
  turkeyParts.group.position.set(pos.x, 0, pos.z);
  animateTurkey(turkeyParts, {
    runPhase: game.runPhase + dt * 1.2, airborne: 0, steer: 0, t: game.time, baseY: 0,
  });
  updateCamera(dt);
}

function updateTitle(dt) {
  game.runPhase += dt * 2.2;
  turkeyParts.group.position.set(0, 0, TURKEY.startZ);
  animateTurkey(turkeyParts, {
    runPhase: game.runPhase * 0.4, airborne: 0, steer: Math.sin(game.time * 0.6) * 0.2,
    t: game.time, baseY: 0,
  });
  const drift = Math.sin(game.time * 0.16) * 2.4;
  camera.position.set(drift, 4.4 + Math.sin(game.time * 0.23) * 0.5, TURKEY.startZ + 12.5);
  camera.lookAt(0, 2.4, TURKEY.startZ - 16);
  activeWorld.keyLight.position.set(16, 30, TURKEY.startZ + 12);
  activeWorld.keyLight.target.position.set(0, 0, TURKEY.startZ - 14);
  activeWorld.keyLight.target.updateMatrixWorld();
}

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (game.paused) dt = 0;
  game.time += dt;

  farmer.rotation.z = Math.sin(game.time * 0.4) * 0.012;
  activeWorld.update(dt, game.time);

  if (game.state === 'title') updateTitle(dt);
  else if (game.state === 'playing') { if (!game.paused) updatePlaying(dt); updateCamera(dt); }
  else if (game.state === 'cloche') updateCloche(dt);
  else if (game.state === 'leaping') updateLeap(dt);
  else if (game.state === 'leveldone') updateLevelDone(dt);
  else updateCamera(dt); // caught / escaped: hold the last framing

  renderer.render(scene, camera);
}

function startFromGesture() {
  initAudio();
  sfx.gobble();
  game.clocheRang = false;
  resetRun();
}

function continueFromGesture() {
  initAudio();
  if (game.state === 'leveldone') startLevel(game.levelIndex + 1);
}

document.getElementById('start-btn').addEventListener('click', startFromGesture);
document.getElementById('restart-btn').addEventListener('click', startFromGesture);
document.getElementById('continue-btn').addEventListener('click', continueFromGesture);
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Enter') return;
  if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') startFromGesture();
  else if (game.state === 'leveldone') continueFromGesture();
});

window.__DTD = game;

game.setWorld(0);

const shot = params.get('shot');
if (shot) {
  stageShot(shot, game);
  // Stills get the same per-level exposure a live run would (see startLevel).
  renderer.toneMappingExposure = game.levelIndex === 2 ? 1.3 : 1.12;
  // Pose the bird for the still, settle the world one tick, then paint twice.
  const pose = {
    title: { runPhase: 0.6, airborne: 0 },
    play: { runPhase: 1.3, airborne: 0 },
    floor: { runPhase: 1.3, airborne: 0 },
    counter: { runPhase: 1.6, airborne: 0 },
    caught: { runPhase: 0, airborne: 0 },
    escaped: { runPhase: 2.4, airborne: 1 },
  }[shot] ?? { runPhase: 0, airborne: 0 };
  animateTurkey(turkeyParts, {
    runPhase: pose.runPhase, airborne: pose.airborne, steer: 0.15, t: 1.4,
    baseY: turkeyParts.group.position.y,
  });
  activeWorld.update(0.016, 1.4);
  activeWorld.keyLight.position.set(turkeyParts.group.position.x + 16, 30, turkeyParts.group.position.z + 12);
  activeWorld.keyLight.target.position.set(turkeyParts.group.position.x, 0, turkeyParts.group.position.z - 14);
  activeWorld.keyLight.target.updateMatrixWorld();
  renderer.render(scene, camera);
  renderer.render(scene, camera);
  window.__shotReady = true;
} else {
  game.hud.showTitle();
  requestAnimationFrame(frame);
}
