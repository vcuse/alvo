var robot = {
  width : 30,
  height : 30,
  posX : 0,
  posY : 0,
  carried : null,
  domElem : document.getElementById('sim-robot'),
  updatePosition : function() {
    this.domElem.style.top = (200 + this.posY - this.height / 2) + 'px';
    this.domElem.style.left = (200 + this.posX - this.width / 2) + 'px';
  },
  move : function(targetX, targetY) {
    anime({
      targets: robot,
      posX : targetX,
      posY : targetY,
      easing : 'linear',
      round: 1,
      update: function() {
        robot.updatePosition();
      }
    })
  }
}