// Dinner Table Dash — the turkey. A proud bird built from primitives: round body, fanned
// tail, long neck, wattle, wings that flap on a jump and legs that scissor as it runs.
// Faces -Z (the far end of the table). The group origin sits on the tabletop under the body.

import * as THREE from 'three';

const FEATHER = new THREE.MeshStandardMaterial({ color: 0x8f5c2e, roughness: 0.85 });
const FEATHER_DARK = new THREE.MeshStandardMaterial({ color: 0x4e2c14, roughness: 0.9 });
const FEATHER_TIP = new THREE.MeshStandardMaterial({ color: 0xe8dcc4, roughness: 0.8 });
const SKIN = new THREE.MeshStandardMaterial({ color: 0x9db8c6, roughness: 0.6 });
const BEAK = new THREE.MeshStandardMaterial({ color: 0xf2a007, roughness: 0.5 });
const WATTLE = new THREE.MeshStandardMaterial({ color: 0xc22e2e, roughness: 0.55 });
const LEG = new THREE.MeshStandardMaterial({ color: 0xd98a2b, roughness: 0.7 });
const EYE = new THREE.MeshStandardMaterial({ color: 0x140b06, roughness: 0.3 });

function buildTailFan() {
  const fan = new THREE.Group();
  const angles = [-0.85, -0.45, 0, 0.45, 0.85];
  for (const a of angles) {
    const feather = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.9, 0.16), FEATHER_DARK);
    shaft.position.y = 1.45;
    feather.add(shaft);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 0.18), FEATHER_TIP);
    tip.position.y = 2.75;
    feather.add(tip);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.5, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x2e5e8c, roughness: 0.7 }));
    band.position.y = 2.25;
    feather.add(band);
    feather.rotation.x = -0.5;
    feather.rotation.y = a;
    feather.rotation.z = a * 0.55;
    fan.add(feather);
  }
  return fan;
}

export function buildTurkey() {
  const bird = new THREE.Group();

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.15, 20, 16), FEATHER);
  body.scale.set(1, 0.92, 1.3);
  body.position.y = 1.35;
  body.castShadow = true;
  bird.add(body);

  const breast = new THREE.Mesh(new THREE.SphereGeometry(0.92, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x96683c, roughness: 0.85 }));
  breast.scale.set(0.95, 0.9, 0.9);
  breast.position.set(0, 1.25, -0.62);
  breast.castShadow = true;
  bird.add(breast);

  const tail = buildTailFan();
  tail.scale.setScalar(0.92);
  tail.position.set(0, 1.15, 1.35);
  bird.add(tail);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.38, 1.5, 10), SKIN);
  neck.position.set(0, 2.35, -1.15);
  neck.rotation.x = 0.35;
  neck.castShadow = true;
  bird.add(neck);

  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 12), SKIN);
  skull.castShadow = true;
  head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.62, 8), BEAK);
  beak.rotation.x = -Math.PI / 2;
  beak.position.set(0, -0.02, -0.66);
  head.add(beak);
  const wattle = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), WATTLE);
  wattle.scale.set(0.7, 1.7, 0.7);
  wattle.position.set(0, -0.42, -0.42);
  head.add(wattle);
  const snood = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.55, 6), WATTLE);
  snood.rotation.x = 0.7;
  snood.position.set(0, 0.18, -0.5);
  head.add(snood);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), EYE);
    eye.position.set(sx * 0.34, 0.14, -0.38);
    head.add(eye);
  }
  head.position.set(0, 3.2, -1.5);
  bird.add(head);

  const wings = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 1.7), FEATHER_DARK);
    wing.position.set(sx * 0.22, -0.5, 0.15);
    wing.castShadow = true;
    pivot.add(wing);
    pivot.position.set(sx * 1.05, 1.85, -0.1);
    bird.add(pivot);
    wings.push({ pivot, side: sx });
  }

  const legs = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 1.15, 6), LEG);
    leg.position.y = -0.55;
    pivot.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.62), LEG);
    foot.position.set(0, -1.12, -0.12);
    pivot.add(foot);
    pivot.position.set(sx * 0.5, 1.05, 0.15);
    bird.add(pivot);
    legs.push(pivot);
  }

  return { group: bird, wings, legs, head, tail };
}

/**
 * Pose the turkey for a frame.
 * opts: runPhase (radians of the run cycle), airborne (0..1), steer (-1..1), t (seconds),
 * stumble (0..1 — just took a hit: the bird dips, droops and wobbles as it recovers).
 */
export function animateTurkey(turkey, opts) {
  const { group, wings, legs, head, tail } = turkey;
  const run = Math.sin(opts.runPhase);
  const run2 = Math.sin(opts.runPhase + Math.PI);
  const stumble = opts.stumble ?? 0;

  group.rotation.z = -opts.steer * 0.16 + (stumble > 0 ? Math.sin(opts.t * 42) * 0.09 * stumble : 0);
  group.rotation.x = (opts.airborne > 0 ? -0.14 : Math.sin(opts.runPhase * 2) * 0.03) + stumble * 0.38;
  group.position.y = opts.baseY + (opts.airborne > 0 ? 0 : Math.abs(Math.sin(opts.runPhase)) * 0.14);

  legs[0].rotation.x = opts.airborne > 0 ? 0.55 : run * 0.85;
  legs[1].rotation.x = opts.airborne > 0 ? 0.3 : run2 * 0.85;

  const flap = opts.airborne > 0 ? Math.sin(opts.t * 26) * 0.85 - 0.3 : Math.sin(opts.runPhase) * 0.12;
  for (const w of wings) w.pivot.rotation.z = w.side * (0.15 + flap * (opts.airborne > 0 ? 1 : 0.25));

  head.rotation.x = Math.sin(opts.runPhase * 2) * 0.1 - (opts.airborne > 0 ? 0.25 : 0) + stumble * 0.55;
  head.position.z = -1.5 + Math.sin(opts.runPhase * 2) * 0.07;
  tail.rotation.x = Math.sin(opts.t * 2.2) * 0.05 - (opts.airborne > 0 ? 0.25 : 0);
}
