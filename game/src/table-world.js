// Dinner Table Dash — the world: a Thanksgiving table set for giants, seen from a turkey's
// height. Builds the tablecloth runway, the place settings along both sides, the candles,
// the oven looming at the far end and the kitchen around it. Everything is primitives and
// one procedural canvas texture (the checked cloth); no model or image files.

import * as THREE from 'three';
import { TABLE } from './config.js';
import { range } from './random.js';

const MAT = {
  ceramic: new THREE.MeshStandardMaterial({ color: 0xf6efe2, roughness: 0.35, metalness: 0.05 }),
  ceramicBlue: new THREE.MeshStandardMaterial({ color: 0x9fc2e8, roughness: 0.4, metalness: 0.05 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb9c0c7, roughness: 0.3, metalness: 0.9 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x3c4148, roughness: 0.55, metalness: 0.8 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6e4525, roughness: 0.85 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x4a2c15, roughness: 0.9 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.35, metalness: 0.7 }),
  cranberry: new THREE.MeshStandardMaterial({ color: 0x8e1f2f, roughness: 0.25 }),
  potato: new THREE.MeshStandardMaterial({ color: 0xf3e5c3, roughness: 0.9 }),
  pea: new THREE.MeshStandardMaterial({ color: 0x5d9c46, roughness: 0.6 }),
  corn: new THREE.MeshStandardMaterial({ color: 0xf6c945, roughness: 0.55 }),
  gravy: new THREE.MeshStandardMaterial({ color: 0x7a4a21, roughness: 0.15 }),
  candle: new THREE.MeshStandardMaterial({ color: 0xf7ead2, roughness: 0.6 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0xd6ecff, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.32,
    side: THREE.DoubleSide, depthWrite: false,
  }),
  wine: new THREE.MeshStandardMaterial({ color: 0x6e1423, roughness: 0.1, transparent: true, opacity: 0.75 }),
};

function checkeredClothTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const cell = 128;
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      g.fillStyle = (x + y) % 2 === 0 ? '#f3e9d4' : '#b8322a';
      g.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  g.fillStyle = 'rgba(120, 60, 20, 0.05)';
  for (let i = 0; i < 300; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 52);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makePlate(random, withFood) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 2.9, 0.5, 28), MAT.ceramic);
  base.position.y = 0.25;
  base.castShadow = true; base.receiveShadow = true;
  group.add(base);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.22, 10, 32),
    random() < 0.4 ? MAT.ceramicBlue : MAT.ceramic);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.52;
  group.add(rim);
  if (withFood) {
    const mash = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.3, 14), MAT.potato);
    mash.position.set(-0.7, 1.1, 0.4);
    mash.castShadow = true;
    group.add(mash);
    const butter = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.55), MAT.corn);
    butter.position.set(-0.7, 1.85, 0.4);
    butter.rotation.y = 0.5;
    group.add(butter);
    for (let i = 0; i < 7; i++) {
      const pea = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), MAT.pea);
      pea.position.set(range(random, 0.4, 1.9), 0.72, range(random, -1.4, 1.4));
      group.add(pea);
    }
    const slice = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.5, 16), MAT.cranberry);
    slice.position.set(1.6, 0.75, -1.1);
    group.add(slice);
  }
  return group;
}

function makeGlass(random) {
  const group = new THREE.Group();
  const points = [];
  points.push(new THREE.Vector2(0.0, 0.0));
  points.push(new THREE.Vector2(1.15, 0.06));
  points.push(new THREE.Vector2(0.28, 0.35));
  points.push(new THREE.Vector2(0.3, 2.2));
  points.push(new THREE.Vector2(1.35, 3.1));
  points.push(new THREE.Vector2(1.55, 4.6));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(points, 20), MAT.glass);
  cup.castShadow = true;
  group.add(cup);
  if (random() < 0.6) {
    const wine = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.05, 1.5, 16), MAT.wine);
    wine.position.y = 3.6;
    group.add(wine);
  }
  return group;
}

