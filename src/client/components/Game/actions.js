// -----------------------------------------------------------------------------
// ============================== ACTIONS ======================================
// -----------------------------------------------------------------------------

// var utils = require('./utility');
import { utils } from '../Utility/utility.js';
var model = require('./model');
var docCookies = require('./cookies');
const functions = require('../../../shared/functions.js');
const CONSTANTS = require('../../../shared/constants.js');

var mouse;
var sX, sY, eX, eY;

function goUp() {
  actions.act.up = model.s;
};

function goDown() {
  actions.act.up = -model.s;
};

function goLeft() {
  actions.act.right = -model.s;
};

function goRight() {
  actions.act.right = model.s;
};

function initiateDrag(e) {
  sX = e.changedTouches[0].pageX;
  sY = e.changedTouches[0].pageY;
  if(sX > 500 && sX < 600 && sY > 450 && sY < 550) {
    pointing = true;
    eX = sX;
    eY = sY;
    sX = 550;
    sY = 500;
  }
};

function endDrag(e) {
  pointing = false;
  actions.act.up = 0;
  actions.act.right = 0;
};

function dragging(e) {
  if(pointing) {
    eX = e.changedTouches[0].pageX;
    eY = e.changedTouches[0].pageY;
    let vec = utils.unit(sX, sY, eX, eY);
    actions.act.up = -(vec.y * model.s);
    actions.act.right = vec.x * model.s;
  }
};

function shoot(x2, y2) {
  const diff = utils.unit(550, 400, x2, y2);
  let i=0;
  let aMissle = {
   curX: model.X+50,
   curY: model.Y+50,
   dX: diff.x * CONSTANTS.MISSLESPEED,
   dY: diff.y * CONSTANTS.MISSLESPEED,
   dist: 0,
   type: "A",
   shooting: true
  };
  if(actions.missles[0] == undefined) {
    actions.missles[0] = aMissle;
  }
};

function aiShoot(ai, x2, y2) {
  const diff = utils.unit(ai.x, ai.y, x2, y2);
  let i=0;
  let aMissle = {
   curX: ai.x+50,
   curY: ai.y+50,
   dX: diff.x * CONSTANTS.MISSLESPEED,
   dY: diff.y * CONSTANTS.MISSLESPEED,
   dist: 0,
   type: "A",
   shooting: true
  };
 if(ai.missles == undefined) {
   ai.missles = {};
   ai.missles[0] = aMissle;
  }
};

function placeFence(x, y) {
  x = x-500 + model.X;
  y = y-350 + model.Y;
  let offSX = 100 - model.X%100 + model.X - 500;
  let offSY = 100 - model.Y%100 + model.Y - 350;
  let building = false;
  if(insideBlock(x, y, 600+offSX, 700+offSX, 350+offSY, 450+offSY)) {
    building = true;
  }
  if(insideBlock(x, y, 600+offSX, 700+offSX, 250+offSY, 350+offSY)) {
    building = true;
  }
  if(insideBlock(x, y, 300+offSX, 400+offSX, 350+offSY, 450+offSY)) {
    building = true;
  }
  if(insideBlock(x, y, 300+offSX, 400+offSX, 250+offSY, 350+offSY)) {
    building = true;
  }
  if(insideBlock(x, y, 400+offSX, 500+offSX, 150+offSY, 250+offSY)) {
    building = true;
  }
  if(insideBlock(x, y, 500+offSX, 600+offSX, 150+offSY, 250+offSY)) {
    building = true;
  }
  if(insideBlock(x, y, 400+offSX, 500+offSX, 450+offSY, 550+offSY)) {
    building = true;
  }
  if(insideBlock(x, y, 500+offSX, 600+offSX, 450+offSY, 550+offSY)) {
    building = true;
  }
  if(building) {
    let fence = {
      player: 1,
      health: 50,
      type: 1
    }
    actions.build = {type: fence, x: parseInt(x/100), y: parseInt(y/100)};
  }
}

function insideBlock(x, y, x1, x2, y1, y2) {
  if(x > x1 && x < x2 &&
    y > y1 && y < y2) {
    return true; }
  else { return false; }
}

function detectFlag() {
  model.flags.forEach( (flag, i) => {
    if(utils.dist(model.X+50, model.Y+80, flag.x*100+50, flag.y*100+50) < 60) {
      if(model.flags[i].health < 1)
        model.flags[i].owner = docCookies.getItem('userId');
      if(model.flags[i].owner == docCookies.getItem('userId')) {
        model.flags[i].health++;
      }
      else {
        model.flags[i].health--;
      }
      actions.drainFlag = { flag: model.flags[i], id: i};
    }
  });
}

