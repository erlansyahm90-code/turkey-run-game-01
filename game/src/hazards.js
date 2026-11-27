// Dinner Table Dash — hazards and pickups. Owns everything that can hurt or reward the
// turkey across all three levels: the carving knife that plunges where its shadow grows,
// the fork that sweeps low, spills that slow the run (gravy on the table, water on the
// floor, oil on the counter), serving plates left in the lanes, the farmer's grabbing
// hand, the kitchen cat's paw, the oven burners that flare where their grate glows, the
// giant legs standing in the floor lanes, and the corn crumbs worth points. Which of
// these hunt on a level comes from the level config (config.js LEVELS). Update returns
// events; main.js decides what they cost. Every hazard telegraphs first — a narrow
// escape is always fair.

import * as THREE from 'three';
import { HAZARDS, SCORING, LEVELS } from './config.js';
import { buildHand, buildPaw, setGrab } from './farmer.js';
import { range } from './random.js';

const STEEL = new THREE.MeshStandardMaterial({ color: 0xe9eef4, roughness: 0.26, metalness: 0.72 });
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: 0x8f979e, roughness: 0.35, metalness: 0.85 });
const HANDLE = new THREE.MeshStandardMaterial({ color: 0x2e1c10, roughness: 0.7 });
const CORN = new THREE.MeshStandardMaterial({ color: 0xf6c945, roughness: 0.4, emissive: 0x8a6400, emissiveIntensity: 0.9 });
const CERAMIC = new THREE.MeshStandardMaterial({ color: 0xf6efe2, roughness: 0.35 });

// Spill skins per level. The scene carries an environment map, so a low-roughness skin
// reads glossy in a still frame: brown gravy on the table, pale reflective water on the
// tiles, a dark oil slick on the granite.
const SPILL_MATS = {
  gravy: new THREE.MeshStandardMaterial({ color: 0x7a4a21, roughness: 0.12 }),
  water: new THREE.MeshStandardMaterial({
    color: 0xa8c8dc, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.78, envMapIntensity: 1.9,
  }),
  oil: new THREE.MeshStandardMaterial({
    color: 0x201812, roughness: 0.07, metalness: 0.15, envMapIntensity: 1.5,
  }),
};

function shadowBlob(radius, opacity) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.24;
  m.renderOrder = 2;
  return m;
}

function warningRing(radius) {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.82, radius, 28),
    new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.26;
  m.renderOrder = 3;
  return m;
}

function buildKnife() {
  // A carving knife in profile, extruded: long blade, curved belly, sharp point, so the
  // silhouette reads as a knife from any camera angle. The group origin is the bolster;
  // the blade hangs below it, point down, ready to plunge.
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0, 0);            // heel of the blade, at the bolster
  s.lineTo(0, -7.6);         // straight spine down…
  s.quadraticCurveTo(0.15, -9.6, 1.5, -10.6); // …sweeping to the point
  s.quadraticCurveTo(2.6, -8.2, 2.75, -5.2); // the curved cutting belly
  s.quadraticCurveTo(2.85, -2.2, 2.5, 0);     // up to the bolster's front
  s.lineTo(0, 0);
  const bladeGeo = new THREE.ExtrudeGeometry(s, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
  const blade = new THREE.Mesh(bladeGeo, STEEL);
  blade.position.set(-1.4, 0, -0.17);
  blade.castShadow = true;
  g.add(blade);
  const bolster = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.85, 0.72), STEEL_DARK);
  bolster.position.y = 0.35;
  g.add(bolster);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.74, 4.8, 10), HANDLE);
  handle.position.y = 3.1;
  handle.castShadow = true;
  g.add(handle);
  for (const ry of [1.9, 3.1, 4.3]) {
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.3, 8), STEEL_DARK);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.y = ry;
    g.add(rivet);
  }
  g.visible = false;
  return g;
}

