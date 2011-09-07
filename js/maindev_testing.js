// ..........
// SIXWAR Main Javascript - TEST SCRIPT
// ..........


// Load the doc fully before starting

$(document).ready(function() {

		// check for canvas support, then show greeting, then build map
		checkCanvas();
});

// ---------- MAIN GAME LOOP ---------- 

function mainLoop () {
	
	// LISTEN: MOUSE MOVE
	
	$("#clickcanvas").mousemove(function(e){
		tempX = e.pageX;
		tempY = e.pageY;
		
		// apply mouse pointer offset from actual canvas position
		tempX = tempX - 155;
	  	tempY = tempY - 80;
	
		highlightHexs(tempX,tempY);
	});
	
	// LISTEN: MOUSE CLICK
	
	$("#clickcanvas").click(function(){
		attemptMove ();
	});
		
	// END TURN BUTTON
	
	$('#infoContent').append (
		"<button id='endTurnButton' style='position:absolute; left: 53px; top: 90px;'>End Turn</button>"
	);
	
	$('#endTurnButton').button();
	$('#endTurnButton').click(function()
		{
		hideMsgSide();
		nextTurn();
		}
	);

}

// ------------------------------------ 

function checkCanvas () {
	var yesCanvas = Modernizr.canvas;
	if (yesCanvas != true) {
		alert ("Your browser is not HTML5-compatible");
		}else{
		// canvas features are present so start up the app
		greeting ();
		initFog();
		}
}

function greeting () {
	$('#alertArea').append (
			'<img src="img/greetings.png" width="575" height="95"/><br /><br /><b>Sixwar is a simple strategy game</b> where you move your units around a board trying to eliminate the other player.<br /><br />RULES<br /><ul><li>To move a unit, click any hex with one of your armies in it, and click a destination hex.<li>You must leave at least one unit in an occupied hex, so hexes with only one unit are not eligible for movement.<li>When you are finished moving, press the End Turn button to allow your opponent to move.</ul>COMBAT<br />If the destination hex is occupied, the faction with the highest number of participating units wins control of the hex.<br /><br />REINFORCEMENTS<br/>At the end of each turn, each occupied hex generates an additional army.<br /><br />WINNING<br />A player wins the round if the opposing player no longer has any units to move.'
	);

	$('#alertArea').dialog ({
		title: "Welcome to Sixwar",
		draggable: false,
		position: [140, 55],
		minHeight: 100,
		minWidth: 600,
		dialogClass: "noDialogClose",
		resizable: false,
		modal: false,
		
		buttons: { "Start Playing": function() { 
			$(this).dialog("close");
			gameBoardSetup ();
			
			// send first player turn msg to sidebar
			showMsgSide ("<img src='img/gemRed.png' style='float:left; margin: 0 10px 0 0;'/><b>Player 1 Turn</b>");
			}},
	});
}

// Collision Function

function inHex(checkX, checkY, cx, cy, r) {
	// check collision
    var overlapX = checkX - cx;
    var overlapY = checkY - cy;
    var overlapR = r + 25; // make the pointer location a bit 'fatter' to help detection
    return ((overlapX*overlapX+overlapY*overlapY <= overlapR*overlapR) && (hexData[moveHex][0] != null));
}


// ...........
// Initialize Game Data
// ...........

var playerIndex=3;
var opponentIndex=4;
var moveFromHex=-1;
var moveToHex=-1;
var hexSelected=-1;
var potentialHexes=new Array();

// new vars to define commonly-used coordinates for every canvas layer
var canvY = 202;
var canvX = 59;
var canvWidth = 500;
var canvHeight = 500;

var hexRadius = 26;

// Initial Map Data (by hex) 
// format = [type, x location, y location, armyAIndex, ArmyBIndex, adjacency, centrX, centrY]

// Total number of hexes
var totHex = 19; // order 3 has 19 hexes

