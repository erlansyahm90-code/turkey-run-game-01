// Dinner Table Dash — the farmer. He never leaves the far end of the table: a giant
// silhouette looming behind the oven, swaying as he watches his dinner run away. His hand
// is the part that plays: it reaches in over the table (hazards.js drives when), fingers
// spread, and slams down to grab. And when the turkey is caught, his silver serving
// cloche is what comes down over it.

import * as THREE from 'three';

const SKIN = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.75 });
const SHIRT = new THREE.MeshStandardMaterial({ color: 0x74553a, roughness: 0.95 });
const DENIM = new THREE.MeshStandardMaterial({ color: 0x39506e, roughness: 0.95 });
const HAT = new THREE.MeshStandardMaterial({ color: 0xa8823c, roughness: 0.9 });
const SILVER = new THREE.MeshStandardMaterial({ color: 0xe9eef4, roughness: 0.22, metalness: 0.85 });

export function buildFarmer() {
  const farmer = new THREE.Group();

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 9.5, 17, 14), SHIRT);
  torso.position.y = 26;
  torso.castShadow = true;
  farmer.add(torso);
  const overalls = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 9.8, 8, 14), DENIM);
  overalls.position.y = 20.5;
  farmer.add(overalls);
  for (const sx of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(1.7, 8.5, 0.5), DENIM);
    strap.position.set(sx * 3.6, 28.5, -7.6);
    farmer.add(strap);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.7, 15, 10), SHIRT);
    arm.position.set(sx * 10.6, 25, 0);
    arm.rotation.z = sx * 0.22;
    farmer.add(arm);
    const handRest = new THREE.Mesh(new THREE.SphereGeometry(2.5, 10, 8), SKIN);
    handRest.scale.set(1, 1.25, 1);
    handRest.position.set(sx * 12.3, 17.2, 0);
    farmer.add(handRest);
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 3.4, 10), SKIN);
  neck.position.y = 36;
  farmer.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(4.6, 16, 12), SKIN);
  head.position.y = 41.5;
  head.castShadow = true;
  farmer.add(head);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(3.4, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xcac2b4, roughness: 1 }));
  beard.scale.set(1, 0.75, 0.7);
  beard.position.set(0, 38.6, -2.2);
  farmer.add(beard);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(6.8, 6.8, 0.55, 18), HAT);
  brim.position.y = 44.6;
  farmer.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.7, 3.6, 14), HAT);
  crown.position.y = 46.4;
  farmer.add(crown);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x1c1008, roughness: 0.35 }));
    eye.position.set(sx * 1.7, 42.3, -4.1);
    farmer.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), SKIN);
  nose.position.set(0, 40.9, -4.5);
  farmer.add(nose);

  farmer.position.set(10, 0, -312);
  return farmer;
}

/** The reaching hand: a palm with four fingers and a thumb, fingers spread to grab. */
export function buildHand() {
  const hand = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.BoxGeometry(9.5, 2.2, 10.5), SKIN);
  palm.castShadow = true;
  hand.add(palm);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.1, 5.5, 12), SHIRT);
  cuff.position.set(0, 1.2, 8.2);
  hand.add(cuff);
  const fingerXs = [-3.6, -1.25, 1.25, 3.6];
  const fingers = [];
  for (const fx of fingerXs) {
    const pivot = new THREE.Group();
    const seg = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.6, 6.4), SKIN);
    seg.position.z = -3.2;
    seg.castShadow = true;
    pivot.add(seg);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 3.4), SKIN);
    tip.position.set(0, -0.55, -7.4);
    tip.rotation.x = 0.5;
    pivot.add(tip);
    pivot.position.set(fx, -0.4, -5);
    hand.add(pivot);
    fingers.push(pivot);
  }
  const thumb = new THREE.Group();
  const thumbSeg = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.6, 5), SKIN);
  thumbSeg.position.z = -2.4;
  thumb.add(thumbSeg);
  thumb.position.set(-5.4, -0.4, -0.5);
  thumb.rotation.y = 0.7;
  hand.add(thumb);
  fingers.push(thumb);
  hand.visible = false;
  return { group: hand, fingers };
}

/** Curl the hand's fingers: 0 = open flat, 1 = closed grab. */
export function setGrab(hand, amount) {
  for (const f of hand.fingers) f.rotation.x = -amount * 0.85;
}

const FUR = new THREE.MeshStandardMaterial({ color: 0xb06a28, roughness: 1 });
const FUR_DARK = new THREE.MeshStandardMaterial({ color: 0x7a4416, roughness: 1 });
const PAD = new THREE.MeshStandardMaterial({ color: 0xd77a86, roughness: 0.6 });

/**
 * The kitchen cat's paw: a furry forearm ending in a soft paw with toe beans. Same shape
 * contract as buildHand ({ group, fingers }) so hazards.js can drive it with the hand's
 * grab machine and setGrab curls its toes. It swipes in over the kitchen floor.
 */
export function buildPaw() {
  const paw = new THREE.Group();
  const forearm = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.1, 11, 12), FUR);
  forearm.position.set(0, 2.2, 7.5);
  forearm.rotation.x = 0.5;
  forearm.castShadow = true;
  paw.add(forearm);
  const stripes = new THREE.Mesh(new THREE.CylinderGeometry(2.62, 2.75, 1.6, 12), FUR_DARK);
  stripes.position.set(0, 3.4, 9.6);
  stripes.rotation.x = 0.5;
  paw.add(stripes);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(3.4, 14, 10), FUR);
  foot.scale.set(1.25, 0.62, 1.45);
  foot.position.set(0, 0.4, 0);
  foot.castShadow = true;
  paw.add(foot);
  const mainPad = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 8), PAD);
  mainPad.scale.set(1, 0.4, 1.2);
  mainPad.position.set(0, -0.55, 0.9);
  paw.add(mainPad);
  const fingers = [];
  for (const fx of [-2.9, -1, 1, 2.9]) {
    const toe = new THREE.Group();
    const bean = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 8), FUR);
    bean.scale.set(1, 0.75, 1.35);
    bean.position.set(0, 0, -1.1);
    bean.castShadow = true;
    toe.add(bean);
    const beanPad = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), PAD);
    beanPad.scale.set(1, 0.4, 1.2);
    beanPad.position.set(0, -0.62, -1.2);
    toe.add(beanPad);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 6),
      new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.4 }));
    claw.rotation.x = Math.PI / 2 + 0.5;
    claw.position.set(0, -0.25, -2.6);
    toe.add(claw);
    toe.position.set(fx, 0.15, -3.6);
    paw.add(toe);
    fingers.push(toe);
  }
  paw.visible = false;
  return { group: paw, fingers };
}

/** The silver serving cloche that ends a caught turkey's run. */
export function buildCloche() {
  const cloche = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), SILVER);
  dome.castShadow = true;
  cloche.add(dome);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.22, 10, 28), SILVER);
  rim.rotation.x = Math.PI / 2;
  cloche.add(rim);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x8a5a1d, roughness: 0.35, metalness: 0.8 }));
  knob.position.y = 3.3;
  cloche.add(knob);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.7, 8), SILVER);
  stem.position.y = 2.95;
  cloche.add(stem);
  cloche.visible = false;
  return cloche;
}
