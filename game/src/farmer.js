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

const HAND_SKIN = new THREE.MeshStandardMaterial({ color: 0xe6b47e, roughness: 0.55 });

/**
 * One finger of the reaching hand: three capsule segments chained on pivots,
 * tapering toward a rounded tip, with a knuckle ball at each joint. The two
 * inner joints carry a baked-in curl, so even the resting hand reads as a
 * claw; setGrab curls the base pivot on top of that. (The old fingers were
 * flat boxes — from any distance they read as wooden planks, not fingers.)
 */
function buildFinger(radius, curl) {
  const base = new THREE.Group();
  const knuckle = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.12, 12, 10), HAND_SKIN);
  knuckle.castShadow = true;
  base.add(knuckle);
  const seg1 = new THREE.Mesh(new THREE.CapsuleGeometry(radius, 1.6, 4, 10), HAND_SKIN);
  seg1.rotation.x = Math.PI / 2;
  seg1.position.z = -1.55;
  seg1.castShadow = true;
  base.add(seg1);
  const joint2 = new THREE.Group();
  joint2.position.z = -3.2;
  joint2.rotation.x = -0.34 * curl;
  base.add(joint2);
  const knuckle2 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.98, 12, 10), HAND_SKIN);
  knuckle2.castShadow = true;
  joint2.add(knuckle2);
  const seg2 = new THREE.Mesh(new THREE.CapsuleGeometry(radius * 0.88, 1.2, 4, 10), HAND_SKIN);
  seg2.rotation.x = Math.PI / 2;
  seg2.position.z = -1.3;
  seg2.castShadow = true;
  joint2.add(seg2);
  const joint3 = new THREE.Group();
  joint3.position.z = -2.6;
  joint3.rotation.x = -0.48 * curl;
  joint2.add(joint3);
  const seg3 = new THREE.Mesh(new THREE.CapsuleGeometry(radius * 0.76, 0.9, 4, 10), HAND_SKIN);
  seg3.rotation.x = Math.PI / 2;
  seg3.position.z = -1.0;
  seg3.castShadow = true;
  joint3.add(seg3);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.76, 10, 8), HAND_SKIN);
  tip.position.z = -2.05;
  joint3.add(tip);
  return base;
}

/**
 * The reaching hand: a fleshy palm with four fingers and a thumb, fingers
 * spread to grab. Every part is rounded — ellipsoid palm, capsule fingers —
 * so the silhouette alone reads HAND, never a stack of planks. Same shape
 * contract as before ({ group, fingers }); hazards.js drives it unchanged.
 */
export function buildHand() {
  const hand = new THREE.Group();
  // Palm: a flattened ellipsoid for the main mass, a rounded bar across the
  // front edge for the knuckle pad the fingers root into, and the thumb
  // mound bulging on the thumb side.
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), HAND_SKIN);
  palm.scale.set(5.0, 1.75, 5.4);
  palm.position.z = 0.5;
  palm.castShadow = true;
  hand.add(palm);
  const knucklePad = new THREE.Mesh(new THREE.CapsuleGeometry(1.55, 5.9, 4, 12), HAND_SKIN);
  knucklePad.rotation.z = Math.PI / 2;
  knucklePad.position.set(0, -0.25, -4.1);
  knucklePad.castShadow = true;
  hand.add(knucklePad);
  const thenar = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), HAND_SKIN);
  thenar.scale.set(2.3, 1.25, 3.1);
  thenar.position.set(-3.4, -0.5, 0.9);
  hand.add(thenar);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.1, 5.5, 12), SHIRT);
  cuff.position.set(0, 1.2, 8.4);
  hand.add(cuff);
  // Four fingers, uneven as real ones: middle longest, pinky short and
  // curled hardest, the outer pair splayed so daylight shows between them.
  const fingerSpec = [
    { x: -3.5, len: 0.94, curl: 0.9 },
    { x: -1.18, len: 1.0, curl: 1.0 },
    { x: 1.18, len: 0.96, curl: 1.05 },
    { x: 3.5, len: 0.74, curl: 1.25 },
  ];
  const fingers = [];
  for (const spec of fingerSpec) {
    const pivot = buildFinger(0.9, spec.curl);
    pivot.position.set(spec.x, -0.3, -4.5);
    pivot.rotation.y = -spec.x * 0.045;
    pivot.scale.setScalar(spec.len);
    hand.add(pivot);
    fingers.push(pivot);
  }
  // The thumb: two fat segments rooted low on the palm's side, angled out
  // and forward so its silhouette stands clear of the finger row.
  const thumb = new THREE.Group();
  const thumbKnuckle = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 10), HAND_SKIN);
  thumbKnuckle.castShadow = true;
  thumb.add(thumbKnuckle);
  const thumbSeg1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.98, 1.5, 4, 10), HAND_SKIN);
  thumbSeg1.rotation.x = Math.PI / 2;
  thumbSeg1.position.z = -1.4;
  thumbSeg1.castShadow = true;
  thumb.add(thumbSeg1);
  const thumbJoint = new THREE.Group();
  thumbJoint.position.z = -2.9;
  thumbJoint.rotation.x = -0.4;
  thumb.add(thumbJoint);
  const thumbSeg2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.84, 1.1, 4, 10), HAND_SKIN);
  thumbSeg2.rotation.x = Math.PI / 2;
  thumbSeg2.position.z = -1.15;
  thumbSeg2.castShadow = true;
  thumbJoint.add(thumbSeg2);
  const thumbTip = new THREE.Mesh(new THREE.SphereGeometry(0.84, 10, 8), HAND_SKIN);
  thumbTip.position.z = -2.25;
  thumbJoint.add(thumbTip);
  thumb.position.set(-4.85, -0.55, -0.4);
  thumb.rotation.y = 0.8;
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

