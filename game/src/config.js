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
};

export const CAMERA = {
  back: 11.5,     // metres behind the turkey
  height: 6.8,    // metres above the tabletop
  lookAhead: 16,  // metres ahead of the turkey the camera aims at
  fov: 58,
};