function makeCandle() {
  const group = new THREE.Group();
  const holder = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.35, 0.35, 16), MAT.gold);
  holder.position.y = 0.18;
  group.add(holder);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 3.4, 12), MAT.candle);
  stick.position.y = 2.0;
  stick.castShadow = true;
  group.add(stick);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 1.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xffb03a, emissive: 0xff8c1a, emissiveIntensity: 2.6 }),
  );
  flame.position.y = 4.35;
  flame.name = 'flame';
  group.add(flame);
  return group;
}

function makeCutlery(random) {
  // A resting fork or spoon beside a setting: handle plus a simple head, lying flat.
  const group = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 4.6), MAT.steel);
  handle.position.y = 0.1;
  group.add(handle);
  if (random() < 0.5) {
    for (let i = -1; i <= 1; i++) {
      const tine = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 1.3), MAT.steel);
      tine.position.set(i * 0.34, 0.1, -2.9);
      group.add(tine);
    }
  } else {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 8), MAT.steel);
    bowl.scale.set(1, 0.35, 1.5);
    bowl.position.set(0, 0.12, -2.9);
    group.add(bowl);
  }
  group.traverse((o) => { o.castShadow = true; });
  return group;
}

function makeServingBowl(random) {
  const group = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(3.1, 20, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
    random() < 0.5 ? MAT.ceramicBlue : MAT.ceramic);
  bowl.rotation.x = Math.PI;
  bowl.position.y = 2.6;
  bowl.castShadow = true;
  group.add(bowl);
  const fill = new THREE.Mesh(new THREE.SphereGeometry(2.75, 16, 10), MAT.cranberry);
  fill.scale.y = 0.45;
  fill.position.y = 2.45;
  group.add(fill);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.5, 14), MAT.gold);
  foot.position.y = 0.25;
  group.add(foot);
  return group;
}

function makeOven() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(34, 30, 9), MAT.darkSteel);
  body.position.y = 15;
  body.castShadow = true;
  group.add(body);
  const door = new THREE.Mesh(new THREE.BoxGeometry(24, 17, 1.2), MAT.steel);
  door.position.set(0, 13.5, 4.8);
  group.add(door);
  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(17, 10),
    new THREE.MeshStandardMaterial({ color: 0xff7a26, emissive: 0xff6a00, emissiveIntensity: 1.7 }),
  );
  windowGlow.position.set(0, 13.5, 5.45);
  windowGlow.name = 'ovenGlow';
  group.add(windowGlow);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 22, 10), MAT.steel);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, 23.6, 5.6);
  group.add(handle);
  for (let i = 0; i < 4; i++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 12), MAT.darkSteel);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-11 + i * 7.3, 27.4, 5.2);
    group.add(knob);
  }
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 26, 12), MAT.darkSteel);
  pipe.position.set(-11, 42, 0);
  group.add(pipe);
  const light = new THREE.PointLight(0xff8c3a, 900, 130, 1.9);
  light.position.set(0, 14, 16);
  group.add(light);
  return group;
}