hexData = [
   		[null, canvX+75, canvY-129, 0,3,[1,3,4],255,120] // 			hex 1
   	,	[null, canvX+155, canvY-129, 0,0,[0,2,4,5],335,120] // 			hex 2
   	,	[null, canvX+235, canvY-129, 0,0,[1,5,6],415,120] // 			hex 3
   	
   	,	[null, canvX+35, canvY-61, 0,0,[0,4,7,8],215,190] // 			hex 4
   	,	[null, canvX+115, canvY-61, 0,0,[0,1,3,5,8,9],295,190] // 		hex 5
   	,	[null, canvX+195, canvY-61, 0,0,[1,2,4,6,9,10],375,190] // 		hex 6
   	,	[null, canvX+275, canvY-61, 0,0,[2,5,10,11],455,190] // 		hex 7
   	
   	,	[null, canvX-5, canvY+7, 0,0,[3,8,12],175,260] // 				hex 8	
   	,	[null, canvX+75, canvY+7, 0,0,[3,4,7,9,12,13],255,260] // 		hex 9
   	,	[null, canvX+155, canvY+7, 0,0,[4,5,8,10,13,14],335,260] // 	hex 10
   	,	[null, canvX+235, canvY+7, 0,0,[5,6,9,11,14,15],415,260] // 	hex 11
   	,	[null, canvX+315, canvY+7, 0,0,[6,10,15],495,260] // 			hex 12
   		
   	,	[null, canvX+35, canvY+75, 0,0,[7,8,13,16],215,325] // 			hex 13
   	,	[null, canvX+115, canvY+75, 0,0,[8,9,12,14,16,17],295,325] // 	hex 14
   	,	[null, canvX+195, canvY+75, 0,0,[9,10,13,15,17,18],375,325] // 	hex 15
   	,	[null, canvX+275, canvY+75, 0,0,[10,11,14,18],455,325] // 		hex 16
   	
   	,	[null, canvX+75, canvY+143, 0,0,[12,13,17],255,390] // 			hex 17
   	,	[null, canvX+155, canvY+143, 0,0,[13,14,16,18],335,390] // 		hex 18
   	,	[null, canvX+235, canvY+143, 3,0,[14,15,17],415,390] // 		hex 19
   	];

// Terrain data for each hex type (note, some are duplicates due to hex frequency)
// format = [name, movement cost, def bonus, atk bonus]

terrainData = [
		["Deep Water", 5, 0, 2] //		Deep Water Hex
	,	["Shallow Water", 3, 1, 1] //	Shallow Water Hex
	,	["Grassland", 1, 0, 1] //		Grass Hex 1
	,	["Grassland", 1, 0, 1] //		Grass Hex 2
	,	["Grassland", 1, 0, 1] //		Grass Hex 3
	,	["Grassland", 1, 0, 1] //		Grass Hex 4
	,	["Grassland", 1, 0, 1] //		Grass Hex 5
	,	["Mountains", 4, 5, 3] //		Mountain Hex 1
	,	["Mountains", 4, 5, 3] //		Mountain Hex 2
	,	["Desert", 2, 1, 0] //			Desert Hex	
	];

// Shared fog of war position data
// format = [X position, Y position, adjHex data]

fogGenData = [
   		[canvX+75, canvY-129, [1,3,4] ] // 			hex 1
   	,	[canvX+155, canvY-129, [0,2,4,5] ] // 		hex 2
   	,	[canvX+235, canvY-129, [1,5,6] ] // 		hex 3
   	
   	,	[canvX+35, canvY-61, [0,4,7,8] ] // 		hex 4
   	,	[canvX+115, canvY-61, [0,1,3,5,8,9] ] // 	hex 5
   	,	[canvX+195, canvY-61, [1,2,4,6,9,10] ] // 	hex 6
   	,	[canvX+275, canvY-61, [2,5,10,11] ] // 		hex 7
   	
   	,	[canvX-5, canvY+7, [3,8,12] ] // 			hex 8	
   	,	[canvX+75, canvY+7, [3,4,7,9,12,13] ] // 	hex 9
   	,	[canvX+155, canvY+7, [4,5,8,10,13,14] ] // 	hex 10
   	,	[canvX+235, canvY+7, [5,6,9,11,14,15] ] // 	hex 11
   	,	[canvX+315, canvY+7, [6,10,15] ] // 		hex 12
   		
   	,	[canvX+35, canvY+75, [7,8,13,16] ] // 		hex 13
   	,	[canvX+115, canvY+75, [8,9,12,14,16,17] ] //hex 14
   	,	[canvX+195, canvY+75, [9,10,13,15,17,18] ]//hex 15
   	,	[canvX+275, canvY+75, [10,11,14,18] ] // 	hex 16
   	
   	,	[canvX+75, canvY+143, [12,13,17] ] // 		hex 17
   	,	[canvX+155, canvY+143, [13,14,16,18] ] // 	hex 18
   	,	[canvX+235, canvY+143, [14,15,17] ] // 		hex 19
   	];

