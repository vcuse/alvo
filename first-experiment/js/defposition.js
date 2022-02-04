var posOverlayElem;
var posStationElem;

function defPositionDialog() {
  if (!posOverlayElem) {
    posOverlayElem = document.createElement('div');
    posOverlayElem.style.position = 'absolute';
    posOverlayElem.style.zIndex = '99';
    posOverlayElem.style.backgroundColor = '#999999';
    posOverlayElem.style.opacity = '50%';
    posOverlayElem.style.width = '100%';
    posOverlayElem.style.height = '100%';
    posStationElem = document.createElement('div');
    posStationElem.style.zIndex = '100';
    posStationElem.style.position = 'absolute';
    posStationElem.style.left = '50%';
    var stationpic = document.createElement('img');
    stationpic.src = pathPrefix + "media/workstation.png";
    stationpic.style.position = 'relative';
    stationpic.style.left = '-50%';
    stationpic.style.width = '280px';
    stationpic.style.height = '140px';
    stationpic.style.marginTop = '260px';
    posStationElem.appendChild(stationpic);
    var exittext = document.createElement('span');
    exittext.classList.add('exitButton')
    exittext.innerHTML = 'x';
    exittext.onclick = function () {
      posOverlayElem.remove();
      posStationElem.remove();
      posOverlayElem = null;
      posStationElem = null;
    }
    posStationElem.appendChild(exittext);
    if (currentRightDiv) { 
      currentRightDiv.insertBefore(posOverlayElem, currentRightDiv.firstChild);
      currentRightDiv.insertBefore(posStationElem, currentRightDiv.firstChild);
    }
    else {
      var leftDiv = document.getElementById('leftdiv');
      leftDiv.insertBefore(posOverlayElem, leftDiv.firstChild);
      leftDiv.insertBefore(posStationElem, leftDiv.firstChild);
    }

    var generateGrid = function(count) {
        var gridElem = document.createElement('div');
        gridElem.classList.add('positionGrid')
        gridElem.style.top = (-210 - 70 * count - 70 * Math.floor(count/3)) + 'px';
        gridElem.style.left = (-105 + 70 * (count % 3)) + 'px';
        gridElem.onclick = function () { selectPosition(count % 3, Math.floor(count/3)) };
        return gridElem;
    }

    for (i = 0; i < 9; i++) {
        posStationElem.appendChild(generateGrid(i));
    }
  }
}

function selectPosition(xPos, yPos) {
  var workspace = currentRightWorkspace || leftWorkspace;
  var promptAndCheckWithAlert = function(defaultName) {
  Blockly.Variables.promptName("Please enter a name for the new location:", defaultName,
    function(text) {
      if (text) {
        var existing = nameUsedWithAnyType(text, workspace);
        if (existing) {
          var msg = "A location with name '%1' already exists!".replace(
            '%1', existing.name);              
          Blockly.alert(msg,
              function() {
                promptAndCheckWithAlert(text);  // Recurse
              });
        } else {
          // No conflict
          workspace.createVariable(text, '');
          var taskHeader = workspace.getAllBlocks().find(block => block.type == 'custom_taskheader');
          var task = taskHeader ? taskHeader.getField("TASK").getValue() : 'DEFAULT';
          if (!definedPositions[task])
              definedPositions[task] = [];
          switch (xPos) {
              case 0:
                definedPositions[task][text] = '"left",' + yPos;
                break;
              case 1:
                definedPositions[task][text] = '"center",' + yPos;
                break;
              case 2:
                definedPositions[task][text] = '"right",' + yPos;
                break;
          }
          posOverlayElem.remove();
          posStationElem.remove();
          posOverlayElem = null;
          posStationElem = null;
        }
      }
    });
  };
  var posDefaultName;
  switch (yPos) {
    case 0:
      posDefaultName = 'bottom';
      break;
    case 1:
      posDefaultName = 'middle';
      break;
    case 2:
      posDefaultName = 'top';
      break;
  }
  switch (xPos) {
    case 0:
      posDefaultName += ' left';
      break;
    case 1:
      posDefaultName += ' center';
      break;
    case 2:
      posDefaultName += ' right';
      break;
  }
  promptAndCheckWithAlert(posDefaultName);
}