export function buildTableWorld(scene, random, GEOM = { edgeZ: -186, floorY: -34, halfWidth: 12.5 }) {
  const group = new THREE.Group();
  scene.add(group);
  scene.background = new THREE.Color(0x1a0d06);
  scene.fog = new THREE.Fog(0x1a0d06, 70, 265);

  const hemi = new THREE.HemisphereLight(0xffd9a6, 0x40200e, 0.8);
  group.add(hemi);
  const fill = new THREE.DirectionalLight(0xffc9a0, 0.55);
  fill.position.set(-14, 20, 30);
  group.add(fill);
  const key = new THREE.DirectionalLight(0xffe3b3, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -34; key.shadow.camera.right = 34;
  key.shadow.camera.top = 34; key.shadow.camera.bottom = -34;
  key.shadow.camera.near = 1; key.shadow.camera.far = 130;
  key.shadow.bias = -0.0006;
  group.add(key);
  group.add(key.target);

  // ---- The room: floor far below, wall far behind -------------------------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 420),
    new THREE.MeshStandardMaterial({ color: 0x54331a, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, GEOM.floorY, GEOM.edgeZ + 100);
  floor.receiveShadow = true;
  group.add(floor);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(46, 30),
    new THREE.MeshStandardMaterial({ color: 0x7e2f24, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, GEOM.floorY + 0.06, GEOM.edgeZ - 16);
  group.add(rug);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(420, 190),
    new THREE.MeshStandardMaterial({ color: 0x38220f, roughness: 1 }));
  wall.position.set(0, 40, GEOM.edgeZ - 58);
  group.add(wall);
  // The back door, ajar, spilling warm light: the way out, past the oven.
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(15, 30),
    new THREE.MeshStandardMaterial({ color: 0xffca7a, emissive: 0xffb85c, emissiveIntensity: 1.5 }));
  doorGlow.position.set(34, GEOM.floorY + 15, GEOM.edgeZ - 56);
  group.add(doorGlow);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(18, 33, 1.5), MAT.woodDark);
  doorFrame.position.set(34, GEOM.floorY + 16.5, GEOM.edgeZ - 57.5);
  group.add(doorFrame);

  // ---- The table -----------------------------------------------------------
  const tableGroup = new THREE.Group();
  const topNear = 16;
  const topFar = GEOM.edgeZ - 4;
  const topLen = topNear - topFar;
  const top = new THREE.Mesh(new THREE.BoxGeometry(GEOM.halfWidth * 2 + 3, 2.4, topLen), MAT.wood);
  top.position.set(0, -1.55, (topNear + topFar) / 2);
  top.castShadow = true; top.receiveShadow = true;
  tableGroup.add(top);
  const cloth = new THREE.Mesh(
    new THREE.BoxGeometry(GEOM.halfWidth * 2 + 1.6, 0.5, topLen + 1),
    new THREE.MeshStandardMaterial({ map: checkeredClothTexture(), roughness: 0.9 }),
  );
  cloth.position.set(0, -0.12, (topNear + topFar) / 2);
  cloth.receiveShadow = true;
  tableGroup.add(cloth);
  const runner = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.14, topLen),
    new THREE.MeshStandardMaterial({ color: 0xc98f2d, roughness: 0.8 }));
  runner.position.set(0, 0.16, (topNear + topFar) / 2);
  runner.receiveShadow = true;
  tableGroup.add(runner);
  for (const sx of [-1, 1]) {
    for (const sz of [0, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(3.4, -GEOM.floorY, 3.4), MAT.woodDark);
      leg.position.set(sx * (GEOM.halfWidth - 1.5), GEOM.floorY / 2 - 1, sz === 0 ? 8 : GEOM.edgeZ + 8);
      tableGroup.add(leg);
    }
  }
  group.add(tableGroup);

  // ---- Place settings down both sides --------------------------------------
  const flames = [];
  const candleLights = [];
  for (let z = -16; z > GEOM.edgeZ + 12; z -= 13.5) {
    for (const side of [-1, 1]) {
      if (random() < 0.16) continue; // an empty chair here and there
      const x = side * range(random, 9.6, 11.4);
      const setting = new THREE.Group();
      const plate = makePlate(random, random() < 0.75);
      setting.add(plate);
      if (random() < 0.7) {
        const glass = makeGlass(random);
        glass.position.set(side * -2.8, 0, -2.6);
        setting.add(glass);
      }
      if (random() < 0.55) {
        const cutlery = makeCutlery(random);
        cutlery.position.set(side * 4.4, 0, 0.4);
        cutlery.rotation.y = range(random, -0.2, 0.2);
        setting.add(cutlery);
      }
      setting.position.set(x, 0.1, z + range(random, -1.6, 1.6));
      setting.rotation.y = range(random, -0.35, 0.35) + (side < 0 ? 0 : Math.PI);
      group.add(setting);
    }
    if (random() < 0.4) {
      const bowl = makeServingBowl(random);
      bowl.position.set((random() < 0.5 ? -1 : 1) * range(random, 9.8, 11.2), 0.1, z - 6);
      group.add(bowl);
    }
    if (random() < 0.34) {
      const candle = makeCandle();
      candle.position.set((random() < 0.5 ? -1 : 1) * range(random, 5.4, 6.8), 0.1, z - 3);
      group.add(candle);
      flames.push(candle.getObjectByName('flame'));
      if (candleLights.length < 3) {
        const pl = new THREE.PointLight(0xffa64d, 60, 42, 1.8);
        pl.position.copy(candle.position).y += 5;
        group.add(pl);
        candleLights.push(pl);
      }
    }
  }

  // ---- The oven at the far end ---------------------------------------------
  const oven = makeOven();
  oven.position.set(-4, 0, GEOM.edgeZ - 42);
  group.add(oven);
  const ovenGlow = oven.getObjectByName('ovenGlow');

  // ---- Dust motes drifting in the warm light --------------------------------
  const moteCount = 240;
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = range(random, -16, 16);
    motePos[i * 3 + 1] = range(random, 0.5, 17);
    motePos[i * 3 + 2] = range(random, GEOM.edgeZ - 84, 10);
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
    color: 0xffd9a0, size: 0.28, transparent: true, opacity: 0.55, depthWrite: false,
  }));
  group.add(motes);

  let flickerT = 0;
  return {
    group,
    keyLight: key,
    update(dt, t) {
      flickerT += dt;
      for (let i = 0; i < flames.length; i++) {
        const f = flames[i];
        if (!f) continue;
        const s = 1 + Math.sin(flickerT * 11 + i * 1.7) * 0.16 + Math.sin(flickerT * 23 + i) * 0.07;
        f.scale.set(s, 1 + Math.sin(flickerT * 17 + i * 2.3) * 0.2, s);
      }
      for (let i = 0; i < candleLights.length; i++) {
        candleLights[i].intensity = 55 + Math.sin(flickerT * 13 + i * 2.1) * 12;
      }
      if (ovenGlow) ovenGlow.material.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 0.18 + Math.sin(t * 7.7) * 0.07;
      motes.rotation.y = Math.sin(t * 0.05) * 0.01;
      motes.position.y = Math.sin(t * 0.3) * 0.4;
    },
  };
}

