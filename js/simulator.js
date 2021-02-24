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
    super(50, 50, posX, posY, domElem, simDiv);
  }

  move(targetX, targetY) {
    var toMove = [this];
    if (this.carry) 
      toMove.push(this.carry);
    anime({
      targets: toMove,
      posX : targetX,
      posY : function(e, i) {
        return (i == 0) ? targetY : (targetY - 3);
      },
      easing : 'linear',
      round: 1,
      update: function() {
        toMove.map(i => i.render());
      }
    })
  }

  pickupFromStation(station, side) {
    if (!robot.isAtStation(station)) {
      console.error("Robot is not correctly positioned to pick up item from this station!");
      return;
    }
    if ((side == "left" && !station.leftItem) || (side == "right" && !station.rightItem) || (side != "left" && side != "right" && !station.centerItem)) {  
      console.error("Robot has nothing to pick up at this side of the current station!");
      return;
    }
    switch (side) {
      case "left":
        var item = station.leftItem;
        station.leftItem = null;
        break;
      case "right":
        var item = station.rightItem;
        station.rightItem = null;
        break;
      default:
        var item = station.centerItem;
        station.centerItem = null;
        break;
    }
    var robotX = this.posX;
    var robotY = this.posY;
    this.carry = item;
    this.domElem.src = "media/robot-carry.png";
    item.domElem.style.zIndex = "2";
    anime({
      targets: item,
      posX : robotX,
      posY : robotY - 3,
      easing : 'linear',
      round: 1,
      update: function() {
        item.render();
      }
    })
  }

  turnCarriedItem(direction) {
    if (!this.carry) {
      console.error("Robot is not currently holding an item!");
      return;
    }
    var item = this.carry;
    if (direction == "right") {
      item.turned += 90;
    }
    else {
      item.turned -= 90;
    }
    anime({
            targets: item.domElem,
            rotate: item.turned + 'deg',
            easing : 'linear',
            round: 1
      })
  }

  placeAtStation(station, side) {
    if (!robot.isAtStation(station)) {
      console.error("Robot is not correctly positioned to place item at this station!");
      return;
    }
    if (!station.isSideAvailable(side)) {  
      console.error("There already is an item at this station!");
      return;
    }
    var item = this.carry;
    switch(side) {
      case "left":
        station.leftItem = this.carry;
        anime({
          targets: item,
          posX : station.posX - 15,
          posY : station.posY - 24,
          easing : 'linear',
          round: 1,
          update: function() {
            item.render();
          },
          complete: function() {
            item.domElem.style.zIndex = "0";
          }
        })
        break;
      case "right":
        station.rightItem = this.carry;
        anime({
          targets: item,
          posX : station.posX + 15,
          posY : station.posY - 24,
          easing : 'linear',
          round: 1,
          update: function() {
            item.render();
          },
          complete: function() {
            item.domElem.style.zIndex = "0";
          }
        })
        break;
      default:
        station.centerItem = this.carry;
        anime({
          targets: item,
          posX : station.posX,
          posY : station.posY - 24,
          easing : 'linear',
          round: 1,
          update: function() {
            item.render();
          },
          complete: function() {
            item.domElem.style.zIndex = "0";
          }
        })
        break;
    }
    this.domElem.src = "media/robot.png";
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
  leftItem = null;
  rightItem = null;
  centerItem = null;

  constructor(simDiv, posX, posY) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-station");
    domElem.src = "media/workstation.png";
    simDiv.appendChild(domElem);
    super(60, 30, posX, posY, domElem, simDiv);
  }

  isSideAvailable(side) {
    switch (side) {
      case "left":
        if (this.leftItem || this.centerItem) 
          return false;
        break;
      case "right":
        if (this.rightItem || this.centerItem) 
          return false;
        break;
      default:
        if (this.leftItem || this.rightItem || this.centerItem)
          return false;
        break;
    }
    return true;
  }

  addItem(color, side) {
    if (!this.isSideAvailable(side)) {
      console.error("There already is an item at this side of the station!");
      return;
    }
    switch (side) {
      case "left":
        this.leftItem = new Item(this.simDiv, this.posX - 15, this.posY - 24, color);
        break;
      case "right":
        this.rightItem = new Item(this.simDiv, this.posX + 15, this.posY - 24, color);
        break;
      default:
        this.centerItem = new Item(this.simDiv, this.posX, this.posY - 24, color);
    }
  }
}

class Item extends SimElem {
  color = "white";
  turned = 0;

  constructor(simDiv, posX, posY, color) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-item");
    switch (color) {
      case "yellow":
        domElem.src = "media/item-yellow.png";
        break;
      case "orange":
        domElem.src = "media/item-orange.png";
        break;
      case "green":
        domElem.src = "media/item-green.png";
        break;
      case "blue":
        domElem.src = "media/item-blue.png";
        break;
      default:
        domElem.src = "media/item.png";
    }
    simDiv.appendChild(domElem);
    super(20, 20, posX, posY, domElem);
    this.color = color;
  }
}

var robot = new Robot(document.getElementById("simulatordiv"), 0, 0);
var station1 = new Station(document.getElementById("simulatordiv"), -75, -75);
var station2 = new Station(document.getElementById("simulatordiv"), 75, -75);
var station3 = new Station(document.getElementById("simulatordiv"), 0, 75);
station1.addItem("green", "left");
station1.addItem("orange", "right");
station3.addItem("blue", "center");


