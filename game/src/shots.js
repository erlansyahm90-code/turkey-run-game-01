// Dinner Table Dash — screenshot scenes, behind ?shot=title|play|floor|counter|caught|escaped&seed=N.
// Each scene drives the real game objects into a posed moment (the same turkey, hazards
// and overlays a player sees), renders it, and sets window.__shotReady so the maker's
// screenshot tool knows the frame is final. Nothing here runs in a normal game.

import { TURKEY } from './config.js';
import { setGrab } from './farmer.js';

export function stageShot(name, game) {
  const { turkey, hazards } = game;
  game.setSeededScene();

  if (name === 'title') {
    game.setWorld(0);
    game.state = 'title';
    game.hud.showTitle();
    // For the title the bird turns and faces the camera: face, beak and wattle on show.
    turkey.group.rotation.y = Math.PI;
    turkey.group.position.set(0.5, 0, -8);
    game.poseCamera({ x: 2.4, y: 2.7, z: 3.2 }, { x: 0, y: 2.1, z: -11 });
    return;
  }

  if (name === 'play') {
    // The hero frame (Level 1), staged to read in one second at thumbnail size —
    // "I am small, death is huge, I just dodged it": camera low and tight, the
    // turkey MID-DASH (stamina bar mid-drain, feather burst blooming), the carving
    // knife plunging one body-length to its left over a deep shadow, the farmer's
    // thumb and forefinger pinching the cloth at the frame's right edge, and the
    // real HUD over it all with a CLOSE! +15 pop still on screen. A genuine
    // gameplay frame, UI and all — not a cinematic.
    game.setWorld(0);
    game.state = 'playing';
    game.hud.showHud();
    game.distance = 128;
    game.score = 128 * 2 + 9 * 25;
    game.lives = 3;
    game.corn = 9;
    game.turkeyX = -1.6;
    game.turkeyY = 0;
    turkey.group.position.set(-1.6, 0, -134);
    game.stamina = 45;
    game.dashUntil = 999; // mid-dash: the stamina bar renders in its dashing state
    game.distance = 126.5; // burst origin a step behind the bird, so feathers read
    game.spawnDashFx();
    game.spawnDashFx();
    game.distance = 128;
    // Pose the bursts mid-bloom: where the live effect puts the feathers ~0.3 s in.
    for (const b of game.dashFx) {
      if (!b.active) continue;
      for (const bit of b.bits) {
        bit.mesh.position.x += bit.vx * 0.3;
        bit.mesh.position.y += bit.vy * 0.3;
        bit.mesh.position.z += bit.vz * 0.3;
        bit.mesh.scale.setScalar(1.7);
      }
    }
    const knife = hazards.knives[0];
    knife.phase = 'plunge';
    knife.x = -5.4; knife.z = -139.5;
    knife.group.position.set(-5.4, 14.2, -139.5);
    knife.group.rotation.y = 0.45;
    knife.group.rotation.z = 0.05;
    knife.group.visible = true;
    knife.blob.position.set(-5.4, 0.24, -139.5);
    knife.blob.scale.setScalar(1);
    knife.blob.visible = true;
    knife.ring.position.set(-5.4, 0.26, -139.5);
    knife.ring.visible = true;
    // The farmer's hand intrudes at the right edge, thumb and forefinger pinching —
    // side-on, so the fingers read in profile, curling down at the cloth.
    const hand = hazards.hand;
    hand.group.position.set(9.4, 5.4, -131);
    hand.group.rotation.set(0.2, 1.35, 0.1);
    hand.group.visible = true;
    setGrab(hand, 0.62);
    let placed = 0;
    for (const c of hazards.corns) {
      if (placed >= 5) break;
      c.active = true;
      c.x = 3.6 + Math.sin(placed * 0.8) * 1.1;
      c.z = -139 - placed * 2.4;
      c.mesh.position.set(c.x, 0.9, c.z);
      c.mesh.visible = true;
      placed++;
    }
    const spill = hazards.spills[0];
    spill.x = 6.2; spill.z = -147; spill.r = 3.4;
    spill.mesh.scale.set(3.4, 2.6, 1);
    spill.mesh.position.set(6.2, 0.21, -147);
    spill.mesh.visible = true;
    game.hud.update(game.score, game.lives, game.distance, 0.45, true);
    game.hud.flash('CLOSE! +15');
    const flashEl = document.getElementById('hud-flash');
    flashEl.style.animation = 'none'; // pin the pop at full strength for the still
    flashEl.style.opacity = '1';
    // The farmer looms in the back so the pursuer registers at a glance.
    game.poseFarmer(1.15);
    game.poseCamera(
      { x: -3.9, y: 3.6, z: -122.8 },
      { x: -0.4, y: 2.0, z: -136.5 },
    );
    return;
  }

  if (name === 'floor') {
    // Level 2: under the table on the giant tiles — the kitchen cat AWAKE at the
    // lane's left edge watching the turkey, its paw mid-swipe, a water puddle
    // gleaming ahead, chair and table legs standing in the lanes.
    game.setWorld(1);
    game.state = 'playing';
    game.hud.showHud();
    game.totalDistance = 180;
    game.distance = 95;
    game.score = 180 * 2 + 100 + 95 * 2 + 6 * 25;
    game.lives = 3;
    game.corn = 6;
    turkey.group.position.set(-1.0, 0, -101);
    const cat = hazards.cat;
    cat.group.position.set(-11.2, 0, -112);
    cat.group.rotation.y = 0; // built facing +x: the head end watches the lane
    cat.group.visible = true;
    hazards.wakeCatNow();
    const paw = hazards.paw;
    paw.phase = 'slam';
    paw.x = -4.8; paw.z = -109;
    paw.group.position.set(-5.6, 7.6, -115);
    paw.group.rotation.x = -0.45; // tip the pads and claws toward the camera
    paw.group.scale.setScalar(0.85);
    paw.group.visible = true;
    setGrab(paw, 0.85);
    paw.blob.position.set(-5.6, 0.24, -115);
    paw.blob.scale.setScalar(1);
    paw.blob.visible = true;
    const spill = hazards.spills[0];
    spill.x = 2.9; spill.z = -112; spill.r = 3.3;
    spill.mesh.scale.set(3.3, 2.5, 1);
    spill.mesh.position.set(2.9, 0.21, -112);
    spill.mesh.visible = true;
    let placed = 0;
    for (const c of hazards.corns) {
      if (placed >= 4) break;
      c.active = true;
      c.x = -1.8 + placed * 0.7;
      c.z = -106 - placed * 2.4;
      c.mesh.position.set(c.x, 0.9, c.z);
      c.mesh.visible = true;
      placed++;
    }
    game.hud.update(game.score, game.lives, game.distance);
    game.poseCamera(
      { x: -0.6, y: 5.6, z: -87 },
      { x: -1.4, y: 1.7, z: -110 },
    );
    return;
  }

  if (name === 'counter') {
    // Level 3: on the countertop — a burner flaring white-hot ahead, the carving
    // knife's shadow pooling beyond it, utensils hanging over the run.
    game.setWorld(2);
    game.state = 'playing';
    game.hud.showHud();
    game.totalDistance = 350;
    game.distance = 88;
    game.score = 350 * 2 + 200 + 88 * 2 + 11 * 25;
    game.lives = 2;
    game.corn = 11;
    turkey.group.position.set(-1.2, 0, -94);
    const fl = hazards.flares[0];
    fl.phase = 'active';
    fl.x = 2.8; fl.z = -104;
    fl.group.position.set(2.8, 0, -104);
    fl.group.visible = true;
    fl.flame.visible = true;
    fl.flame.scale.set(1.15, 1.2, 1.15);
    fl.core.visible = true;
    fl.glowMat.color.setHex(0xff7a1a);
    const knife = hazards.knives[0];
    knife.phase = 'telegraph';
    knife.x = -3.5; knife.z = -113;
    knife.group.position.set(-3.5, 19.6, -113);
    knife.group.visible = true;
    knife.blob.position.set(-3.5, 0.24, -113);
    knife.blob.scale.setScalar(0.9);
    knife.blob.visible = true;
    knife.ring.position.set(-3.5, 0.26, -113);
    knife.ring.visible = true;
    game.hud.update(game.score, game.lives, game.distance);
    game.poseCamera(
      { x: -2.8, y: 5.4, z: -81 },
      { x: 0.4, y: 1.8, z: -102 },
    );
    return;
  }

  if (name === 'caught') {
    game.setWorld(0);
    game.state = 'caught';
    game.distance = 173;
    game.score = 173 * 2 + 12 * 25 + 30;
    game.corn = 12;
    game.nearMisses = 2;
    turkey.group.position.set(0.8, 0, -179);
    game.dropCloche(0.8, -179);
    game.hud.showEnd('caught', game.stats());
    game.poseCamera(
      { x: 3.0, y: 4.6, z: -165.5 },
      { x: 0.5, y: 1.0, z: -180 },
    );
    return;
  }

  if (name === 'escaped') {
    // The brightest frame of the set: from inside the counter run, the turkey
    // frozen mid-leap toward the open window, daylight pouring in around it —
    // the end panel over the glow.
    game.setWorld(2);
    game.state = 'escaped';
    game.totalDistance = 350;
    game.distance = 170;
    game.score = 520 * 2 + 14 * 25 + 2 * 100 + 2 * 150;
    game.corn = 14;
    game.nearMisses = 3;
    game.lives = 2;
    turkey.group.position.set(-7.5, 3.2, TURKEY.startZ - 160);
    game.hud.showEnd('escaped', game.stats());
    game.poseCamera(
      { x: 3.8, y: 5.2, z: TURKEY.startZ - 144 },
      { x: -1.5, y: 4.5, z: TURKEY.startZ - 166 },
    );
    return;
  }

  // Unknown shot name: fall back to the title scene.
  stageShot('title', game);
}