function gameBoardSetup () {
	// ------- 1. create map
	
	var canvasMap = $("#canvas")[0];
	var contextMap = canvasMap.getContext("2d");
	
	//contextOne.width = contextOne.width;

	var newHexPart = new Image();
	newHexPart.src = "img/hexTray5.png";
	newHexPart.addEventListener('load', function () {
			buildMap (contextMap,newHexPart);
			}, false);
	
	// ------- 2. place starting units
	clearHighlights();
	
	// ------- 3. jump to the main game loop
	mainLoop ();
}
	
function buildMap (contextMap, newHexPart) {
	// Run loop once for each hex

	for (putHex=0; putHex<=totHex-1; putHex++) {
		
	// Choose a hex type

		hexType = (Math.floor(Math.random()*10)*80); // 5 hex types * freqency
		
	// Place the hex
	
		hexPosX = hexData[putHex][1];
		hexPosY = hexData[putHex][2];
	
		contextMap.drawImage (newHexPart, hexType, 0, 80, 90, hexPosX, hexPosY, 80, 90);
	
		// Update array with the generated type value to act as the game data
	
		hexData [putHex][0] = hexType;	
	}
}

// Init fog of war arrays with all hexes as hidden

function initFog () {
	fogPlayer1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160];
	fogPlayer2 = [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
	// set the fog layers to hidden (only show on specific player turn)
	$('#fogCanvas1').show(); // red player starts game
	$('#fogCanvas2').hide();
	
	// draw the starting fog states
	
		// P1 Fog

		var canvasFog1 = $("#fogCanvas1")[0];
		var contextFog1 = canvasFog1.getContext("2d");
		
		var fogPart = new Image();
		fogPart.src = "img/fogHexes.png";
		fogPart.addEventListener('load', function() {
			buildFog (contextFog1, fogPart, fogPlayer1);
			}, false);
		
		// P2 Fog
		var canvasFog2 = $("#fogCanvas2")[0];
		var contextFog2 = canvasFog2.getContext("2d");
	
		var fogPart = new Image();
		fogPart.src = "img/fogHexes.png";
		fogPart.addEventListener('load', function() {
			buildFog (contextFog2, fogPart, fogPlayer2);
			}, false);
}

function fogOfWar () {
	
	// update fog hexes
	for (fogInHex=0; fogInHex<=totHex-1; fogInHex++) {
	
		var oneFogClear = hexData[fogInHex][3];
		var twoFogClear = hexData[fogInHex][4];
		var oneFogHalf = hexData[fogInHex][5];
		
		//alert ("fog function: " + fogInHex + " and army: " + oneFogClear);
		
		if (oneFogClear>0) {
			
			fogPlayer1[fogInHex] = 160; // place clear hex (no fog)
			
			//alert ("adj fog detected: hex " + fogInHex + " is being updated to " + fogPlayer1[fogInHex]);
			
			//for (whichHalf=0, whichHalf<oneFogHalf.length, whichHalf++) {
				//drawHalfFog = oneFogHalf[whichHalf];
				//fogPlayer1[drawHalfFog] = 80;
			//}
			
		//}else{
			//fogPlayer1[fogInHex] = 0;   // place hidden hex (full fog)
		}
		
		if (twoFogClear>0) {
			
			fogPlayer2[fogInHex] = 160; // place clear hex (no fog)
		}

	}
	
	// draw P1 Fog

	var canvasFog1 = $("#fogCanvas1")[0];
	var contextFog1 = canvasFog1.getContext("2d");
	
	var fogPart = new Image();
	fogPart.src = "img/fogHexes.png";
	fogPart.addEventListener('load', function() {
		buildFog (contextFog1, fogPart, fogPlayer1);
		}, false);
		
	// draw P2 Fog

	var canvasFog2 = $("#fogCanvas2")[0];
	var contextFog2 = canvasFog2.getContext("2d");

	var fogPart = new Image();
	fogPart.src = "img/fogHexes.png";
	fogPart.addEventListener('load', function() {
		buildFog (contextFog2, fogPart, fogPlayer2);
		}, false);
}