// ============================================================================
// Level 2 — the kitchen floor, far below the table. Same local frame (surface
// y = 0, run toward -Z): giant tiles, the table looming overhead, its legs and
// the chairs' legs as obstacles in the lanes, and a stack of cookbooks at the
// far end — the way back up. Returns its static obstacles for collision.
// ============================================================================

function kitchenTileTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const cell = 128;
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      g.fillStyle = (x + y) % 2 === 0 ? '#d8c6a4' : '#8f979c';
      g.fillRect(x * cell, y * cell, cell, cell);
      g.fillStyle = 'rgba(70, 40, 15, 0.16)';
      for (let i = 0; i < 160; i++) g.fillRect(x * cell + Math.random() * cell, y * cell + Math.random() * cell, 2, 2);
    }
  }
  g.strokeStyle = '#5d4020';
  g.lineWidth = 7;
  for (let i = 0; i <= 2; i++) {
    g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, 256); g.stroke();
    g.beginPath(); g.moveTo(0, i * cell); g.lineTo(256, i * cell); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 30);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildFloorWorld(scene, random, GEOM = { length: 170, halfWidth: 15, laneHalf: 12.5 }) {
  const group = new THREE.Group();
  scene.add(group);
  const finishZ = -6 - GEOM.length;

  const hemi = new THREE.HemisphereLight(0xffe2b8, 0x2a1608, 0.6);
  group.add(hemi);
  const fill = new THREE.DirectionalLight(0xffc9a0, 0.4);
  fill.position.set(-16, 26, 26);
  group.add(fill);
  const key = new THREE.DirectionalLight(0xffe3b3, 2.1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -36; key.shadow.camera.right = 36;
  key.shadow.camera.top = 36; key.shadow.camera.bottom = -36;
  key.shadow.camera.near = 1; key.shadow.camera.far = 140;
  key.shadow.bias = -0.0006;
  group.add(key);
  group.add(key.target);

  // ---- The tiled floor itself ---------------------------------------------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(GEOM.halfWidth * 2 + 46, GEOM.length + 90),
    new THREE.MeshStandardMaterial({ map: kitchenTileTexture(), roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, finishZ / 2 + 6);
  floor.receiveShadow = true;
  group.add(floor);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(11, GEOM.length + 26),
    new THREE.MeshStandardMaterial({ color: 0x74342a, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.05, finishZ / 2 + 2);
  rug.receiveShadow = true;
  group.add(rug);

  // ---- The table looming overhead ------------------------------------------
  const underside = new THREE.Mesh(new THREE.BoxGeometry(46, 2.5, GEOM.length + 70), MAT.woodDark);
  underside.position.set(0, 31, finishZ / 2);
  group.add(underside);
  for (const sx of [-1, 1]) {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5, GEOM.length + 70), MAT.wood);
    apron.position.set(sx * 20, 27.5, finishZ / 2);
    group.add(apron);
  }
  // The far wall and its skirting board.
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(GEOM.halfWidth * 2 + 60, 60),
    new THREE.MeshStandardMaterial({ color: 0x4a2c14, roughness: 1 }));
  wall.position.set(0, 26, finishZ - 26);
  group.add(wall);
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(GEOM.halfWidth * 2 + 60, 3.4, 0.8), MAT.woodDark);
  skirting.position.set(0, 1.7, finishZ - 25.4);
  group.add(skirting);

  // ---- Legs: the obstacles. Table legs are trunks; chair legs come in pairs. -
  const statics = [];
  const addLeg = (x, z, r, h, mat) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, h, 12), mat);
    leg.position.set(x, h / 2, z);
    leg.castShadow = true; leg.receiveShadow = true;
    group.add(leg);
    // A soft contact-shadow disc grounds the leg on the tiles in a still frame.
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 1.55, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(x, 0.07, z);
    disc.renderOrder = 1;
    group.add(disc);
    statics.push({ x, z, r, lastHitDist: -99 });
  };
  for (let z = -26; z > finishZ + 14; z -= range(random, 24, 34)) {
    const roll = random();
    if (roll < 0.42) {
      // One dining-table leg standing in the running lanes.
      addLeg(range(random, -GEOM.laneHalf + 3, GEOM.laneHalf - 3), z, 2.1, 30, MAT.woodDark);
    } else if (roll < 0.72) {
      // A chair: two legs in the lanes and its seat high above the turkey.
      const cx = range(random, -GEOM.laneHalf + 3.4, GEOM.laneHalf - 3.4);
      addLeg(cx - 1.9, z, 0.85, 13, MAT.wood);
      addLeg(cx + 1.9, z, 0.85, 13, MAT.wood);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.8, 5.6), MAT.wood);
      seat.position.set(cx, 13.2, z);
      seat.castShadow = true;
      group.add(seat);
    } else {
      // Table legs flanking the run, just outside the lanes.
      addLeg(-(GEOM.laneHalf + 3.2), z, 2.3, 30, MAT.woodDark);
      addLeg(GEOM.laneHalf + 3.2, z + range(random, -3, 3), 2.3, 30, MAT.woodDark);
    }
  }
  // A dropped plate and a fallen fork on the tiles, dressing at the sides.
  const droppedPlate = makePlate(random, false);
  droppedPlate.position.set(-(GEOM.halfWidth - 2), 0.1, -52);
  droppedPlate.rotation.y = 1.2;
  group.add(droppedPlate);
  const droppedCutlery = makeCutlery(random);
  droppedCutlery.position.set(GEOM.halfWidth - 2.4, 0.1, -96);
  droppedCutlery.rotation.y = -0.7;
  group.add(droppedCutlery);

  // ---- The finish: a stack of cookbooks and a stool, the way back up --------
  const bookCols = [0x8e2f26, 0x2e5e46, 0x2c4a7c, 0xc8b294];
  const stack = new THREE.Group();
  let by = 0;
  for (let i = 0; i < 4; i++) {
    const w = 11 - i * 1.1, d = 8 - i * 0.7, h = 1.9;
    const pages = new THREE.Mesh(new THREE.BoxGeometry(w - 0.7, h - 0.35, d - 0.5),
      new THREE.MeshStandardMaterial({ color: 0xefe3c2, roughness: 0.95 }));
    pages.position.set(0.35, by + h / 2, 0);
    stack.add(pages);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: bookCols[i], roughness: 0.7 }));
    cover.position.y = by + h / 2;
    cover.castShadow = true; cover.receiveShadow = true;
    stack.add(cover);
    stack.rotation.y = 0; // keep the stack aligned; rotate the whole group below
    by += h;
    stack.children[stack.children.length - 1].rotation.y = range(random, -0.16, 0.16);
    stack.children[stack.children.length - 2].rotation.y = stack.children[stack.children.length - 1].rotation.y;
  }
  stack.position.set(-2.5, 0, finishZ - 6);
  group.add(stack);
  const stool = new THREE.Group();
  const seatTop = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.8, 16), MAT.wood);
  seatTop.position.y = 5.6;
  seatTop.castShadow = true;
  stool.add(seatTop);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const sleg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 5.6, 8), MAT.woodDark);
    sleg.position.set(Math.cos(a) * 2.6, 2.8, Math.sin(a) * 2.6);
    stool.add(sleg);
  }
  stool.position.set(6.5, 0, finishZ - 3);
  group.add(stool);
  // A pendant lamp over the stack: the goal beacon.
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 16, 6), MAT.darkSteel);
  cord.position.set(-2.5, 24, finishZ - 6);
  group.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.6, 14, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2e5e46, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }));
  shade.position.set(-2.5, 15.8, finishZ - 6);
  group.add(shade);
  const goalLight = new THREE.PointLight(0xffc37a, 320, 95, 1.8);
  goalLight.position.set(-2.5, 13.5, finishZ - 6);
  group.add(goalLight);

  // ---- Dust motes in the under-table gloom -----------------------------------
  const moteCount = 130;
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = range(random, -18, 18);
    motePos[i * 3 + 1] = range(random, 0.5, 22);
    motePos[i * 3 + 2] = range(random, finishZ - 6, 12);
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
    color: 0xffd9a0, size: 0.26, transparent: true, opacity: 0.45, depthWrite: false,
  }));
  group.add(motes);

  return {
    group,
    keyLight: key,
    statics,
    update(dt, t) {
      goalLight.intensity = 300 + Math.sin(t * 2.4) * 45;
      motes.position.y = Math.sin(t * 0.3) * 0.4;
    },
  };
}