/**
 * The kitchen cat itself, curled asleep on the floor tiles with its tail wrapped
 * round: a round body, a tucked head with folded ears and slit eyes, one front paw
 * stretched out, and three pale sleep-puffs drifting up. Built facing +x (the head
 * end); hazards.js turns it toward the lane, wakes it as the turkey closes in, and
 * animates the pose handles returned here (breathing, head lift, ear perk, eye
 * slits opening, tail sway/lash, sleep puffs).
 */
export function buildCat() {
  const cat = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(3.1, 18, 12), FUR);
  body.scale.set(1.2, 0.55, 1.05);
  body.position.y = 1.55;
  body.castShadow = true;
  cat.add(body);
  const haunch = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 10), FUR_DARK);
  haunch.scale.set(1, 0.72, 1);
  haunch.position.set(-2.2, 1.35, -0.9);
  cat.add(haunch);

  const headPivot = new THREE.Group();
  headPivot.position.set(2.9, 1.35, 1.6);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.65, 16, 12), FUR);
  head.castShadow = true;
  headPivot.add(head);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.72, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xe8d9c0, roughness: 0.9 }));
  muzzle.scale.set(0.75, 0.6, 1.15);
  muzzle.position.set(1.35, -0.35, 0);
  headPivot.add(muzzle);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.42), PAD);
  nose.position.set(1.95, -0.12, 0);
  headPivot.add(nose);
  const earGeo = new THREE.ConeGeometry(0.62, 1.25, 8);
  const earL = new THREE.Group();
  const earLMesh = new THREE.Mesh(earGeo, FUR);
  earLMesh.position.y = 0.55;
  earLMesh.castShadow = true;
  earL.add(earLMesh);
  earL.position.set(0.05, 1.35, 0.88);
  headPivot.add(earL);
  const earR = new THREE.Group();
  const earRMesh = new THREE.Mesh(earGeo, FUR);
  earRMesh.position.y = 0.55;
  earRMesh.castShadow = true;
  earR.add(earRMesh);
  earR.position.set(0.05, 1.35, -0.88);
  headPivot.add(earR);
  const eyeGeo = new THREE.SphereGeometry(0.17, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x201105, roughness: 0.3 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(1.48, 0.3, 0.62);
  headPivot.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(1.48, 0.3, -0.62);
  headPivot.add(eyeR);
  cat.add(headPivot);

  // One front paw stretched out in front of the chin, toe beans up.
  const frontPaw = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 8), FUR);
  frontPaw.scale.set(1.7, 0.42, 0.72);
  frontPaw.position.set(4.6, 0.5, 1.7);
  frontPaw.castShadow = true;
  cat.add(frontPaw);

  // The tail wraps around the curl; its pivot yaws it for the asleep sway / awake lash.
  const tail = new THREE.Group();
  const tailMesh = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.5, 8, 22, 3.9), FUR);
  tailMesh.rotation.x = Math.PI / 2;
  tailMesh.rotation.z = 0.6;
  tailMesh.castShadow = true;
  tail.add(tailMesh);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 8), FUR_DARK);
  tailTip.position.set(2.2, 0.1, 2.9);
  tail.add(tailTip);
  tail.position.y = 0.55;
  cat.add(tail);

  // Sleep puffs: pale motes that rise, swell and fade over the head while it dozes.
  const zzz = [];
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xdfe9ff, transparent: true, opacity: 0, depthWrite: false }));
    cat.add(puff);
    zzz.push(puff);
  }
  cat.visible = false;
  return { group: cat, body, headPivot, earL, earR, eyeL, eyeR, tail, zzz };
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
