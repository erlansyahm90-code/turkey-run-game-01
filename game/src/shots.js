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
    // The hero frame (Level 1): mid-dash on the table, the carving knife caught
    // mid-plunge just ahead of the turkey, corn in reach, the farmer looming far off.
    game.setWorld(0);
    game.state = 'playing';
    game.hud.showHud();
    game.distance = 128;
    game.score = 128 * 2 + 9 * 25;
    game.lives = 3;
    game.corn = 9;
    turkey.group.position.set(-1.6, 0, -134);
    const knife = hazards.knives[0];
    knife.phase = 'plunge';
    knife.x = 1.8; knife.z = -141;
    knife.group.position.set(1.8, 13.4, -141);
    knife.group.rotation.y = 0.6;
    knife.group.visible = true;
    knife.blob.position.set(1.8, 0.24, -141);
    knife.blob.scale.setScalar(1);
    knife.blob.visible = true;
    knife.ring.position.set(1.8, 0.26, -141);
    knife.ring.visible = true;
    let placed = 0;
    for (const c of hazards.corns) {
      if (placed >= 5) break;
      c.active = true;
      c.x = 4.9 + Math.sin(placed * 0.8) * 1.1;
      c.z = -137 - placed * 2.4;
      c.mesh.position.set(c.x, 0.9, c.z);
      c.mesh.visible = true;
      placed++;
    }
    const spill = hazards.spills[0];
    spill.x = -5.4; spill.z = -145; spill.r = 3.4;
    spill.mesh.scale.set(3.4, 2.6, 1);
    spill.mesh.position.set(-5.4, 0.21, -145);
    spill.mesh.visible = true;
    game.hud.update(game.score, game.lives, game.distance);
    // The farmer looms larger in the cover frame so the pursuer registers at a glance.
    game.poseFarmer(1.3);
    game.poseCamera(
      { x: -3.4, y: 5.2, z: -121.5 },
      { x: 0.2, y: 1.6, z: -140 },
    );
    return;
  }

  if (name === 'floor') {
    // Level 2: under the table on the giant tiles — the cat's paw mid-swipe, a water
    // puddle gleaming ahead, chair and table legs standing in the lanes.
    game.setWorld(1);
    game.state = 'playing';
    game.hud.showHud();
    game.totalDistance = 180;
    game.distance = 95;
    game.score = 180 * 2 + 100 + 95 * 2 + 6 * 25;
    game.lives = 3;
    game.corn = 6;
    turkey.group.position.set(-1.0, 0, -101);
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
      { x: -1.2, y: 5.4, z: -88.5 },
      { x: -0.6, y: 1.7, z: -110 },
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
      { x: 3.2, y: 5.6, z: -163.5 },
      { x: 0.5, y: 1.0, z: -180 },
    );
    return;
  }

  if (name === 'escaped') {
    // Frozen at the top of the final leap: out of the open kitchen window at the end
    // of the counter, wings wide, falling free — the end panel beside the bird.
    game.setWorld(2);
    game.state = 'escaped';
    game.totalDistance = 350;
    game.distance = 170;
    game.score = 520 * 2 + 14 * 25 + 2 * 100 + 2 * 150;
    game.corn = 14;
    game.nearMisses = 3;
    game.lives = 2;
    turkey.group.position.set(-6.8, 4.2, TURKEY.startZ - 170 - 9);
    game.hud.showEnd('escaped', game.stats());
    game.poseCamera(
      { x: 4.5, y: 7.5, z: TURKEY.startZ - 170 - 27 },
      { x: -2, y: 4.5, z: TURKEY.startZ - 170 - 6 },
    );
    return;
  }

  // Unknown shot name: fall back to the title scene.
  stageShot('title', game);
}
