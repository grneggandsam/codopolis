// -----------------------------------------------------------------------------
// ============================== MODEL ========================================
// -----------------------------------------------------------------------------

const vWidth = 1100;
const vHeight = 800;
let dude = new Image();
let fDude = new Image();

var model = {
  X: 500,
  Y: 350,
  s: 15,                 // Constant that defines the change in distance per action
  p: 90,                // Constant that defines period for the speed
  vWidth: vWidth,
  vHeight: vHeight,
  cX: (vWidth/2-50),
  cY: (vHeight/2-50),
  dude: dude,
  fDude: fDude,
  creeps: {},
  ai: {},
  pets: [],
  flipped: false,
  timeSet: Date.now(),    // unused?
  needsReset: true,
  MAP: [],
  columns: 0,
  rows: 0,
  unitWidth: 60,
  unitHeight: 100,
  id: 0,
  flags: [],
  units: {},
  missles: {}
}

module.exports = model;
