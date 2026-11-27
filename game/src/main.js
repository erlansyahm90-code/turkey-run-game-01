// Dinner Table Dash — the game itself. Owns the run's state machine (title, playing,
// the cloche falling, the leap off the edge, both end screens), the turkey's movement,
// the camera, scoring and lives. The world, turkey, farmer, hazards, HUD, input, audio
// and screenshot staging each live in their own module; this file conducts them.

import * as THREE from 'three';
import { TABLE, TURKEY, SCORING, CAMERA } from './config.js';
import { makeRandom, randomSeed } from './random.js';
import { initAudio, sfx } from './audio.js';
import { initInput, steerInput, takePresses } from './input.js';
import { buildWorld } from './table-world.js';
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

const game = {
  state: 'title',
  paused: false,
  time: 0,
  distance: 0,
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
  shake: 0,
  clocheT: 0,
  leapT: 0,
  hud: new Hud(),
  stats() {
    return { distance: this.distance, corn: this.corn, nearMisses: this.nearMisses, score: Math.floor(this.score) };
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
    // Screenshot scenes are staged on the seeded world built at load; nothing to reset.
  },
};

let random = makeRandom(seedParam ?? randomSeed());
const world = buildWorld(scene, random);
const turkeyParts = buildTurkey();
scene.add(turkeyParts.group);
const farmer = buildFarmer();
farmer.rotation.y = Math.PI; // face down the table, toward the turkey
scene.add(farmer);
const cloche = buildCloche();
scene.add(cloche);
const hazards = new Hazards(scene, random);
game.turkey = turkeyParts;
game.hazards = hazards;

initInput(canvas);

function turkeyPos() {
  return { x: game.turkeyX, y: game.turkeyY, z: TURKEY.startZ - game.distance };
}

