// Dinner Table Dash — tuning constants. One place for every number the game balances on:
// the table's size, the turkey's run, hazard timing and scoring.

export const TABLE = {
  length: 260,          // metres of tablecloth between the start and the escape edge
  halfWidth: 12.5,      // the tabletop runs x in [-12.5, 12.5]
  laneHalf: 10.2,       // the turkey may run in x in [-10.2, 10.2]
  edgeZ: -260,          // the far edge: cross it and the turkey leaps to freedom
  floorY: -34,          // the kitchen floor, far below the tabletop (y = 0)
};

export const TURKEY = {
  startZ: -6,
  baseSpeed: 15,        // metres per second at the first plate
  topSpeed: 27,         // metres per second near the edge
  steerSpeed: 21,       // lateral metres per second at full tilt
  jumpVelocity: 13.5,
  gravity: -34,
  radius: 1.05,         // collision radius against plunges and plates
  lives: 3,
  invulnerableSecs: 1.6,
};

export const DASH = {
  speedFactor: 1.6,     // forward speed multiplier while dashing
  durationSecs: 0.9,    // one dash lasts this long
  staminaMax: 100,
  staminaCost: 100,     // a dash empties the stamina bar…
  refillSecs: 4,        // …which refills over this much normal running
  fovKick: 7,           // degrees of FOV that bloom in at dash start, easing back as it ends
};

export const SCORING = {
  perMetre: 2,
  cornKernel: 25,
  nearMiss: 15,         // a knife that lands within this of the turkey but misses
  nearMissRange: 3.4,
  escapeLifeBonus: 150, // per heart left when the turkey escapes
};

export const HAZARDS = {
  knifeFirstAt: 26,           // distance of the first carving-knife plunge
  knifeGapStart: 30,          // metres between plunges early on…
  knifeGapEnd: 15,            // …and near the edge
  knifeTelegraphSecs: 0.85,   // the shadow grows for this long before the plunge
  knifePlungeSecs: 0.13,
  knifeRestSecs: 0.55,
  knifeRadius: 2.5,
  forkEverySecs: 13,          // a fork sweeps across the table about this often
  forkTelegraphSecs: 0.9,
  forkSweepSecs: 0.8,
  forkBand: 1.6,              // half-depth of the fork's tine band
  handEverySecs: 21,          // the farmer's hand reaches in about this often
  handTelegraphSecs: 1.15,
  handRadiusX: 6.4,           // the hand covers a wide patch of the table
  handRadiusZ: 4.6,
  gravySlowFactor: 0.45,      // speed multiplier while slipping through gravy
  gravySlowSecs: 1.25,
  plateRadius: 3.6,           // a serving plate left in the running lanes
  pawEverySecs: 15,           // the cat's paw swipes in about this often (floor level)
  pawTelegraphSecs: 1.0,      // its shadow grows for this long before the swipe
  pawRadiusX: 5.6,            // the paw covers a wide patch of floor
  pawRadiusZ: 4.2,
  handFloorFactor: 1.7,       // on the floor the farmer's hand reaches less often
  flareFirstAt: 52,           // distance of the first burner flare (counter level)
  flareGapStart: 36,          // metres between flares early on…
  flareGapEnd: 22,            // …and near the window
  flareTelegraphSecs: 0.9,    // the grate glows for this long before it flares
  flareActiveSecs: 0.75,      // how long the flame / steam jet stays up
  flareRadius: 2.6,           // the burn zone around a flaring grate
  levelBonus: 100,            // points for clearing a level
};

export const CAMERA = {
  back: 11.5,     // metres behind the turkey
  height: 6.8,    // metres above the tabletop
  lookAhead: 16,  // metres ahead of the turkey the camera aims at
  fov: 58,
};

// The escape is three runs in one, a location per level. Every level is built in the
// same local frame (the turkey starts at TURKEY.startZ and runs toward -Z over a
// surface at y = 0); the level config says how long and wide it is, what hunts the
// turkey there, and what the finish is called. Score, corn and near-misses carry
// across levels; hearts refill at each level start.
export const LEVELS = [
  {
    id: 'table',
    name: 'THE DINNER TABLE',
    tag: 'LEVEL 1 · THE DINNER TABLE',
    goal: 'REACH THE TABLE EDGE ↓',
    length: 180,
    halfWidth: 12.5,
    laneHalf: 10.2,
    bg: 0x1a0d06,
    fog: 0x1a0d06,
    hazards: { knife: true, fork: true, hand: true, paw: false, plates: true, flares: false, spill: 'gravy' },
  },
  {
    id: 'floor',
    name: 'THE KITCHEN FLOOR',
    tag: 'LEVEL 2 · THE KITCHEN FLOOR',
    goal: 'THE COOKBOOK STACK → CLIMB!',
    length: 170,
    halfWidth: 15,
    laneHalf: 12.5,
    bg: 0x120a06,
    fog: 0x120a06,
    hazards: { knife: false, fork: false, hand: true, paw: true, plates: false, flares: false, spill: 'water' },
  },
  {
    id: 'counter',
    name: 'THE COUNTERTOP',
    tag: 'LEVEL 3 · THE COUNTERTOP',
    goal: 'THE WINDOW → FREEDOM',
    length: 170,
    halfWidth: 13,
    laneHalf: 10.6,
    bg: 0x180c07,
    fog: 0x180c07,
    hazards: { knife: true, fork: false, hand: false, paw: false, plates: false, flares: true, spill: 'oil' },
  },
];