function buildFog (fogContext, fogPart, fogPlayer) {
	
	// need to clear old fog layer
	fogContext.clearRect(0, 0, 500, 500);
	
	for (fogInHex=0; fogInHex<=totHex-1; fogInHex++) {

	fogPosX = hexData[fogInHex][1];
	fogPosY = hexData[fogInHex][2];

	fogContext.drawImage (fogPart, fogPlayer[fogInHex], 0, 80, 90, fogPosX, fogPosY, 81, 91);
	}
}

function nextTurn () {	
	  	if(playerIndex>3)
		{
	    	playerIndex=3;
	    	opponentIndex=4;
	
			// flip fog of war to red player
			$('#fogCanvas1').show();
			$('#fogCanvas2').hide();
			
			// update player message
			showMsgSide ("<img src='img/gemRed.png' style='float:left; margin: 0 10px 0 0;'/><b>Player 1 Turn</b>");		

	  	}else{

	    	playerIndex=4;
	    	opponentIndex=3;
	
			// flip fog of war to blue player
			$('#fogCanvas1').hide();
			$('#fogCanvas2').show();
			
			// update player message
			showMsgSide ("<img src='img/gemBlue.png' style='float:left; margin: 0 10px 0 0;'/><b>Player 2 Turn</b>");
			
	  	}

		// Adds +1 army to each occupied hex
	  	for (armHex=0; armHex<=totHex-1; armHex++)
		{
	    	if(hexData[armHex][playerIndex]>0)
			{
	      	hexData[armHex][playerIndex]=hexData[armHex][playerIndex]+1;
	    	}
	  	}
	  	drawArmy();
		fogOfWar();
}

	
function showMsgSide (theMsg) {
		//alert (theMsg);
		$('#leftPop').html (theMsg);
		$('#leftPop').dialog ({
			position: [14, 70],
			height: 45,
			width: 170,
			dialogClass: "noDialogTitle",
			resizable: false,
			show: "slide",
			showOpt: {direction:'left'}
		});
}

function hideMsgSide () {
	$('#leftPop').dialog ("destroy");
}

	
function showMsgCenter (theMsg) {		
}

function drawArmy() {
	
	fogOfWar ();
	
	var canvasArmies = $("#armies")[0];
	var contextArmies = canvasArmies.getContext("2d");
	
	// Clear canvas if they hit it again
		
        contextArmies.clearRect(0, 0, 800, 600);
		
        contextArmies.font = "13px sans-serif";
        contextArmies.fillStyle = "white";
        contextArmies.textBaseline = "top";
		
        for (armHex=0; armHex<=totHex-1; armHex++)
		{
			// change these two values to move the hex labels as a group
			var unitTagOffsetX = 59;
			var unitTagOffsetY = 49;
			
			var troops=0;
			var unitTagX = hexData[armHex][1]+unitTagOffsetX;
			var unitTagY = hexData[armHex][2]+unitTagOffsetY;
			var unitCircX = unitTagX+4;
			var unitCircY = unitTagY+7;
			      
		  if (hexData[armHex][3]>0)
		  {
            troops=hexData[armHex][3];
			contextArmies.fillStyle = "#9E2620";  // red circle	
			contextArmies.beginPath();
			contextArmies.arc(unitCircX, unitCircY, 12, 0, Math.PI*2, true);
			contextArmies.closePath();
			contextArmies.fill();
			
          }else if (hexData[armHex][4]>0){
            troops=hexData[armHex][4];
            contextArmies.fillStyle = "#2B4FAA"; // blue circle
			contextArmies.beginPath();
			contextArmies.arc(unitCircX, unitCircY, 12, 0, Math.PI*2, true);
			contextArmies.closePath();
			contextArmies.fill();
			
          }else{
        	troops=0;
            contextArmies.fillStyle = "#1E2020"; // dark gray circle (neutral hexes)
			contextArmies.beginPath();
			contextArmies.arc(unitCircX, unitCircY, 12, 0, Math.PI*2, true);
			contextArmies.closePath();
			contextArmies.fill();
          }
		  
		  	//contextArmies.globalAlpha = 0.7;
		    contextArmies.fillStyle = "white";
          	contextArmies.fillText(troops, unitTagX, unitTagY);		
        }
}

