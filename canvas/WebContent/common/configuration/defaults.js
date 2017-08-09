var defaults = {
	canvascontainer : "canvasses",
	canvasmodel : "model",
	resources : "../resources/",
	common: "../../../canvas/common/",
}

defaults.imageLoc = defaults.resources + "images/"
defaults.audioLoc = defaults.resources + "audio/"

function include(loc){
	document.write('<script src="'+loc+'"><\/script>')
}