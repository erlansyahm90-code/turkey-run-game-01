// Dinner Table Dash — screenshot scenes, behind ?shot=title|play|caught|escaped&seed=N.
// Each scene drives the real game objects into a posed moment (the same turkey, hazards
// and overlays a player sees), renders it, and sets window.__shotReady so the maker's
// screenshot tool knows the frame is final. Nothing here runs in a normal game.

import { TABLE, TURKEY } from './config.js';

// The exact distance of a completed dash: from the start line to the table edge.
const FULL_RUN = -(TABLE.edgeZ - TURKEY.startZ);

export function stageShot(name, game) {
  const { turkey, hazards, farmerHand } = game;
  game.setSeededScene();

  if (name === 'title') {
    game.state = 'title';
    game.hud.showTitle();
    // For the title the bird turns and faces the camera: face, beak and wattle on show.
    turkey.group.rotation.y = Math.PI;
    turkey.group.position.set(0.5, 0, -8);
    game.poseCamera({ x: 2.4, y: 2.7, z: 3.2 }, { x: 0, y: 2.1, z: -11 });
    return;
  }

  if (name === 'play') {
    // The hero frame: mid-dash, the carving knife caught mid-plunge just ahead of the
    // turkey, its shadow pooled on the cloth, corn in reach, the farmer looming far off.
    game.state = 'playing';
    game.hud.showHud();
    game.distance = 128;
    game.score = 128 * 2 + 9 * 25;
    game.lives = 3;
    game.corn = 9;
    turkey.group.position.set(-1.6, 0, -134);
    turkey.x = -1.6; turkey.z = -134;
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
    // A line of corn curving away on the right, and a gravy spill to dodge on the left.
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

  if (name === 'caught') {
    game.state = 'caught';
    game.distance = 173;
    game.score = 173 * 2 + 12 * 25 + 30;
    game.corn = 12;
    game.nearMisses = 2;
    turkey.group.position.set(0.8, 0, -179);
    turkey.x = 0.8; turkey.z = -179;
    game.dropCloche(0.8, -179);
    game.hud.showEnd('caught', game.stats());
    game.poseCamera(
      { x: 3.2, y: 5.6, z: -163.5 },
      { x: 0.5, y: 1.0, z: -180 },
    );
    return;
  }

  if (name === 'escaped') {
    game.state = 'escaped';
    game.distance = FULL_RUN;
    game.score = FULL_RUN * 2 + 14 * 25 + 2 * 150;
    game.corn = 14;
    game.nearMisses = 3;
    // Frozen at the top of the leap: off the edge, wings wide, falling free. The camera
    // floats past the edge at the bird's own height, looking back — the turkey hangs in
    // the air right of the panel with the table edge and a serving dome behind it.
    turkey.group.position.set(-7, -7, TABLE.edgeZ - 7);
    turkey.x = -7; turkey.z = TABLE.edgeZ - 7;
    game.hud.showEnd('escaped', game.stats());
    game.poseCamera(
      { x: 0, y: -5.5, z: TABLE.edgeZ - 23 },
      { x: -1.5, y: -6.5, z: TABLE.edgeZ - 5 },
    );
    return;
  }

  // Unknown shot name: fall back to the title scene.
  stageShot('title', game);
}