function buildFork() {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.BoxGeometry(24, 0.5, 1.1), STEEL_DARK);
  handle.position.x = 6;
  handle.castShadow = true;
  g.add(handle);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 2.6), STEEL);
  neck.position.x = -7.4;
  g.add(neck);
  for (let i = 0; i < 4; i++) {
    const tine = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 0.62), STEEL);
    tine.position.set(-11.2, 0, -1.65 + i * 1.1);
    tine.castShadow = true;
    g.add(tine);
  }
  g.visible = false;
  return g;
}

function buildLanePlate() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(HAZARDS.plateRadius, HAZARDS.plateRadius * 0.82, 0.55, 26), CERAMIC);
  base.position.y = 0.3;
  base.castShadow = true; base.receiveShadow = true;
  g.add(base);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(HAZARDS.plateRadius * 0.88, 0.24, 10, 30), CERAMIC);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.6;
  g.add(rim);
  const mash = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.2, 12),
    new THREE.MeshStandardMaterial({ color: 0xf3e5c3, roughness: 0.9 }));
  mash.position.y = 1.1;
  g.add(mash);
  g.visible = false;
  return g;
}

function buildFlare() {
  // One oven burner: a dark grate disc that glows as it heats, a warning ring, then a
  // two-layer flame cone and a few steam puffs. The glow and flame colours are graded by
  // phase (deep red → orange → yellow → white-hot) so the danger reads in a still frame.
  const g = new THREE.Group();
  const grate = new THREE.Mesh(new THREE.CylinderGeometry(HAZARDS.flareRadius, HAZARDS.flareRadius * 1.08, 0.3, 20),
    new THREE.MeshStandardMaterial({ color: 0x17130f, roughness: 0.6, metalness: 0.4 }));
  grate.position.y = 0.15;
  grate.receiveShadow = true;
  g.add(grate);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x2a0800, transparent: true, opacity: 0.9, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(HAZARDS.flareRadius * 0.8, 20), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.33;
  glow.renderOrder = 2;
  g.add(glow);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.92, depthWrite: false });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(1.85, 4.6, 12), flameMat);
  flame.position.y = 2.3;
  flame.visible = false;
  g.add(flame);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff3c0, transparent: true, opacity: 0.95, depthWrite: false });
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.8, 10), coreMat);
  core.position.y = 1.4;
  core.visible = false;
  g.add(core);
  const puffs = [];
  const puffMat = new THREE.MeshBasicMaterial({ color: 0xf4f6f8, transparent: true, opacity: 0, depthWrite: false });
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), puffMat.clone());
    puff.visible = false;
    g.add(puff);
    puffs.push(puff);
  }
  g.visible = false;
  return { group: g, glowMat, flame, flameMat, core, coreMat, puffs, phase: 'idle', t: 0, x: 0, z: 0, hitDone: false };
}