// ============================================================================
// Level 3 — the countertop, beside the oven. Granite worktop, a tiled
// backsplash, utensils hanging from rails over both sides, and at the far end
// the kitchen window standing open: the way out.
// ============================================================================

function graniteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#4c423c';
  g.fillRect(0, 0, 256, 256);
  const cols = ['#6b5d4f', '#8a7a63', '#33291f', '#9c8b74', '#5d5148'];
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = cols[Math.floor(Math.random() * cols.length)];
    g.globalAlpha = 0.25 + Math.random() * 0.5;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2.4, 1 + Math.random() * 2.4);
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 26);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function backsplashTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const cell = 64;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      g.fillStyle = (x + y) % 2 === 0 ? '#b9c4a5' : '#93a67e';
      g.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  g.strokeStyle = '#e6e0cc';
  g.lineWidth = 4;
  for (let i = 0; i <= 4; i++) {
    g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, 256); g.stroke();
    g.beginPath(); g.moveTo(0, i * cell); g.lineTo(256, i * cell); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeUtensil(random) {
  const pivot = new THREE.Group();
  const kind = random();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.4, 6), MAT.steel);
  stick.position.y = -1.7;
  pivot.add(stick);
  if (kind < 0.4) { // ladle
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), MAT.steel);
    bowl.rotation.x = Math.PI;
    bowl.position.y = -3.9;
    pivot.add(bowl);
  } else if (kind < 0.75) { // spatula
    const flat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.7, 0.14), MAT.steel);
    flat.position.y = -4.1;
    pivot.add(flat);
  } else { // whisk
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), MAT.steel);
    bulb.scale.set(0.8, 1.5, 0.8);
    bulb.position.y = -4.2;
    pivot.add(bulb);
  }
  pivot.traverse((o) => { o.castShadow = true; });
  return pivot;
}

