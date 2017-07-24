'use strict'

var debug = false

var drift = [ -.3, 0 ]

var sizes = {

}

if(!configuration){
	var configuration = {}
}

function linkTo(url) {
	location.href = url;
}

function createMenuButtons(m, defs) {
	for ( var buttonName in defs) {
		addMenuButtonFromDef(m,buttonName, defs[buttonName])
		m.ix++
	}
}

function addMenuButtonFromDef(m, button, def) {
	var files = def.files
	var action = def.action
	var position = def.position
	var events = def.events
	var size = def.size
	var show = true
	if (def.show) {
		var show = def.show
	}
	
	var hasOver
	
	// Defaults to true
	
	if("has_over" in def){
		hasOver =  def.has_over
	} else {
		hasOver = true
	}
	
	var distance = 1
	addMenuButton(m, button, files, size, action, position, events, hasOver, distance,
			show, null)
}

function disableButton(button) {
	if(button in configuration){
		var btn = configuration[button]
		delete configuration[button+"_over"]
		btn.events = {}
	}
}

function addMenuButton(m, button, files, size, action, position, events, hasOver,
		distance, show, overlays) {
	if (configuration[button]) {
		throw new Error("Configuration problem: '" + button
				+ "' defined multiple times")
	}
	configuration[button] = {}
	var btn = configuration[button]

	// distance

	btn["distance"] = distance

	// align

	btn["align"] = [ "left", "top" ]

	// show

	btn["show"] = show
	
	// size
	
	if(size){
		btn["size"] = size
	}

	// image

	var baseImage
	var overlay_image

	if (files) {
		if (Array.isArray(files)) {
			if (files.length > 0) {
				baseImage = files[0]
			}
			if (files.length > 1) {
				overlay_image = files[1]
				hasOver = true
			}
		} else {
			if (typeof files == "string") {
				baseImage = files
			}
		}
	}

	if (!baseImage) {
		baseImage = button + ".svg"
	}

	if (hasOver) {
		if (!overlay_image) {
			overlay_image = button + "_over.svg"
		}
	}

	btn["image"] = baseImage

	// events

	if (events) {
		btn["events"] = events
	}

	btn["operation"] = {}

	var operation = btn.operation

	// is overlay

	if (overlays) {
		operation["show"] = {}
		show = operation.show
		show["canvas"] = []
		show.canvas.push(button)
		show.canvas.push(overlays)
	}

	operation["fixed"] = {}
	var fixed = operation.fixed

	// position

	var x, y
	if (!position || !Array.isArray(position) || position.length != 2) {
		x = m.positionStart[0] + m.ix * m.positionIncr[0]
		y = m.positionStart[1] + m.ix * m.positionIncr[1]
	} else {
		x = position[0]
		y = position[1]
	}
	fixed["position"] = [ x, y ]

	// done?
	if (!hasOver) {
		return

	}

	var overlay_name = button + "_over"
	
	operation["show_overlay"] = {}
	operation.show_overlay.canvas = [overlay_name]
	
	addMenuButton(m,overlay_name, overlay_image, size, action, [ x, y ], events, false,
			distance - 0.1, false, button)

}
