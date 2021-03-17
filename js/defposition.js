var posOverlayElem;
var posStationElem;

function defPositionDialog(station) {
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
    stationpic.src = "media/workstation.png";
    stationpic.style.position = 'relative';
    stationpic.style.left = '-50%';
    stationpic.style.width = '280px';
    stationpic.style.height = '140px';
    stationpic.style.marginTop = '260px';
    posStationElem.appendChild(stationpic);
    /* var stationtext = document.createElement('span');
    stationtext.style.position = 'relative';
    stationtext.style.textAlign = 'center';
    stationtext.style.fontSize = '51pt';
    stationtext.style.left = '-50%';
    stationtext.innerHTML = station;
    stationtext.style.lineHeight = '1.1';
    posStationElem.appendChild(stationtext); */
    currentRightDiv.insertBefore(posOverlayElem, currentRightDiv.firstChild);
    currentRightDiv.insertBefore(posStationElem, currentRightDiv.firstChild);

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

var definedPositions = [];

function selectPosition(xPos, yPos) {
    var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName("Please enter a name for the new location:", defaultName,
      function(text) {
        if (text) {
          var existing =
              nameUsedWithAnyType(text, currentRightWorkspace);
          if (existing) {
            var msg = "A location with name '%1' already exists!".replace(
              '%1', existing.name);              
            Blockly.alert(msg,
                function() {
                  promptAndCheckWithAlert(text);  // Recurse
                });
          } else {
            // No conflict
            currentRightWorkspace.createVariable(text, '');
            var task = currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("TASK").getValue();
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
          }
        }
      });
  };
  promptAndCheckWithAlert('');
  posOverlayElem.remove();
  posStationElem.remove();
  posOverlayElem = null;
  posStationElem = null;
}