export function buildCounterWorld(scene, random, GEOM = { length: 170, halfWidth: 13 }) {
  const group = new THREE.Group();
  scene.add(group);
  const finishZ = -6 - GEOM.length;

  const hemi = new THREE.HemisphereLight(0xd8e6ff, 0x3a2410, 0.75);
  group.add(hemi);
  const fill = new THREE.DirectionalLight(0xffe2b8, 0.5);
  fill.position.set(18, 22, 30);
  group.add(fill);
  const key = new THREE.DirectionalLight(0xfff0cd, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -34; key.shadow.camera.right = 34;
  key.shadow.camera.top = 34; key.shadow.camera.bottom = -34;
  key.shadow.camera.near = 1; key.shadow.camera.far = 140;
  key.shadow.bias = -0.0006;
  group.add(key);
  group.add(key.target);

  // ---- The worktop slab ------------------------------------------------------
  const slab = new THREE.Mesh(new THREE.BoxGeometry(GEOM.halfWidth * 2 + 6, 2.2, GEOM.length + 56),
    new THREE.MeshStandardMaterial({ map: graniteTexture(), roughness: 0.32 }));
  slab.position.set(0, -1.35, finishZ / 2 + 8);
  slab.receiveShadow = true;
  group.add(slab);
  // Cabinet fronts below the near edge.
  const cabinets = new THREE.Mesh(new THREE.BoxGeometry(GEOM.halfWidth * 2 + 4, 15, GEOM.length + 50),
    new THREE.MeshStandardMaterial({ color: 0x5d4630, roughness: 0.9 }));
  cabinets.position.set(0, -9.8, finishZ / 2 + 8);
  group.add(cabinets);

  // ---- Backsplash and the far wall -------------------------------------------
  const splash = new THREE.Mesh(new THREE.PlaneGeometry(GEOM.halfWidth * 2 + 40, 15),
    new THREE.MeshStandardMaterial({ map: backsplashTexture(), roughness: 0.4 }));
  splash.position.set(0, 7.5, finishZ - 13.5);
  group.add(splash);
  const farWall = new THREE.Mesh(new THREE.PlaneGeometry(GEOM.halfWidth * 2 + 40, 46),
    new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 1 }));
  farWall.position.set(0, 30, finishZ - 14);
  group.add(farWall);

  // ---- The window: open, bright, the way out ----------------------------------
  const winGroup = new THREE.Group();
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(17, 21),
    new THREE.MeshStandardMaterial({ color: 0xcfe4ff, emissive: 0xbfd9ff, emissiveIntensity: 1.35 }));
  winGroup.add(pane);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf1e8d6, roughness: 0.6 });
  for (const [w, h, x, y] of [[19, 1.6, 0, 11.2], [19, 1.6, 0, -11.2], [1.6, 24, -9.2, 0], [1.6, 24, 9.2, 0], [17, 1.1, 0, 0], [1.1, 21, 0, 0]]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.9), frameMat);
    bar.position.set(x, y, 0.3);
    winGroup.add(bar);
  }
  // One casement swung open, angled into the room.
  const casement = new THREE.Group();
  const openPane = new THREE.Mesh(new THREE.PlaneGeometry(8, 20),
    new THREE.MeshStandardMaterial({ color: 0xd6ecff, roughness: 0.1, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
  casement.add(openPane);
  const openFrame = new THREE.Mesh(new THREE.BoxGeometry(8.6, 21, 0.5), frameMat);
  openFrame.position.z = -0.4;
  casement.add(openFrame);
  casement.position.set(-9.2, 0, 0.6);
  casement.rotation.y = -0.85;
  winGroup.add(casement);
  for (const sx of [-1, 1]) {
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 23),
      new THREE.MeshStandardMaterial({ color: 0x8e2f26, roughness: 1, side: THREE.DoubleSide }));
    curtain.position.set(sx * 12.6, 0.5, 0.8);
    curtain.rotation.y = sx * 0.25;
    winGroup.add(curtain);
  }
  winGroup.position.set(0, 13.5, finishZ - 13);
  group.add(winGroup);
  const windowLight = new THREE.PointLight(0xd8e8ff, 380, 120, 1.7);
  windowLight.position.set(0, 13, finishZ - 4);
  group.add(windowLight);

  // ---- The oven front under the far counter, glowing ---------------------------
  const ovenFront = new THREE.Mesh(new THREE.BoxGeometry(20, 11, 1), MAT.darkSteel);
  ovenFront.position.set(-2, -7.5, finishZ + 18.5);
  group.add(ovenFront);
  const ovenGlow = new THREE.Mesh(new THREE.PlaneGeometry(14, 6.5),
    new THREE.MeshStandardMaterial({ color: 0xff7a26, emissive: 0xff6a00, emissiveIntensity: 1.6 }));
  ovenGlow.position.set(-2, -7.2, finishZ + 19.1);
  group.add(ovenGlow);
  // A stovetop panel printed on the worktop mid-run (the burners live here).
  const hob = new THREE.Mesh(new THREE.BoxGeometry(GEOM.halfWidth * 2 - 2, 0.14, 34),
    new THREE.MeshStandardMaterial({ color: 0x14100d, roughness: 0.25 }));
  hob.position.set(0, 0.08, -100);
  hob.receiveShadow = true;
  group.add(hob);
  for (const [hx, hz] of [[-5.5, -90], [5.5, -90], [-5.5, -110], [5.5, -110]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.28, 8, 24), MAT.darkSteel);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(hx, 0.2, hz);
    group.add(ring);
  }

  // ---- Hanging utensils on rails over both sides --------------------------------
  const swayers = [];
  for (const sx of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, GEOM.length - 30, 8), MAT.steel);
    rail.rotation.x = Math.PI / 2;
    rail.position.set(sx * (GEOM.halfWidth - 0.6), 11, finishZ / 2 - 4);
    group.add(rail);
    for (let z = -34; z > finishZ + 16; z -= range(random, 15, 24)) {
      const u = makeUtensil(random);
      u.position.set(sx * (GEOM.halfWidth - 0.6), 11, z + range(random, -2, 2));
      group.add(u);
      swayers.push({ pivot: u, phase: range(random, 0, 6) });
    }
  }

  // ---- Set dressing: knife block, kettle, cutting board ---------------------------
  const block = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6.5, 2.4), MAT.wood);
  block.position.set(-(GEOM.halfWidth - 1.6), 3.1, -38);
  block.rotation.z = 0.16;
  block.castShadow = true;
  group.add(block);
  for (let i = 0; i < 3; i++) {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 2.6, 8), MAT.darkSteel);
    grip.position.set(-(GEOM.halfWidth - 1.6) - 0.7 + i * 0.8, 7.2, -38.4 + i * 0.4);
    grip.rotation.z = 0.16;
    group.add(grip);
  }
  const kettle = new THREE.Group();
  const kBody = new THREE.Mesh(new THREE.SphereGeometry(2.5, 14, 10), MAT.steel);
  kBody.scale.y = 0.85;
  kBody.castShadow = true;
  kettle.add(kBody);
  const spout = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.2, 8), MAT.steel);
  spout.position.set(-2.4, 0.7, 0);
  spout.rotation.z = 0.8;
  kettle.add(spout);
  kettle.position.set(GEOM.halfWidth - 2.2, 2.1, -66);
  group.add(kettle);
  const board = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.5, 4.6), MAT.wood);
  board.position.set(GEOM.halfWidth - 2.6, 0.3, -128);
  board.rotation.y = 0.3;
  board.castShadow = true; board.receiveShadow = true;
  group.add(board);
  for (let i = 0; i < 2; i++) {
    const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xc23a24, roughness: 0.35 }));
    tomato.position.set(GEOM.halfWidth - 3.6 + i * 2, 1.1, -128.6 + i * 0.8);
    group.add(tomato);
  }

  return {
    group,
    keyLight: key,
    update(dt, t) {
      for (const s of swayers) s.pivot.rotation.x = Math.sin(t * 1.25 + s.phase) * 0.07;
      ovenGlow.material.emissiveIntensity = 1.55 + Math.sin(t * 2.2) * 0.16 + Math.sin(t * 7.7) * 0.06;
      windowLight.intensity = 370 + Math.sin(t * 1.7) * 30;
    },
  };
}