export class Hazards {
  constructor(scene, random) {
    this.scene = scene;
    this.random = random;
    this.level = LEVELS[0];
    this.statics = [];
    this.knives = [];
    for (let i = 0; i < 3; i++) {
      const knife = buildKnife();
      scene.add(knife);
      const blob = shadowBlob(HAZARDS.knifeRadius, 0.42);
      blob.visible = false;
      scene.add(blob);
      const ring = warningRing(HAZARDS.knifeRadius + 0.5);
      ring.visible = false;
      scene.add(ring);
      this.knives.push({ group: knife, blob, ring, phase: 'idle', t: 0, x: 0, z: 0, scored: false });
    }
    this.fork = { group: buildFork(), phase: 'idle', t: 0, side: 1, z: 0, hitDone: false };
    scene.add(this.fork.group);
    // Two grabbers share one machine: the farmer's hand and the cat's paw.
    const handParts = buildHand();
    this.hand = {
      ...handParts, kind: 'hand', phase: 'idle', t: 0, x: 0, z: 0, hitDone: false,
      blob: shadowBlob(7.4, 0.4), radiusX: HAZARDS.handRadiusX, radiusZ: HAZARDS.handRadiusZ,
      telegraphSecs: HAZARDS.handTelegraphSecs, hitY: 2.8,
    };
    this.hand.blob.visible = false;
    scene.add(this.hand.group);
    scene.add(this.hand.blob);
    const pawParts = buildPaw();
    this.paw = {
      ...pawParts, kind: 'paw', phase: 'idle', t: 0, x: 0, z: 0, hitDone: false,
      blob: shadowBlob(6.4, 0.38), radiusX: HAZARDS.pawRadiusX, radiusZ: HAZARDS.pawRadiusZ,
      telegraphSecs: HAZARDS.pawTelegraphSecs, hitY: 2.6,
    };
    this.paw.blob.visible = false;
    scene.add(this.paw.group);
    scene.add(this.paw.blob);
    this.spills = [];
    for (let i = 0; i < 6; i++) {
      const spill = new THREE.Mesh(new THREE.CircleGeometry(1, 22), SPILL_MATS.gravy);
      spill.rotation.x = -Math.PI / 2;
      spill.position.y = 0.21;
      spill.renderOrder = 1;
      spill.visible = false;
      scene.add(spill);
      this.spills.push({ mesh: spill, x: 0, z: 0, r: 3, used: false });
    }
    this.plates = [];
    for (let i = 0; i < 3; i++) {
      const plate = buildLanePlate();
      scene.add(plate);
      this.plates.push({ group: plate, active: false, x: 0, z: 0, vx: 0 });
    }
    this.flares = [];
    for (let i = 0; i < 3; i++) {
      const flare = buildFlare();
      scene.add(flare.group);
      const ring = warningRing(HAZARDS.flareRadius + 0.5);
      ring.visible = false;
      scene.add(ring);
      flare.ring = ring;
      this.flares.push(flare);
    }
    this.corns = [];
    const cornGeo = new THREE.IcosahedronGeometry(0.56, 0);
    for (let i = 0; i < 30; i++) {
      const kernel = new THREE.Mesh(cornGeo, CORN);
      kernel.visible = false;
      kernel.castShadow = true;
      scene.add(kernel);
      this.corns.push({ mesh: kernel, active: false, x: 0, z: 0, spin: range(random, 0, 6) });
    }
    // Corn-burst particles: when a kernel is collected it pops into crumbs.
    this.bursts = [];
    const bitGeo = new THREE.TetrahedronGeometry(0.17);
    for (let i = 0; i < 10; i++) {
      const bits = [];
      const bgroup = new THREE.Group();
      for (let j = 0; j < 6; j++) {
        const bit = new THREE.Mesh(bitGeo, CORN);
        bgroup.add(bit);
        bits.push({ mesh: bit, vx: 0, vy: 0, vz: 0 });
      }
      bgroup.visible = false;
      scene.add(bgroup);
      this.bursts.push({ group: bgroup, bits, t: 0, active: false });
    }
    this.reset();
  }

  /** Point the hazard set at a level: which hunters are on, the spill skin, the statics. */
  setLevel(level, statics) {
    this.level = level;
    this.statics = statics ?? [];
    const mat = SPILL_MATS[level.hazards.spill] ?? SPILL_MATS.gravy;
    for (const s of this.spills) s.mesh.material = mat;
    this.reset();
  }

