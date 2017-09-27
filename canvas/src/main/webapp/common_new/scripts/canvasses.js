'use strict'

//canvasses defined in globals.js

canvasses.generateCanvasses = function(id, model_canvas) {
	var dimensions = this.getGlobalDimensions(model_canvas)
	var runtime = Runtime()
	var distances = []
	var distanceMap = {}
	var div = $("#" + id).get(0)
	var s = 0
	var max_distance = Number.NEGATIVE_INFINITY
	var width = dimensions.width
	var height = dimensions.height
	var top = dimensions.top
	var left = dimensions.left
	for (var key in runtime) {
		var rt_operation = runtime[key]
		if ("distance" in rt_operation) {
			distances.push(rt_operation.distance)
			max_distance = Math.max(max_distance, rt_operation.distance)
		}
	}
	canvasses.max_distance = max_distance

	distances.sort(function(a, b) {
		return a - b
	}).reverse()
	var zix = 1
	var prev_d = Number.MAX_VALUE;
	for (var ix in distances) {
		var dd = distances[ix]
		if (prev_d != dd) {
			distanceMap[dd] = zix
			zix++
			prev_d = dd
		}
	}
	for (var key in runtime) {
		var rt_operation = runtime[key]
		if ("usecanvas" in rt_operation) {
			var base_element = runtime[rt_operation.usecanvas]
			rt_operation["canvas"] = base_element.canvas
		} else if ("distance" in rt_operation) {
			var c = document.createElement("canvas")
			div.appendChild(c)
			c.setAttribute("class", "drawing_canvas")
			var zix = distanceMap[rt_operation.distance]
			c.id = key
			c.style.zIndex = zix
			c.width = width
			c.height = height
			c.style.position = "absolute"
			c.style.left = left + "px"
			c.style.top = top + "px"
			rt_operation["canvas"] = c
			this.addCanvas(c)
		}
	}
	$(".drawing_canvas").click(function(event) {
		canvasses.clickOnCanvas(event)
	})
	$(".drawing_canvas").mousemove(function(event) {
		canvasses.mousemoveOnCanvas(event)
	})
}

canvasses.addCanvas = function(canvas) {
	var canvas_map = CanvasMap()
	var zIx = canvas.style.zIndex
	var zMap
	if (zIx in canvas_map) {
		zMap = canvas_map[zIx]
	} else {
		zMap = {}
		canvas_map[zIx] = zMap
	}
	var canvasIx = Object.keys(zMap).length
	zMap[canvasIx] = canvas
}

canvasses.getGlobalDimensions = function(cm_id) {
	var model = $("#" + cm_id).get(0)
	var bnd = getBoundaries(model)
	return {
		width : bnd.width,
		height : bnd.height,
		top : bnd.top,
		left : bnd.left
	}
}


// Walk through canvases until non-transparent item found

canvasses.walkcanvasses = function(f) {
	var canvas_map = CanvasMap()
	var zKeys = Object.keys(canvas_map).sort().reverse()
	for (var zIx in zKeys) {
		var zKey = zKeys[zIx]
		var zMap = canvas_map[zKey]
		var oKeys = Object.keys(zMap).sort().reverse()
		for (var oIx in oKeys) {
			var oKey = oKeys[oIx]
			var canvas = zMap[oKey]
			if (f(canvas)) {
				return
			}
		}
	}
}

// This function is called when you click the canvas.

canvasses.clickOnCanvas = function(event) {
	event = event || window.event
	var x = event.clientX
	var y = event.clientY

	canvasses.walkcanvasses(function(src) {
		var dx = x - src.offsetLeft
		var dy = y - src.offsetTop

		var ctx = src.getContext("2d")

		var c = ctx.getImageData(dx, dy, 1, 1).data;

		if (canvasses.transparent(c)) {
			return false
		} else {
			var runtime = Runtime()
			var rt_operation = runtime[src.id]
			// Clicks ignored if handler not defined for visible layer
			if (rt_operation.events) {
				if (rt_operation.events.click) {
					rt_operation.events.click(rt_operation)
				}
			}
			if (debug) {
				console.log("click " + src.id)
			}
			return true
		}
	})
}

canvasses.mousemoveOnCanvas = function(event) {
	event = event || window.event
	var x = event.clientX
	var y = event.clientY

	this.walkcanvasses(function(src) {
		var id = src.id
		var dx = x - src.offsetLeft
		var dy = y - src.offsetTop

		var ctx = src.getContext("2d")

		var c = ctx.getImageData(dx, dy, 1, 1).data;

		if (canvasses.transparent(c)) {
			canvasses.overCanvas = ""
			return false
		} else {
			canvasses.overCanvas = src.id
			if (debug) {
				console.log("over " + src.id)
			}
			return true
		}
	})

}

canvasses.transparent = function(color) {
	var t = color[3]
	return t == 0
}