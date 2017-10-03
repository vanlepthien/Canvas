/**
 * Calculate delta v from proximity to boundaries. Distance based on edges
 * closest to boundaries instead of element center. While this is a bit of a
 * cheat, it produces satisfying bounce behavior without onerous calculation.
 * 
 * This function adds key-value pairs to the rt_operation.state object.
 * 
 * Behavior can be adjusted by specifying attributes in the configuration
 * operation definition:
 * 
 * 	dx: 	initial speed in the x direction
 *  dy: 	initial speed in the y direction
 *  constant: analog of gravitational constant in force equation: default=1
 *  mass_1: Mass of the moving object: default=1
 *  mass_2: Mass of the stationary boundary: default=1
 * 
 * @param {RuntimeElement}
 *            rt_operation
 * @param {RuntimeOperation}
 *            rt_operation
 */

function deltaV_edge(rt_operation) {
	var c_width = rt_operation.canvas.width
	var c_height = rt_operation.canvas.height
	var x = rt_operation.state.x
	var y = rt_operation.state.y
	var x_left = x
	var x_right = x + rt_operation.imageinfo[0].width
	var y_top = y
	var y_bottom = y + rt_operation.imageinfo[0].height

	var dx = rt_operation.state.dx || rt_operation.configuration.speed.dx
	var dy = rt_operation.state.dy || rt_operation.configuration.speed.dy
	var constant = rt_operation.meta.constant
			|| rt_operation.configuration.speed.constant || 1
	var m1 = rt_operation.state.mass_1
			|| rt_operation.configuration.speed.mass_1 || 1
	var m2 = rt_operation.state.mass_2
			|| rt_operation.configuration.speed.mass_2 || 1
	var constant = rt_operation.state.constant
			|| rt_operation.configuration.speed.constant || 1
	var force = function(m1,m2,distance) {
		return constant * m1 * m2 / (distance * distance)
	}
	var acceleration = function(m1, m2, distance) {
		return Math.sign(distance) * force(m1, m2, distance) / m1
	}

	var deltav = function(m1, m2, ordinate, bound) {
		return acceleration(m1, m2, ordinate - bound)
	}

	var ddx = deltav(m1, m2, x_left, 0) + deltav(m1, m2, x_right, c_width)

	var ddy = deltav( m1, m2, y_top, 0) + deltav(m1, m2, y_bottom, c_height)
	
	dx += ddx
	dy += ddy
	
	rt_operation.state.dx = dx
	rt_operation.state.dy = dy
	rt_operation.meta.constant = constant
	return [ dx, dy ]
}

function getValueIndex(rt_operation, ix){
	var operation = rt_operation.configuration
	var interval = operation.template[ix].color.interval
	var size = operation.template[ix].color.values.size
	return Math.floor((tick / interval) % size)
}

function setSvgImageSize(svg, imageSize){
	$(svg).attr("width",imageSize[0])
	$(svg).attr("height",imageSize[1])
}

function getViewbox(svg){
	var viewbox = svg.attributes.getNamedItem("viewBox").value
	var items = viewbox.split(/(?:\s*,s*)|\s+/)
	return items
}

function getWidthFromViewbox(svg){
	return getViewbox(svg)[2]
}

function getHeightFromViewbox(svg){
	return getViewbox(svg)[3]
}

function createMetaImageInfo(rt_operation, ix, field, values){
	if (!rt_operation.meta) {
		rt_operation.meta = {}
	}
	if (!rt_operation.meta.imageformat) {
		rt_operation.meta.imageformat = {}
	}
	if(!rt_operation.meta.imageformat[ix]){
		rt_operation.meta.imageformat[ix] = {}						
	}
	if(!rt_operation.meta.imageformat[ix][field]){
		rt_operation.meta.imageformat[ix][field] = values						
	}
}

function getSVGField(rt_operation, ix, field, initialization, returnValue) {
	createOperationMetaImageinfo(rt_operation, ix,field, initialization)
	return returnValue
}

function generateColorIndex(rt_operation, ix){
	var operation = rt_operation.configuration
	var interval = operation.template[ix].color.interval
	var size = operation.template[ix].color.values.size
	return Math.floor((tick / interval) % size)
}

function generateRotationIndex(re_element, rt_operation, ix){
	return getSVGField(
		rt_operation,
		rt_operation,
		ix,
		"rotate",
		initialization,
		rt_operation.meta.imageinfo[ix].field.colors[rt_operation.state.imageinfo[ix].colorIx])
	}
