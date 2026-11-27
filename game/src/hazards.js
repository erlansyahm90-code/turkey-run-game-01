// Dinner Table Dash — hazards and pickups. Owns everything that can hurt or reward the
// turkey: the carving knife that plunges where its shadow grows, the fork that sweeps the
// table low, gravy spills that slow the run, serving plates left in the lanes, the farmer's
// grabbing hand, and the corn crumbs worth points. Update returns events; main.js decides
// what they cost. Every hazard telegraphs first — a narrow escape is always fair.

import * as THREE from 'three';
import { TABLE, HAZARDS, SCORING } from './config.js';
import { buildHand, setGrab } from './farmer.js';
import { range } from './random.js';

const STEEL = new THREE.MeshStandardMaterial({ color: 0xe9eef4, roughness: 0.26, metalness: 0.72 });
const STEEL_DARK = new THREE.MeshStandardMaterial({ color: 0x8f979e, roughness: 0.35, metalness: 0.85 });
const HANDLE = new THREE.MeshStandardMaterial({ color: 0x2e1c10, roughness: 0.7 });
const GRAVY = new THREE.MeshStandardMaterial({ color: 0x7a4a21, roughness: 0.12 });
const CORN = new THREE.MeshStandardMaterial({ color: 0xf6c945, roughness: 0.4, emissive: 0x8a6400, emissiveIntensity: 0.9 });
const CERAMIC = new THREE.MeshStandardMaterial({ color: 0xf6efe2, roughness: 0.35 });

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