function clearHighlights() {
		var canvasHighlights = $("#highlights")[0];
		var contextHighlights = canvasHighlights.getContext("2d");
		contextHighlights.clearRect(0, 0, 800, 600);
		potentialHexes=[];
		moveFromHex=-1;
		moveToHex=-1;
		hexSelected=-1;
	
		drawArmy();
		return true;
}
	
function highlightHexs(tempX,tempY) {
	
		// every time mouse moves, remove the old highlight by clearing the highlight canvas
		var canvasHighlights = $("#highlights")[0];
		var contextHighlights = canvasHighlights.getContext("2d");
		contextHighlights.clearRect(0, 0, 800, 600);

		if(moveToHex>0){ //Clear all the highlights after a move.
			moveToHex=-1;
			moveFromHex=-1;
			potentialHexes=[];
		}

	  for (moveHex=0; moveHex<=totHex-1; moveHex++)
	  {	  
		  if (inHex (tempX,tempY,hexData[moveHex][6],hexData[moveHex][7],hexRadius))
		  {  
		    // update the infobox
		    showHexStats (moveHex);

			if(moveHex!=hexSelected && moveFromHex==-1){
			    potentialHexes=[];
			}
			if(hexSelected!=moveHex && moveFromHex==-1){
				potentialHexes=[];
			}
			hexSelected=moveHex;

			//Identify valid opponent hexes
			// Only change the highlighted adjacent hexes if there is not a move in progress

			if(moveFromHex==-1){
				numAdjHex = hexData[moveHex][5].length
				for (adjHexIndex=0;adjHexIndex<numAdjHex;adjHexIndex++ )
				{
				  adjHex=hexData[moveHex][5][adjHexIndex];

				  if(hexData[moveHex][playerIndex] > (hexData[adjHex][opponentIndex]+1))
				  {
					potentialHexes.push(adjHex);
				  }
			}}}}
			
	  		applyHighlights();
}
	
function applyHighlights() {
		var canvasHighlights = $("#highlights")[0];
		var contextHighlights = canvasHighlights.getContext("2d");
		contextHighlights.clearRect(0, 0, 800, 600);

		var newHexAdjOutline = new Image();
		newHexAdjOutline.src = "img/hexlight_r.png";

		for (adjHexIndex=0;adjHexIndex<potentialHexes.length;adjHexIndex++ )
		{
				adjHex=potentialHexes[adjHexIndex];
			    contextHighlights.drawImage(newHexAdjOutline, 0, 0, 80, 90, hexData[adjHex][1], hexData[adjHex][2], 80, 90);
		}		
		var newHexSelectedOutline = new Image();
		newHexSelectedOutline.src = "img/hexlight.png";
		if(hexSelected>-1 && (moveFromHex==-1)){
			contextHighlights.drawImage(newHexSelectedOutline, 0, 0, 80, 90,
				hexData[hexSelected][1], hexData[hexSelected][2], 80, 90);
		}

		var newMoveFromHexOutline = new Image();
	    newMoveFromHexOutline.src = "img/hexlight_halo.png";
	    if(moveFromHex>-1){
			contextHighlights.drawImage(newMoveFromHexOutline, 0, 0, 80, 90,
				hexData[moveFromHex][1], hexData[moveFromHex][2], 80, 90);
		}

		var newMoveToHexOutline = new Image();
		newMoveToHexOutline.src = "hexlight_halo.png";
		if(moveToHex>-1){
			contextHighlights.drawImage(newMoveToHexOutline, 0, 0, 80, 90,
				hexData[moveToHex][1], hexData[moveToHex][2], 80, 90);
		}
}