  reset() {
    for (const k of this.knives) { k.phase = 'idle'; k.group.visible = false; k.blob.visible = false; k.ring.visible = false; }
    this.fork.phase = 'idle'; this.fork.group.visible = false; this.forkTimer = HAZARDS.forkEverySecs * 0.7;
    for (const g of [this.hand, this.paw]) { g.phase = 'idle'; g.group.visible = false; g.blob.visible = false; }
    this.handTimer = HAZARDS.handEverySecs * 0.8;
    this.pawTimer = HAZARDS.pawEverySecs * 0.9;
    for (const s of this.spills) { s.mesh.visible = false; s.used = false; }
    for (const p of this.plates) { p.active = false; p.group.visible = false; }
    for (const fl of this.flares) {
      fl.phase = 'idle'; fl.group.visible = false; fl.ring.visible = false;
      fl.flame.visible = false; fl.core.visible = false;
      for (const puff of fl.puffs) puff.visible = false;
    }
    for (const c of this.corns) { c.active = false; c.mesh.visible = false; }
    for (const b of this.bursts) { b.active = false; b.group.visible = false; }
    for (const s of this.statics) s.lastHitDist = -99;
    this.nextKnifeAt = HAZARDS.knifeFirstAt;
    this.nextSpillAt = 34;
    this.nextPlateAt = 55;
    this.nextCornAt = 14;
    this.nextFlareAt = HAZARDS.flareFirstAt;
  }

  knifeGap(distance) {
    const f = Math.min(1, distance / this.level.length);
    return HAZARDS.knifeGapStart + (HAZARDS.knifeGapEnd - HAZARDS.knifeGapStart) * f;
  }

  flareGap(distance) {
    const f = Math.min(1, distance / this.level.length);
    return HAZARDS.flareGapStart + (HAZARDS.flareGapEnd - HAZARDS.flareGapStart) * f;
  }

  spawnKnife(turkey) {
    const k = this.knives.find((k2) => k2.phase === 'idle');
    if (!k) return;
    k.x = THREE.MathUtils.clamp(turkey.x + range(this.random, -6.5, 6.5), -this.level.laneHalf, this.level.laneHalf);
    k.z = turkey.z - range(this.random, 24, 31);
    k.phase = 'telegraph';
    k.t = 0;
    k.scored = false;
    k.group.position.set(k.x, 20.5, k.z);
    k.group.rotation.y = range(this.random, -0.4, 0.4);
    k.group.visible = true;
    k.blob.position.set(k.x, 0.24, k.z);
    k.blob.visible = true;
    k.ring.position.set(k.x, 0.26, k.z);
    k.ring.visible = true;
  }

  spawnSpill(turkey) {
    const s = this.spills.find((s2) => !s2.mesh.visible);
    if (!s) return;
    s.x = range(this.random, -this.level.laneHalf + 2, this.level.laneHalf - 2);
    s.z = turkey.z - range(this.random, 55, 75);
    s.r = range(this.random, 2.6, 3.8);
    s.used = false;
    s.mesh.scale.set(s.r, s.r * range(this.random, 0.6, 0.85), 1);
    s.mesh.position.set(s.x, 0.21, s.z);
    s.mesh.visible = true;
  }

  spawnPlate(turkey) {
    const p = this.plates.find((p2) => !p2.active);
    if (!p) return;
    p.x = range(this.random, -this.level.laneHalf + 3.4, this.level.laneHalf - 3.4);
    p.z = turkey.z - range(this.random, 60, 85);
    p.vx = 0;
    p.active = true;
    p.group.position.set(p.x, 0.1, p.z);
    p.group.visible = true;
  }

  spawnFlare(turkey) {
    const fl = this.flares.find((f2) => f2.phase === 'idle');
    if (!fl) return;
    fl.x = THREE.MathUtils.clamp(turkey.x + range(this.random, -6, 6), -this.level.laneHalf + 2, this.level.laneHalf - 2);
    fl.z = turkey.z - range(this.random, 26, 34);
    fl.phase = 'telegraph';
    fl.t = 0;
    fl.hitDone = false;
    fl.group.position.set(fl.x, 0, fl.z);
    fl.group.visible = true;
    fl.ring.position.set(fl.x, 0.26, fl.z);
    fl.ring.visible = true;
  }

