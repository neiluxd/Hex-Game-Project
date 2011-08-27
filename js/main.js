// ..........
// SIXWAR Javascript
// ..........


// wait until document is loaded
alert ("test");

$(document).ready(function() {
		alert ("test");
		// check for canvas support
		startApp();
});


function startApp () {
	if (!canvasSupport()) {
			return;
	}else{
		alert ("test");
		// canvas features are present so start up the app
		greeting ();
}


function canvasSupport () {
	return Modernizr.canvas;
}

function greeting () {
	
	$("alertArea").html (
		'<p>Sixwar is a simple strategy game where you move your units around a board trying to eliminate the other player.</p>
		<br /><br />
		<p>To move a unit, click any hex with one of your armies in it, and click a destination hex.</p>
		<br /><br />
		<p>If the destination hex is occupied, the faction with the highest number of participating units wins control of the hex.</p>'
		);
	
	$("alertArea").dialog {
		title: "Welcome to Sixwar",
	}

}

function updateInfo (infoTitle, infoMsg) {
	
}

// function to load any content into center dialog
function buildDialog () {
	load: function () {
		$('#alertArea')
		.html(dialogStuff);
	}
}

// function to load any content into left content area
function buildButtons () {
	load: function () {
		$('#infoContent')
		.html(infoStuff);
	}
}