export class Hazards {
  constructor(scene, random) {
    this.scene = scene;
    this.random = random;
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
    const handParts = buildHand();
    this.hand = { ...handParts, phase: 'idle', t: 0, x: 0, z: 0, blob: shadowBlob(7.4, 0.4), hitDone: false };
    this.hand.blob.visible = false;
    scene.add(this.hand.group);
    scene.add(this.hand.blob);
    this.spills = [];
    for (let i = 0; i < 6; i++) {
      const spill = new THREE.Mesh(new THREE.CircleGeometry(1, 22), GRAVY);
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
    this.corns = [];
    const cornGeo = new THREE.IcosahedronGeometry(0.56, 0);
    for (let i = 0; i < 30; i++) {
      const kernel = new THREE.Mesh(cornGeo, CORN);
      kernel.visible = false;
      kernel.castShadow = true;
      scene.add(kernel);
      this.corns.push({ mesh: kernel, active: false, x: 0, z: 0, spin: range(random, 0, 6) });
    }
    this.reset();
  }

  reset() {
    for (const k of this.knives) { k.phase = 'idle'; k.group.visible = false; k.blob.visible = false; k.ring.visible = false; }
    this.fork.phase = 'idle'; this.fork.group.visible = false; this.forkTimer = HAZARDS.forkEverySecs * 0.7;
    this.hand.phase = 'idle'; this.hand.group.visible = false; this.hand.blob.visible = false;
    this.handTimer = HAZARDS.handEverySecs * 0.8;
    for (const s of this.spills) { s.mesh.visible = false; s.used = false; }
    for (const p of this.plates) { p.active = false; p.group.visible = false; }
    for (const c of this.corns) { c.active = false; c.mesh.visible = false; }
    this.nextKnifeAt = HAZARDS.knifeFirstAt;
    this.nextSpillAt = 34;
    this.nextPlateAt = 55;
    this.nextCornAt = 14;
  }

  knifeGap(distance) {
    const f = Math.min(1, distance / TABLE.length);
    return HAZARDS.knifeGapStart + (HAZARDS.knifeGapEnd - HAZARDS.knifeGapStart) * f;
  }

  spawnKnife(turkey) {
    const k = this.knives.find((k2) => k2.phase === 'idle');
    if (!k) return;
    k.x = THREE.MathUtils.clamp(turkey.x + range(this.random, -6.5, 6.5), -TABLE.laneHalf, TABLE.laneHalf);
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

  spawnSpill(distance, turkey) {
    const s = this.spills.find((s2) => !s2.mesh.visible);
    if (!s) return;
    s.x = range(this.random, -TABLE.laneHalf + 2, TABLE.laneHalf - 2);
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
    p.x = range(this.random, -TABLE.laneHalf + 3.4, TABLE.laneHalf - 3.4);
    p.z = turkey.z - range(this.random, 60, 85);
    p.vx = 0;
    p.active = true;
    p.group.position.set(p.x, 0.1, p.z);
    p.group.visible = true;
  }

  spawnCorn(turkey) {
    const x = range(this.random, -TABLE.laneHalf + 1.5, TABLE.laneHalf - 1.5);
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

  startFork(turkey) {
    const f = this.fork;
    f.side = this.random() < 0.5 ? -1 : 1;
    f.z = turkey.z - 19;
    f.phase = 'telegraph';
    f.t = 0;
    f.hitDone = false;
    f.group.position.set(f.side * (TABLE.halfWidth + 13), 0.55, f.z);
    f.group.rotation.y = f.side > 0 ? Math.PI : 0;
    f.group.visible = true;
  }

  startHand(turkey) {
    const h = this.hand;
    h.x = THREE.MathUtils.clamp(turkey.x + range(this.random, -2.5, 2.5), -TABLE.laneHalf + 3, TABLE.laneHalf - 3);
    h.z = turkey.z - 7;
    h.phase = 'telegraph';
    h.t = 0;
    h.hitDone = false;
    h.group.position.set(h.x, 30, h.z);
    h.group.visible = true;
    setGrab(h, 0);
    h.blob.position.set(h.x, 0.24, h.z);
    h.blob.visible = true;
  }

  update(dt, turkey, distance) {
    const events = [];
    const r = this.random;

    // --- spawns, driven by distance travelled -------------------------------
    if (distance >= this.nextKnifeAt) { this.spawnKnife(turkey); this.nextKnifeAt = distance + this.knifeGap(distance); }
    if (distance >= this.nextSpillAt) { this.spawnSpill(distance, turkey); this.nextSpillAt = distance + range(r, 30, 52); }
    if (distance >= this.nextPlateAt) { this.spawnPlate(turkey); this.nextPlateAt = distance + range(r, 55, 85); }
    if (distance >= this.nextCornAt) { this.spawnCorn(turkey); this.nextCornAt = distance + range(r, 16, 28); }
    this.forkTimer -= dt;
    if (this.forkTimer <= 0 && distance > 40) { this.startFork(turkey); this.forkTimer = HAZARDS.forkEverySecs * range(r, 0.8, 1.25); }
    this.handTimer -= dt;
    if (this.handTimer <= 0 && distance > 70) { this.startHand(turkey); this.handTimer = HAZARDS.handEverySecs * range(r, 0.85, 1.2); }

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
      f.group.position.x = f.side * (TABLE.halfWidth + 13 - Math.min(1, f.t / HAZARDS.forkTelegraphSecs) * 3.5);
      if (f.t === dt) events.push({ type: 'warn', kind: 'fork' });
      if (f.t >= HAZARDS.forkTelegraphSecs) { f.phase = 'sweep'; f.t = 0; events.push({ type: 'slam', kind: 'fork' }); }
    } else if (f.phase === 'sweep') {
      f.t += dt;
      const p = Math.min(1, f.t / HAZARDS.forkSweepSecs);
      f.group.position.x = f.side * (TABLE.halfWidth + 9.5) - f.side * p * (TABLE.halfWidth * 2 + 19);
      if (!f.hitDone && Math.abs(turkey.z - f.z) < HAZARDS.forkBand && turkey.y < 1.7) {
        events.push({ type: 'hit', kind: 'fork' });
        f.hitDone = true;
      }
      if (p >= 1) { f.phase = 'idle'; f.group.visible = false; }
    }

    // --- the farmer's hand --------------------------------------------------------
    const h = this.hand;
    if (h.phase === 'telegraph') {
      h.t += dt;
      const p = Math.min(1, h.t / HAZARDS.handTelegraphSecs);
      h.group.position.y = 30 - p * 17;
      h.blob.scale.setScalar(0.5 + p * 0.5);
      h.blob.material.opacity = 0.25 + p * 0.25;
      if (h.t === dt) events.push({ type: 'warn', kind: 'hand' });
      if (p >= 1) { h.phase = 'slam'; h.t = 0; events.push({ type: 'slam', kind: 'hand' }); }
    } else if (h.phase === 'slam') {
      h.t += dt;
      const p = Math.min(1, h.t / 0.16);
      h.group.position.y = 13 - p * 10.6;
      setGrab(h, p);
      if (p >= 1 && !h.hitDone) {
        h.hitDone = true;
        const inX = Math.abs(turkey.x - h.x) < HAZARDS.handRadiusX;
        const inZ = Math.abs(turkey.z - h.z) < HAZARDS.handRadiusZ;
        if (inX && inZ && turkey.y < 2.8) events.push({ type: 'hit', kind: 'hand' });
        else if (inX && inZ) events.push({ type: 'nearMiss', kind: 'hand' });
      }
      if (h.t > 0.5) { h.phase = 'rise'; h.t = 0; }
    } else if (h.phase === 'rise') {
      h.t += dt;
      h.group.position.y += dt * 20;
      setGrab(h, Math.max(0, 1 - h.t * 2));
      if (h.group.position.y > 34) { h.phase = 'idle'; h.group.visible = false; h.blob.visible = false; }
    }

    // --- gravy spills ---------------------------------------------------------------
    for (const s of this.spills) {
      if (!s.mesh.visible) continue;
      if (s.z > turkey.z + 14) { s.mesh.visible = false; continue; }
      if (!s.used && turkey.y < 0.5) {
        const d = Math.hypot((turkey.x - s.x) / s.r, (turkey.z - s.z) / (s.r * 0.75));
        if (d < 0.85) { s.used = true; events.push({ type: 'gravy' }); }
      }
    }

    // --- lane plates -------------------------------------------------------------------
    for (const p of this.plates) {
      if (!p.active) continue;
      if (p.vx !== 0) {
        p.x += p.vx * dt;
        p.group.position.x = p.x;
        if (Math.abs(p.x) > TABLE.halfWidth + 5) { p.active = false; p.group.visible = false; }
        continue;
      }
      if (p.z > turkey.z + 14) { p.active = false; p.group.visible = false; continue; }
      const d = Math.hypot(turkey.x - p.x, turkey.z - p.z);
      if (d < HAZARDS.plateRadius + 0.55 && turkey.y < 1.6) {
        events.push({ type: 'hit', kind: 'plate' });
        p.vx = turkey.x < p.x ? 14 : -14; // the plate goes clattering away from the turkey
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
        events.push({ type: 'corn' });
      }
    }

    return events;
  }
}
