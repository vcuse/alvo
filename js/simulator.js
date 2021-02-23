class SimElem {
  width;
  height;
  posX;
  posY;
  domElem;
  simDiv;
  canvasWidth = 400;
  canvasHeight = 450;

  constructor(width, height, posX, posY, domElem, simDiv) {
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this.domElem = domElem;
    this.simDiv = simDiv;
    this.render();
  }

  render() {
    this.domElem.style.top = (this.canvasHeight / 2 + this.posY - this.height / 2) + 'px';
    this.domElem.style.left = (this.canvasWidth / 2 + this.posX - this.width / 2) + 'px';
  }
}

class Robot extends SimElem {
  carry = null;

  constructor(simDiv, posX, posY) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-robot");
    domElem.src = "media/robot.png";
    simDiv.appendChild(domElem);
    super(30, 30, posX, posY, domElem, simDiv);
  }

  move(targetX, targetY) {
    var toMove = [this];
    if (this.carry) 
      toMove.push(this.carry);
    anime({
      targets: toMove,
      posX : targetX,
      posY : function(e, i) {
        return (i == 0) ? targetY : (targetY - 20);
      },
      easing : 'linear',
      round: 1,
      update: function() {
        toMove.map(i => i.render());
      }
    })
  }

  pickupFromStation(station) {
    if (!robot.isAtStation(station)) {
      console.error("Robot is not correctly positioned to pick up item from this station!");
      return;
    }
    if (!station.item) {  
      console.error("Robot has nothing to pick up at this station!");
      return;
    }
    this.carry = station.item;
    station.item = null;
  }

  placeAtStation(station) {
    if (!robot.isAtStation(station)) {
      console.error("Robot is not correctly positioned to place item at this station!");
      return;
    }
    if (station.item) {  
      console.error("There already is an item at this station!");
      return;
    }
    station.item = this.carry;
    this.carry = null;
  }

  moveToStation(station) {
    this.move(station.posX, station.posY);
  }

  isAtStation(station) {
    return this.posX == station.posX && this.posY == station.posY;
  }
}

class Station extends SimElem {
  item = null;

  constructor(simDiv, posX, posY) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-station");
    domElem.src = "media/workstation.png";
    simDiv.appendChild(domElem);
    super(30, 20, posX, posY, domElem, simDiv);
  }

  addItem() {
    this.item = new Item(this.simDiv, this.posX, this.posY - 20);
  }
}

class Item extends SimElem {
  constructor(simDiv, posX, posY) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-item");
    domElem.src = "media/item.png";
    simDiv.appendChild(domElem);
    super(20, 20, posX, posY, domElem);
  }
}

var robot = new Robot(document.getElementById("simulatordiv"), 0, 0);
var station1 = new Station(document.getElementById("simulatordiv"), -75, -75);
var station2 = new Station(document.getElementById("simulatordiv"), 75, -75);
var station3 = new Station(document.getElementById("simulatordiv"), 0, 75);
station1.addItem();
