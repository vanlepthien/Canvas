'use strict'

// canvasses defined in globals.js

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
	for ( var key in runtime) {
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
	for ( var ix in distances) {
		var dd = distances[ix]
		if (prev_d != dd) {
			distanceMap[dd] = zix
			zix++
			prev_d = dd
		}
	}
	
	for ( var key in runtime) {
		var rt_operation = runtime[key]
		if ("usecanvas" in rt_operation) {
			var base_element = runtime[rt_operation.usecanvas]
			rt_operation["canvas"] = base_element.canvas
		} else if ("distance" in rt_operation) {
			var c = document.createElement("canvas")
			div.appendChild(c)
			if(Modernizr.objectfit ){
				// Edge 16 only does object-fit for img, not canvas, but Modernizr
				// doesn't catch it, so we have to figure out if we have Edge.
				var ua = navigator.userAgent
				if(ua.includes("Edge/")){
					c.setAttribute("class", "edge-browser drawing_canvas")
				}else{
					c.setAttribute("class", "no-edge-browser drawing_canvas")
				}
			} else {
				// no-objectfix will be set for other browsers
				c.setAttribute("class", "drawing_canvas")
			}
			var zix = distanceMap[rt_operation.distance]
			c.id = key
			c.style.zIndex = zix
			c.width = width
			c.height = height
			c.style.position = "absolute"
			c.style.left = left + "px"
			c.style.top = top + "px"
			rt_operation.canvas = c
			this.addCanvas(c)
			// $(c).click(function(event){
			// canvasses.clickOnThisCanvas(event)
			// })
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

canvasses.screenToCanvasPosition = function(canvas, x, y) {
	var clientWidth = canvas.clientWidth
	var clientHeight = canvas.clientHeight
	var widthRatio = canvas.width / clientWidth
	widthRatio = widthRatio > 1 ? widthRatio : 1
	var heightRatio = canvas.height / clientHeight
	heightRatio = heightRatio > 1 ? heightRatio : 1
	var ratio = Math.max(widthRatio, heightRatio)
	var canvasCenterX = canvas.width / 2
	var canvasCenterY = canvas.height / 2
	var clientCenterX = clientWidth / 2
	var clientCenterY = clientHeight / 2
	var newX = (x - clientCenterX) * ratio + canvasCenterX
	var newY = (y - clientCenterY) * ratio + canvasCenterY
	if(newX < 0 || newX > canvas.width){
		return undefined
	}
	if(newY < 0 || newY > canvas.height){
		return undefined
	}
	return [ newX, newY ]
}

canvasses.getBoundaries = function(htmlElement) {
	var rect = htmlElement.getBoundingClientRect();
	return {
		left : rect.left + window.scrollX,
		top : rect.top + window.scrollY,
		right : rect.right - window.scrollX,
		bottom : rect.bottom - window.scrollY,
		width : rect.width - (2 * window.scrollX),
		height : rect.height - (2 * window.scrollY)
	}
}

canvasses.getGlobalDimensions = function(cm_id) {
	var model = $("#" + cm_id).get(0)
	var bnd = this.getBoundaries(model)
	var heightRatio = model.clientHeight / model.height
	heightRatio = heightRatio > 1 ? 1 : heightRatio
	var widthRatio = model.clientWidth / model.width
	widthRatio = widthRatio > 1 ? 1 : widthRatio
	var ratio = Math.min(heightRatio, widthRatio)

	return {
		width : bnd.width,
		height : bnd.height,
		top : bnd.top,
		left : bnd.left,
		ratio : ratio
	}
}

canvasses.getScaledPosition = function(x, y, screenWidth, screenHeight, ratio) {
	var nominalWidth = screenWidth * ratio
	var nominalHeight = screenHeight * ratio
	var canvasCenterX = screenWidth / 2
	var canvasCenterY = screenHeight / 2
	var nominalCenterX = nominalWidth / 2
	var nominalCenterY = nominalHeight / 2
	var scaledX = (x - screenCenterX) * ratio + nominalCenterX
	var scaledY = (y - screenCenterY) * ratio + nominalCenterY
}

// Walk through canvases until non-transparent item found

canvasses.walkcanvasses = function(f) {
	var canvas_map = CanvasMap()
	var zKeys = Object.keys(canvas_map).sort().reverse()
	for ( var zIx in zKeys) {
		var zKey = zKeys[zIx]
		var zMap = canvas_map[zKey]
		var oKeys = Object.keys(zMap).sort().reverse()
		for ( var oIx in oKeys) {
			var oKey = oKeys[oIx]
			var canvas = zMap[oKey]
			if (f(canvas)) {
				return

			}
		}
	}
}

canvasses.clickOnThisCanvas = function(event) {
	var runtime = Runtime()
	var rt_operation = runtime[this.id]
	if (rt_operation.events) {
		if (rt_operation.events.click) {
			rt_operation.events.click(rt_operation)
		}
	}
	if (debug) {
		console.log("click " + src.id)
	}
}

// This function is called when you click the canvas.

canvasses.clickOnCanvas = function(event) {
	event = event || window.event
	var screenX = event.clientX
	var screenY = event.clientY

	canvasses.walkcanvasses(function(src) {
		
		var xy = canvasses.screenToCanvasPosition(src, screenX, screenY)
		
		if(xy == undefined){
			return false
		}
		
		var x = xy[0]
		var y = xy[1]
				
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

canvasses.mouseEnter = function(event) {
	event = event || window.event
	var screenX = event.clientX
	var screenY = event.clientY

	canvasses.walkcanvasses(function(src) {
		
		var xy = canvasses.screenToCanvasPosition(src, screenX, screenY)
		
		if(xy == undefined){
			return false
		}
		
		var x = xy[0]
		var y = xy[1]
				
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
				if (rt_operation.events.mouseenter) {
					rt_operation.events.mouseenter(rt_operation)
				}
			}
			if (debug) {
				console.log("click " + src.id)
			}
			return true
		}
	})
}

canvasses.mouseLeave = function(event) {
	event = event || window.event
	var screenX = event.clientX
	var screenY = event.clientY

	canvasses.walkcanvasses(function(src) {
		
		var xy = canvasses.screenToCanvasPosition(src, screenX, screenY)
		
		if(xy == undefined){
			return false
		}
		
		var x = xy[0]
		var y = xy[1]
				
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
				if (rt_operation.events.mouseleave) {
					rt_operation.events.mouseleave(rt_operation)
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
	var screenX = event.clientX
	var screenY = event.clientY

	this.walkcanvasses(function(src) {
		var xy = canvasses.screenToCanvasPosition(src, screenX, screenY)
		
		if(xy == undefined){
			return false
		}
		
		var x = xy[0]
		var y = xy[1]
		
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
				var xx = Math.round(x)
				var yy = Math.round(y)
				var screenXX = Math.round(screenX)
				var screenYY = Math.round(screenY)
				console.log("over " + src.id + " x="+xx+" y="+yy+" screenX="+screenXX+" screenY="+screenYY)
			}
			var runtime = Runtime()
			var rt_operation = runtime[src.id]
			if (rt_operation.events) {
				if (rt_operation.events.mouseenter) {
					rt_operation.events.mouseenter(rt_operation)
					canvasses.mouseenter_operation = rt_operation
					canvasses.mouseenter_state = true
				} else {
					if(canvasses.mouseenter_state){
						if(canvasses.mouseenter_operation.events.mouseleave){
							canvasses.mouseenter_operation.events.mouseleave(canvasses.mouseenter_operation)
						}
						canvasses.mouseenter_state = false
					}
				}
			} else {
				if(canvasses.mouseenter_state){
					if(canvasses.mouseenter_operation.events.mouseleave){
						canvasses.mouseenter_operation.events.mouseleave(canvasses.mouseenter_operation)
					}
					canvasses.mouseenter_state = false
				}
			}
			if (debug) {
				console.log("mouseenter " + src.id)
			}

			return true
		}
	})

}

canvasses.transparent = function(color) {
	var t = color[3]
	return t == 0
}