function resetRun() {
  random = makeRandom(randomSeed());
  hazards.random = random;
  hazards.reset();
  game.distance = 0;
  game.score = 0;
  game.lives = TURKEY.lives;
  game.corn = 0;
  game.nearMisses = 0;
  game.turkeyX = 0;
  game.turkeyY = 0;
  game.vy = 0;
  game.slowUntil = -1;
  game.invulnUntil = -1;
  game.shake = 0;
  game.paused = false;
  cloche.visible = false;
  turkeyParts.group.visible = true;
  game.state = 'playing';
  game.hud.showHud();
  game.hud.update(0, game.lives, 0);
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

function applyHit(kind) {
  if (game.time < game.invulnUntil) return;
  game.lives -= 1;
  game.invulnUntil = game.time + TURKEY.invulnerableSecs;
  game.shake = Math.max(game.shake, 0.55);
  sfx.hurt();
  if (game.lives <= 0) {
    startCaught();
  } else {
    game.hud.flash(kind === 'hand' ? 'GRABBED! −1 ♥' : 'OUCH! −1 ♥');
  }
}

function handleEvents(events) {
  for (const ev of events) {
    if (ev.type === 'warn') {
      if (ev.kind === 'knife') sfx.knifeWarn();
      else if (ev.kind === 'fork') sfx.forkSweep();
      else if (ev.kind === 'hand') { sfx.handWhoosh(); game.hud.flash('✋ THE HAND!'); }
    } else if (ev.type === 'slam') {
      if (ev.kind === 'knife') { sfx.knifeHit(); game.shake = Math.max(game.shake, 0.3); }
    } else if (ev.type === 'hit') {
      applyHit(ev.kind);
    } else if (ev.type === 'nearMiss') {
      game.nearMisses += 1;
      game.score += SCORING.nearMiss;
      sfx.nearMiss();
      game.hud.flash('CLOSE! +' + SCORING.nearMiss);
    } else if (ev.type === 'gravy') {
      game.slowUntil = game.time + 1.25;
      sfx.splat();
      game.hud.flash('GRAVY! SLOW…');
    } else if (ev.type === 'corn') {
      game.corn += 1;
      game.score += SCORING.cornKernel;
      sfx.corn();
    }
  }
}

function updatePlaying(dt) {
  const f = Math.min(1, game.distance / TABLE.length);
  let speed = TURKEY.baseSpeed + (TURKEY.topSpeed - TURKEY.baseSpeed) * f;
  if (game.time < game.slowUntil) speed *= 0.45;
  game.distance += speed * dt;
  game.score += SCORING.perMetre * speed * dt;
  game.runPhase += dt * speed * 1.5;

  const steer = steerInput();
  game.steerVis += (steer - game.steerVis) * Math.min(1, dt * 10);
  game.turkeyX = THREE.MathUtils.clamp(
    game.turkeyX + steer * TURKEY.steerSpeed * dt, -TABLE.laneHalf, TABLE.laneHalf);

  const presses = takePresses();
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

  turkeyParts.group.position.set(pos.x, pos.y, pos.z);
  const invulnBlink = game.time < game.invulnUntil && Math.floor(game.time * 9) % 2 === 0;
  turkeyParts.group.visible = !invulnBlink;
  animateTurkey(turkeyParts, {
    runPhase: game.runPhase, airborne: game.turkeyY > 0.05 ? 1 : 0,
    steer: game.steerVis, t: game.time, baseY: game.turkeyY,
  });

  if (pos.z <= TABLE.edgeZ) startLeap();
  game.hud.update(Math.floor(game.score), game.lives, game.distance);
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
  world.keyLight.position.set(pos.x + 16, 30, pos.z + 12);
  world.keyLight.target.position.set(pos.x, 0, pos.z - 14);
  world.keyLight.target.updateMatrixWorld();
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
  const p = Math.min(1, game.leapT / 1.6);
  const z = TABLE.edgeZ - p * 15;
  const y = Math.sin(p * Math.PI) * 7 + (TABLE.floorY + 0.2) * p * p;
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
  world.keyLight.position.set(16, 30, TURKEY.startZ + 12);
  world.keyLight.target.position.set(0, 0, TURKEY.startZ - 14);
  world.keyLight.target.updateMatrixWorld();
}

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (game.paused) dt = 0;
  game.time += dt;

  farmer.rotation.z = Math.sin(game.time * 0.4) * 0.012;
  farmer.position.y = Math.sin(game.time * 0.8) * 0.35;
  world.update(dt, game.time);

  if (game.state === 'title') updateTitle(dt);
  else if (game.state === 'playing') { if (!game.paused) updatePlaying(dt); updateCamera(dt); }
  else if (game.state === 'cloche') updateCloche(dt);
  else if (game.state === 'leaping') updateLeap(dt);
  else updateCamera(dt); // caught / escaped: hold the last framing

  renderer.render(scene, camera);
}

function startFromGesture() {
  initAudio();
  sfx.gobble();
  game.clocheRang = false;
  resetRun();
}

document.getElementById('start-btn').addEventListener('click', startFromGesture);
document.getElementById('restart-btn').addEventListener('click', startFromGesture);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && (game.state === 'title' || game.state === 'caught' || game.state === 'escaped')) {
    startFromGesture();
  }
});

window.__DTD = game;

const shot = params.get('shot');
if (shot) {
  stageShot(shot, game);
  // Pose the bird for the still, settle the world one tick, then paint twice.
  const pose = {
    title: { runPhase: 0.6, airborne: 0 },
    play: { runPhase: 1.3, airborne: 0 },
    caught: { runPhase: 0, airborne: 0 },
    escaped: { runPhase: 2.4, airborne: 1 },
  }[shot] ?? { runPhase: 0, airborne: 0 };
  animateTurkey(turkeyParts, {
    runPhase: pose.runPhase, airborne: pose.airborne, steer: 0.15, t: 1.4,
    baseY: turkeyParts.group.position.y,
  });
  world.update(0.016, 1.4);
  world.keyLight.position.set(turkeyParts.group.position.x + 16, 30, turkeyParts.group.position.z + 12);
  world.keyLight.target.position.set(turkeyParts.group.position.x, 0, turkeyParts.group.position.z - 14);
  world.keyLight.target.updateMatrixWorld();
  renderer.render(scene, camera);
  renderer.render(scene, camera);
  window.__shotReady = true;
} else {
  game.hud.showTitle();
  requestAnimationFrame(frame);
}
