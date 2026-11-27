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

export function buildWorld(scene, random) {
  scene.background = new THREE.Color(0x1a0d06);
  scene.fog = new THREE.Fog(0x1a0d06, 70, 265);

  const hemi = new THREE.HemisphereLight(0xffd9a6, 0x40200e, 0.8);
  scene.add(hemi);
  const fill = new THREE.DirectionalLight(0xffc9a0, 0.55);
  fill.position.set(-14, 20, 30);
  scene.add(fill);
  const key = new THREE.DirectionalLight(0xffe3b3, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -34; key.shadow.camera.right = 34;
  key.shadow.camera.top = 34; key.shadow.camera.bottom = -34;
  key.shadow.camera.near = 1; key.shadow.camera.far = 130;
  key.shadow.bias = -0.0006;
  scene.add(key);
  scene.add(key.target);

  // ---- The room: floor far below, wall far behind -------------------------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 420),
    new THREE.MeshStandardMaterial({ color: 0x54331a, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, TABLE.floorY, -160);
  floor.receiveShadow = true;
  scene.add(floor);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(46, 30),
    new THREE.MeshStandardMaterial({ color: 0x7e2f24, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, TABLE.floorY + 0.06, TABLE.edgeZ - 16);
  scene.add(rug);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(420, 190),
    new THREE.MeshStandardMaterial({ color: 0x38220f, roughness: 1 }));
  wall.position.set(0, 40, -318);
  scene.add(wall);
  // The back door, ajar, spilling warm light: the way out, past the oven.
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(15, 30),
    new THREE.MeshStandardMaterial({ color: 0xffca7a, emissive: 0xffb85c, emissiveIntensity: 1.5 }));
  doorGlow.position.set(34, TABLE.floorY + 15, -316);
  scene.add(doorGlow);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(18, 33, 1.5), MAT.woodDark);
  doorFrame.position.set(34, TABLE.floorY + 16.5, -317.5);
  scene.add(doorFrame);

  // ---- The table -----------------------------------------------------------
  const tableGroup = new THREE.Group();
  const topNear = 16;
  const topFar = TABLE.edgeZ - 4;
  const topLen = topNear - topFar;
  const top = new THREE.Mesh(new THREE.BoxGeometry(TABLE.halfWidth * 2 + 3, 2.4, topLen), MAT.wood);
  top.position.set(0, -1.55, (topNear + topFar) / 2);
  top.castShadow = true; top.receiveShadow = true;
  tableGroup.add(top);
  const cloth = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE.halfWidth * 2 + 1.6, 0.5, topLen + 1),
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
      const leg = new THREE.Mesh(new THREE.BoxGeometry(3.4, -TABLE.floorY, 3.4), MAT.woodDark);
      leg.position.set(sx * (TABLE.halfWidth - 1.5), TABLE.floorY / 2 - 1, sz === 0 ? 8 : TABLE.edgeZ + 8);
      tableGroup.add(leg);
    }
  }
  scene.add(tableGroup);

  // ---- Place settings down both sides --------------------------------------
  const flames = [];
  const candleLights = [];
  for (let z = -16; z > TABLE.edgeZ + 12; z -= 13.5) {
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
      scene.add(setting);
    }
    if (random() < 0.4) {
      const bowl = makeServingBowl(random);
      bowl.position.set((random() < 0.5 ? -1 : 1) * range(random, 9.8, 11.2), 0.1, z - 6);
      scene.add(bowl);
    }
    if (random() < 0.34) {
      const candle = makeCandle();
      candle.position.set((random() < 0.5 ? -1 : 1) * range(random, 5.4, 6.8), 0.1, z - 3);
      scene.add(candle);
      flames.push(candle.getObjectByName('flame'));
      if (candleLights.length < 3) {
        const pl = new THREE.PointLight(0xffa64d, 60, 42, 1.8);
        pl.position.copy(candle.position).y += 5;
        scene.add(pl);
        candleLights.push(pl);
      }
    }
  }

  // ---- The oven at the far end ---------------------------------------------
  const oven = makeOven();
  oven.position.set(-4, 0, -302);
  scene.add(oven);
  const ovenGlow = oven.getObjectByName('ovenGlow');

  // ---- Dust motes drifting in the warm light --------------------------------
  const moteCount = 240;
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = range(random, -16, 16);
    motePos[i * 3 + 1] = range(random, 0.5, 17);
    motePos[i * 3 + 2] = range(random, -270, 10);
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
    color: 0xffd9a0, size: 0.28, transparent: true, opacity: 0.55, depthWrite: false,
  }));
  scene.add(motes);

  let flickerT = 0;
  return {
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