function showHexStats (hexStat) {
	
	// target the stat layer: for hex thumbnail
	var canvasStatHex = $("#infoLayer")[0];
	var contextStatHex = canvasStatHex.getContext("2d");
	
	// target the stat layer: for hex info
	var canvasStatText = $("#textLayer")[0];
	var contextStatText = canvasStatText.getContext("2d");
	
	var newHexPart = new Image();
	newHexPart.src = "img/hexTray5.png";
	
	// Clear out previous stat layers

	contextStatHex.clearRect(0, 0, 159, 100);
	contextStatText.clearRect(0, 0, 159, 100);
	
	// check to see if hex is fogged
	
	
	// draw a mini version of the hex type in the infobox, using the hex type saved when the map was generated
	contextStatHex.drawImage(newHexPart, hexData[hexStat][0], 0, 80, 90, 20, 42, 27, 30);
	
	// write out the terrain value from the terrainData table
	var terrainIndex = hexData[hexStat][0]/80;
	
	// Terrain Name
    contextStatText.font = "20px Arial";
    contextStatText.fillStyle = "white";
    contextStatText.textBaseline = "top";
	contextStatText.fillText(terrainData[terrainIndex][0], 20, 15);
		
	// Movement points, Defense and Attack Bonuses
    contextStatText.font = "italic 12px Georgia";
    contextStatText.fillStyle = "#727272";
    contextStatText.textBaseline = "top";

	// determine whether modifier is positive or negative
	var defPos = terrainData[terrainIndex][3];
	var attPos = terrainData[terrainIndex][2];
	
	if (defPos>=0) {
		var defVal = "+"
	}else{
		var defVal = "-"
	}
	
	if (attPos>=0) {
		var attVal = "+"
	}else{
		var attVal = "-"
	}
	
	contextStatText.fillText(attVal + terrainData[terrainIndex][3] + " Attack", 60, 42);
	contextStatText.fillText(defVal + terrainData[terrainIndex][2] + " Defense", 60, 57);

}

function attemptMove(e) {	
		// Have I click on the selected hex again? if so deselect
		if(moveFromHex==hexSelected){
		  moveFromHex=-1;
		}else if(moveFromHex>-1 && hexData[hexSelected][playerIndex]>0 && potentialHexes.length >0){
			moveToHex=hexSelected
		}else if(hexData[hexSelected][playerIndex]>0 && potentialHexes.length >0)//Is this my hex and are there hexes to move to.
		{
			moveFromHex=hexSelected;				
		}else if(potentialHexes.indexOf(hexSelected)>=0){
			moveToHex=hexSelected
		}
		resolveCombat();
		// If I have already selected a hex is this a valid adjacent hex?
}
	
function resolveCombat() {
		hexData[moveToHex][playerIndex]=(hexData[moveFromHex][playerIndex]-1)-hexData[moveToHex][opponentIndex]+hexData[moveToHex][playerIndex];
		hexData[moveFromHex][playerIndex]=1;
		hexData[moveToHex][opponentIndex]=0;
		drawArmy();
		moveFromHex=-1;
		moveToHex=-1;
		hexSelected=-1;
		potentialHexes=[];
		czechForVictory();
}
	
function czechForVictory() {
		var opponentTroops=0;
		for (i=0;i<hexData.length;i++ )
		{
			opponentTroops=opponentTroops+hexData[i][opponentIndex];
		}
		if(opponentTroops==0){
			alert("You Win!");
		}
}