  spawnCorn(turkey) {
    const x = range(this.random, -this.level.laneHalf + 1.5, this.level.laneHalf - 1.5);
    const z0 = turkey.z - range(this.random, 45, 60);
    const arc = this.random() < 0.4;
    let placed = 0;
    for (const c of this.corns) {
      if (placed >= 5) break;
      if (c.active) continue;
      c.x = arc ? x + Math.sin(placed * 0.9) * 1.6 : x;
      c.z = z0 - placed * 2.4;
      c.active = true;
      c.mesh.position.set(c.x, 0.85, c.z);
      c.mesh.visible = true;
      placed++;
    }
  }

  spawnBurst(x, y, z) {
    const b = this.bursts.find((b2) => !b2.active);
    if (!b) return;
    b.t = 0;
    b.active = true;
    b.group.position.set(x, y, z);
    b.group.visible = true;
    for (const bit of b.bits) {
      bit.mesh.position.set(0, 0, 0);
      bit.mesh.scale.setScalar(1);
      bit.vx = range(this.random, -2.6, 2.6);
      bit.vy = range(this.random, 2.5, 6);
      bit.vz = range(this.random, -2.6, 2.6);
    }
  }

  startFork(turkey) {
    const f = this.fork;
    f.side = this.random() < 0.5 ? -1 : 1;
    f.z = turkey.z - 19;
    f.phase = 'telegraph';
    f.t = 0;
    f.hitDone = false;
    f.group.position.set(f.side * (this.level.halfWidth + 13), 0.55, f.z);
    f.group.rotation.y = f.side > 0 ? Math.PI : 0;
    f.group.visible = true;
  }

  startGrabber(g, turkey) {
    g.x = THREE.MathUtils.clamp(turkey.x + range(this.random, -2.5, 2.5), -this.level.laneHalf + 3, this.level.laneHalf - 3);
    g.z = turkey.z - 7;
    g.phase = 'telegraph';
    g.t = 0;
    g.hitDone = false;
    g.group.position.set(g.x, 30, g.z);
    g.group.visible = true;
    setGrab(g, 0);
    g.blob.position.set(g.x, 0.24, g.z);
    g.blob.visible = true;
  }

  updateGrabber(g, dt, turkey, events) {
    if (g.phase === 'telegraph') {
      g.t += dt;
      const p = Math.min(1, g.t / g.telegraphSecs);
      g.group.position.y = 30 - p * 17;
      g.blob.scale.setScalar(0.5 + p * 0.5);
      g.blob.material.opacity = 0.25 + p * 0.25;
      if (g.t === dt) events.push({ type: 'warn', kind: g.kind });
      if (p >= 1) { g.phase = 'slam'; g.t = 0; events.push({ type: 'slam', kind: g.kind }); }
    } else if (g.phase === 'slam') {
      g.t += dt;
      const p = Math.min(1, g.t / 0.16);
      g.group.position.y = 13 - p * 10.6;
      setGrab(g, p);
      if (p >= 1 && !g.hitDone) {
        g.hitDone = true;
        const inX = Math.abs(turkey.x - g.x) < g.radiusX;
        const inZ = Math.abs(turkey.z - g.z) < g.radiusZ;
        if (inX && inZ && turkey.y < g.hitY) events.push({ type: 'hit', kind: g.kind });
        else if (inX && inZ) events.push({ type: 'nearMiss', kind: g.kind });
      }
      if (g.t > 0.5) { g.phase = 'rise'; g.t = 0; }
    } else if (g.phase === 'rise') {
      g.t += dt;
      g.group.position.y += dt * 20;
      setGrab(g, Math.max(0, 1 - g.t * 2));
      if (g.group.position.y > 34) { g.phase = 'idle'; g.group.visible = false; g.blob.visible = false; }
    }
  }