function performActions(delta) {
  let percentage = delta / model.p;
  let beforeX = model.X;
  let dX = actions.act.right * percentage;
  let dY = actions.act.up * percentage;
  if(actions.act.right != 0) {
    if(functions.canGo(model.X + dX, model.Y, 20, 80, model.MAP)) {
      model.X += dX;
    }
  }
  if(actions.act.up != 0) {
    if(functions.canGo(beforeX, model.Y - dY, 20, 80, model.MAP)) {
      model.Y -= dY
    }
  }
  if(actions.act.right < 0) {
    model.flipped = true;
  }
  if(actions.act.right > 0) {
    model.flipped = false;
  }
  // Move  missles
  processMissles(percentage);
};


function processMissles(percentage) {
  model.missles = functions.processMissles(model.missles, model.MAP, percentage);
}

// Logout function
function logout() {
  $.ajax({
      type: 'POST',
      url: '/users/logout',
      dataType: 'JSON'
  }).done(function( response ) {
      location.reload();
  });
}

const assignCode = (e) => {
  let code = document.getElementById('code').value;
  let id = document.getElementById('petSelect').value;
  let pet = model.pets.find((elem) => { return elem._id == id })
  if (pet) pet.code = code;
};

const processAI = () => {
  if (model.pets.length < 1) {
    findPets();
  }
  else {
    model.pets.forEach( (pet) => {
      updatePet(pet);
      if (pet.code) {
        eval(pet.code);
      }
    })
  }
};

const findPets = () => {
  if (model.ai) {
    let ids = Object.keys(model.ai);
    ids.forEach( (id) => {
      if (model.ai[id].owner == model.id) {
        model.pets.push(model.ai[id]);
        addSelectOption(id);
      }
    });
  }
};

const updatePet = (pet) => {
  if(model.ai[pet._id]) {
    pet.x = model.ai[pet._id].x;
    pet.y = model.ai[pet._id].y;
    pet.health = model.ai[pet._id].health;
    pet.alive = model.ai[pet._id].alive;
  }
}

const addSelectOption = (option) => {
  // document.getElementById('petSelect').innerHTML += '<option>' + option + '</option>';
};

const clickEvent = (event) => {
  var clickX = event.offsetX;
  var clickY = event.offsetY;
  if(actions.placingF) {
    placeFence(clickX, clickY);
  }
  else {
    shoot(clickX, clickY);
  }
}

const assignListeners = (c) => {
  return new Promise( function(resolve, reject) {
    // document.getElementById('logout').addEventListener('click', logout);
    // document.getElementById('assignCode').addEventListener('click', assignCode);
    c.addEventListener('click', (event) => {
      clickEvent(event);
    });
    c.addEventListener('touchstart', (event) => {
      initiateDrag(event);
    });
    c.addEventListener('touchend', (event) => {
      endDrag(event);
    });
    c.addEventListener('touchmove', (event) => {
      dragging(event);
    });
    c.addEventListener('mousemove', (event) => {
      actions.mouse = event;
    });
    document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      if(keyName == "w" || keyName == "W") {
        goUp();
      }
      if(keyName == "s" || keyName == "S") {
        goDown();
      }
      if(keyName == "d" || keyName == "D") {
        goRight();
      }
      if(keyName == "a" || keyName == "A") {
        goLeft();
      }
      if(keyName == "f" || keyName == "F") {
        actions.placingF = !actions.placingF;
      }
    });

    var a = document.addEventListener('keyup', (event) => {
      if(event.key == "w" || event.key == "s" || event.key == "W" || event.key == "S")
        actions.act.up = 0;
      if(event.key == "a" || event.key == "d" || event.key == "A" || event.key == "DA")
        actions.act.right = 0;
    });
    resolve(a);
  });
};

// Export functions
const actions = {
  clickEvent,
  assignListeners,
  performActions,
  act: {
    up: 0,
    right: 0,
    shoot: false
  },
  placingF: false,
  missles: {},
  mouse: {},
  sX, sY, eX, eY,
  build: {type: 0, x: 0, y: 0},
  drainFlag: {
    draing: false,
    x: 0, y: 0
  },
  detectFlag: detectFlag,
  drainFlag: {},
  aiActions: {},
  proccessAI: processAI
}

export default actions;