  update(dt, turkey, distance) {
    const events = [];
    const r = this.random;
    const hz = this.level.hazards;
    const laneHalf = this.level.laneHalf;

    // --- spawns, driven by distance travelled -------------------------------
    if (hz.knife && distance >= this.nextKnifeAt) { this.spawnKnife(turkey); this.nextKnifeAt = distance + this.knifeGap(distance); }
    if (distance >= this.nextSpillAt) { this.spawnSpill(turkey); this.nextSpillAt = distance + range(r, 30, 52); }
    if (hz.plates && distance >= this.nextPlateAt) { this.spawnPlate(turkey); this.nextPlateAt = distance + range(r, 55, 85); }
    if (hz.flares && distance >= this.nextFlareAt) { this.spawnFlare(turkey); this.nextFlareAt = distance + this.flareGap(distance); }
    if (distance >= this.nextCornAt) { this.spawnCorn(turkey); this.nextCornAt = distance + range(r, 16, 28); }
    if (hz.fork) {
      this.forkTimer -= dt;
      if (this.forkTimer <= 0 && distance > 40) { this.startFork(turkey); this.forkTimer = HAZARDS.forkEverySecs * range(r, 0.8, 1.25); }
    }
    if (hz.hand) {
      this.handTimer -= dt;
      const every = HAZARDS.handEverySecs * (this.level.id === 'floor' ? HAZARDS.handFloorFactor : 1);
      if (this.handTimer <= 0 && distance > 70) { this.startGrabber(this.hand, turkey); this.handTimer = every * range(r, 0.85, 1.2); }
    }
    if (hz.paw) {
      this.pawTimer -= dt;
      if (this.pawTimer <= 0 && distance > 30) { this.startGrabber(this.paw, turkey); this.pawTimer = HAZARDS.pawEverySecs * range(r, 0.85, 1.2); }
    }

    // --- knives ---------------------------------------------------------------
    for (const k of this.knives) {
      if (k.phase === 'idle') continue;
      k.t += dt;
      if (k.phase === 'telegraph') {
        const f = Math.min(1, k.t / HAZARDS.knifeTelegraphSecs);
        k.blob.scale.setScalar(0.35 + f * 0.65);
        k.ring.material.opacity = 0.45 + Math.sin(k.t * 18) * 0.3;
        k.group.position.y = 20.5 - f * 1.8;
        k.group.rotation.z = Math.sin(k.t * 30) * 0.02;
        if (k.t === dt) events.push({ type: 'warn', kind: 'knife' });
        if (f >= 1) { k.phase = 'plunge'; k.t = 0; }
      } else if (k.phase === 'plunge') {
        const f = Math.min(1, k.t / HAZARDS.knifePlungeSecs);
        k.group.position.y = 18.7 - f * 7.8;
        if (f >= 1) {
          k.phase = 'rest'; k.t = 0;
          k.blob.visible = false; k.ring.visible = false;
          events.push({ type: 'slam', kind: 'knife' });
          const d = Math.hypot(turkey.x - k.x, turkey.z - k.z);
          if (d < HAZARDS.knifeRadius + 0.45 && turkey.y < 2.4) {
            events.push({ type: 'hit', kind: 'knife' });
            k.scored = true;
          } else if (d < SCORING.nearMissRange && !k.scored) {
            events.push({ type: 'nearMiss', kind: 'knife' });
            k.scored = true;
          }
        }
      } else if (k.phase === 'rest') {
        if (k.t > HAZARDS.knifeRestSecs) { k.phase = 'rise'; k.t = 0; }
      } else if (k.phase === 'rise') {
        k.group.position.y += dt * 16;
        if (k.group.position.y > 28 || k.z > turkey.z + 16) {
          k.phase = 'idle'; k.group.visible = false;
        }
      }
      if (k.z > turkey.z + 20 && k.phase !== 'idle') {
        k.phase = 'idle'; k.group.visible = false; k.blob.visible = false; k.ring.visible = false;
      }
    }

    // --- fork -------------------------------------------------------------------
    const f = this.fork;
    if (f.phase === 'telegraph') {
      f.t += dt;
      f.group.position.x = f.side * (this.level.halfWidth + 13 - Math.min(1, f.t / HAZARDS.forkTelegraphSecs) * 3.5);
      if (f.t === dt) events.push({ type: 'warn', kind: 'fork' });
      if (f.t >= HAZARDS.forkTelegraphSecs) { f.phase = 'sweep'; f.t = 0; events.push({ type: 'slam', kind: 'fork' }); }
    } else if (f.phase === 'sweep') {
      f.t += dt;
      const p = Math.min(1, f.t / HAZARDS.forkSweepSecs);
      f.group.position.x = f.side * (this.level.halfWidth + 9.5) - f.side * p * (this.level.halfWidth * 2 + 19);
      if (!f.hitDone && Math.abs(turkey.z - f.z) < HAZARDS.forkBand && turkey.y < 1.7) {
        events.push({ type: 'hit', kind: 'fork' });
        f.hitDone = true;
      }
      if (p >= 1) { f.phase = 'idle'; f.group.visible = false; }
    }

    // --- the farmer's hand and the cat's paw ---------------------------------------
    this.updateGrabber(this.hand, dt, turkey, events);
    this.updateGrabber(this.paw, dt, turkey, events);

    // --- burner flares ----------------------------------------------------------------
    for (const fl of this.flares) {
      if (fl.phase === 'idle') continue;
      fl.t += dt;
      if (fl.phase === 'telegraph') {
        const p = Math.min(1, fl.t / HAZARDS.flareTelegraphSecs);
        // The grate heats through the colours: deep red, then orange, then fierce yellow.
        fl.glowMat.color.setHSL(0.045 - 0.02 * (1 - p), 1, 0.08 + p * 0.3);
        fl.ring.material.opacity = 0.45 + Math.sin(fl.t * 18) * 0.3;
        if (fl.t === dt) events.push({ type: 'warn', kind: 'flare' });
        if (p >= 1) {
          fl.phase = 'active'; fl.t = 0;
          fl.ring.visible = false;
          fl.flame.visible = true; fl.core.visible = true;
          for (const puff of fl.puffs) { puff.visible = true; puff.material.opacity = 0; }
          events.push({ type: 'slam', kind: 'flare' });
          const d = Math.hypot(turkey.x - fl.x, turkey.z - fl.z);
          if (d < HAZARDS.flareRadius + 0.45 && turkey.y < 2.6) {
            events.push({ type: 'hit', kind: 'flare' });
            fl.hitDone = true;
          }
        }
      } else if (fl.phase === 'active') {
        const p = Math.min(1, fl.t / HAZARDS.flareActiveSecs);
        // White-hot at the peak of the flare, settling back to yellow as it dies.
        const heat = Math.sin(Math.min(1, p * 1.15) * Math.PI);
        fl.flameMat.color.setHSL(0.13 - heat * 0.045, 1, 0.55 + heat * 0.28);
        fl.coreMat.color.setHSL(0.12, 0.9, 0.75 + heat * 0.2);
        const s = 0.7 + heat * 0.5 + Math.sin(fl.t * 31) * 0.06;
        fl.flame.scale.set(s, 0.75 + heat * 0.45, s);
        fl.core.scale.set(s, 0.8 + heat * 0.3, s);
        fl.glowMat.color.setHSL(0.05, 1, 0.3 + heat * 0.12);
        for (let i = 0; i < fl.puffs.length; i++) {
          const puff = fl.puffs[i];
          const pp = ((fl.t * 0.9 + i / fl.puffs.length) % 1);
          puff.position.set(Math.sin(i * 2.4) * 0.7, 3.6 + pp * 4.4, Math.cos(i * 1.9) * 0.7);
          puff.scale.setScalar(0.6 + pp * 1.7);
          puff.material.opacity = 0.34 * (1 - pp) * Math.min(1, p * 3);
        }
        if (p >= 1) { fl.phase = 'cool'; fl.t = 0; fl.flame.visible = false; fl.core.visible = false; }
      } else if (fl.phase === 'cool') {
        fl.glowMat.color.lerp(new THREE.Color(0x2a0800), Math.min(1, dt * 3));
        for (const puff of fl.puffs) puff.visible = false;
        if (fl.t > 0.8 || fl.z > turkey.z + 16) { fl.phase = 'idle'; fl.group.visible = false; }
      }
      if (fl.z > turkey.z + 20 && fl.phase !== 'idle') {
        fl.phase = 'idle'; fl.group.visible = false; fl.ring.visible = false;
      }
    }

    // --- spills -----------------------------------------------------------------------
    for (const s of this.spills) {
      if (!s.mesh.visible) continue;
      if (s.z > turkey.z + 14) { s.mesh.visible = false; continue; }
      if (!s.used && turkey.y < 0.5) {
        const d = Math.hypot((turkey.x - s.x) / s.r, (turkey.z - s.z) / (s.r * 0.75));
        if (d < 0.85) { s.used = true; events.push({ type: 'spill', skin: hz.spill }); }
      }
    }

    // --- lane plates -------------------------------------------------------------------
    for (const p of this.plates) {
      if (!p.active) continue;
      if (p.vx !== 0) {
        p.x += p.vx * dt;
        p.group.position.x = p.x;
        if (Math.abs(p.x) > this.level.halfWidth + 5) { p.active = false; p.group.visible = false; }
        continue;
      }
      if (p.z > turkey.z + 14) { p.active = false; p.group.visible = false; continue; }
      const d = Math.hypot(turkey.x - p.x, turkey.z - p.z);
      if (d < HAZARDS.plateRadius + 0.55 && turkey.y < 1.6) {
        events.push({ type: 'hit', kind: 'plate' });
        p.vx = turkey.x < p.x ? 14 : -14; // the plate goes clattering away from the turkey
      }
    }

    // --- static obstacles: the giant legs on the kitchen floor ---------------------------
    for (const s of this.statics) {
      const dz = turkey.z - s.z;
      if (Math.abs(dz) > s.r + 1.4) continue;
      const d = Math.hypot(turkey.x - s.x, dz);
      if (d < s.r + 0.55 && turkey.y < 3.4 && distance - s.lastHitDist > 8) {
        s.lastHitDist = distance;
        events.push({ type: 'hit', kind: 'leg' });
        events.push({ type: 'bump', dx: turkey.x < s.x ? -1.7 : 1.7 });
      }
    }

    // --- corn crumbs ---------------------------------------------------------------------
    for (const c of this.corns) {
      if (!c.active) continue;
      c.mesh.rotation.y += dt * 2.4;
      c.mesh.position.y = 0.85 + Math.sin(c.spin + distance * 0.35) * 0.14;
      if (c.z > turkey.z + 10) { c.active = false; c.mesh.visible = false; continue; }
      const d = Math.hypot(turkey.x - c.x, turkey.z - c.z);
      if (d < 1.6 && turkey.y < 2.2) {
        c.active = false; c.mesh.visible = false;
        this.spawnBurst(c.x, 0.9, c.z);
        events.push({ type: 'corn', x: c.x, z: c.z });
      }
    }

    // --- corn bursts -----------------------------------------------------------------------
    for (const b of this.bursts) {
      if (!b.active) continue;
      b.t += dt;
      const life = 0.45;
      for (const bit of b.bits) {
        bit.vy -= 17 * dt;
        bit.mesh.position.x += bit.vx * dt;
        bit.mesh.position.y += bit.vy * dt;
        bit.mesh.position.z += bit.vz * dt;
        bit.mesh.rotation.x += dt * 9;
        bit.mesh.rotation.y += dt * 7;
        bit.mesh.scale.setScalar(Math.max(0.01, 1 - b.t / life));
      }
      if (b.t >= life) { b.active = false; b.group.visible = false; }
    }

    return events;
  }
}
