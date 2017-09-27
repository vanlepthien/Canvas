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
 * dx: initial speed in the x direction dy: initial speed in the y direction
 * constant: analog of gravitational constant in force equation: default=1
 * mass_1: Mass of the moving object: default=1 mass_2: Mass of the stationary
 * boundary: default=1
 * 
 * @param rt_operation
 */

var deltaV_edge = function(rt_operation) {
	var c_width = rt_operation.canvas.width
	var c_height = rt_operation.canvas.height
	var x = rt_operation.state.x
	var y = rt_operation.state.y
	var x_left = x
	var x_right = x + rt_operation.image.images[0].width
	var y_top = y
	var y_bottom = y + rt_operation.image.images[0].height

	var dx = rt_operation.state.dx || rt_operation.speed.dx
	var dy = rt_operation.state.dy || rt_operation.speed.dy
	var m1 = rt_operation.state.mass_1 || rt_operation.speed.mass_1 || 1
	var m2 = rt_operation.state.mass_2 || rt_operation.speed.mass_2 || 1
	var constant = rt_operation.state.constant
	if (rt_operation.meta.speed) {
		constant = constant || rt_operation.meta.speed.constant
	}
	if (rt_operation.speed) {
		constant = constant || rt_operation.speed.constant
	}
	constant = constant || 1
	var force = function(constant, m1, m2, distance) {
		return constant * m1 * m2 / (distance * distance)
	}
	var acceleration = function(constant, m1, m2, distance) {
		return Math.sign(distance) * force(constant, m1, m2, distance) / m1
	}

	var deltav = function(constant, m1, m2, ordinate, bound) {
		return acceleration(constant, m1, m2, ordinate - bound)
	}

	var ddx = deltav(constant, m1, m2, x_left, 0)
			+ deltav(constant, m1, m2, x_right, c_width)

	var ddy = deltav(constant, m1, m2, y_top, 0)
			+ deltav(constant, m1, m2, y_bottom, c_height)

	dx += ddx
	dy += ddy

	rt_operation.state.dx = dx
	rt_operation.state.dy = dy
	rt_operation.state.constant = constant
	return [ dx, dy ]
}

/**
 * Gets the current index for determining what value is to be used for element
 * rendering Example structure: (in this example, the element refers to an
 * imageset with 3 entries
 * 
 * rt_element: {
 * <ul>
 * <li>imageset: <emph>imageset</emph>
 * <li>template: {
 * <ul>
 * <li>0: {
 * <ul>
 * <li>rotate: {
 * <ul>
 * <li>interval: 100,
 * <li>values: [0,30,60,90,120,150,180,210,240,270,300,330]
 * <li>}
 * </ul>
 * <li>}
 * </ul>
 * <li>1: {
 * <ul>
 * <li>...
 * <li>}
 * </ul>
 * <li>2: {
 * <ul>
 * <li>...
 * <li>}
 * </ul>
 * <li>}
 * </ul>
 * <li>}
 * </ul>
 * 
 * @param rt_operation -
 *            runtime operation
 * @param tick -
 *            current logical time
 * @param field -
 *            the name of the field being indexed
 * @ix index - the index of the item to which a transformation is applied
 */
function getValueIndex(rt_operation, tick, field, ix) {
	if (rt_operation.template && rt_operation.template[ix]
			&& rt_operation.template[ix][field]) {
		var interval = rt_operation.template[ix][field].interval
		var size = rt_operation.template[ix][field].values.size
		return Math.floor((tick / interval) % size)
	}
	return 0;
}

function getViewbox(svg) {
	var viewbox = svg.attributes.getNamedItem("viewBox").value
	var items = viewbox.split(/(?:\s*,s*)|\s+/)
	return items
}

function getWidthFromViewbox(svg) {
	return getViewbox(svg)[2]
}

function getHeightFromViewbox(svg) {
	return getViewbox(svg)[3]
}

function createMetaImageInfo(rt_operation, ix, field, values) {
	if (!rt_operation.meta) {
		rt_operation.meta = {}
	}
	if (!rt_operation.meta.imageformat) {
		rt_operation.meta.imageformat = {}
	}
	if (!rt_operation.meta.imageformat[ix]) {
		rt_operation.meta.imageformat[ix] = {}
	}
	if (!rt_operation.meta.imageformat[ix][field]) {
		rt_operation.meta.imageformat[ix][field] = values
	}
}

function getSVGField(rt_operation, ix, field, initialization, returnValue) {
	createOperationMetaImageinfo(rt_operation, ix, field, initialization)
	return returnValue
}

function generateColorIndex(rt_operation, ix) {
	var operation = rt_operation.configuration
	var interval = operation.template[ix].color.interval
	var size = operation.template[ix].color.values.size
	return Math.floor((tick / interval) % size)
}

function generateRotationIndex(re_element, rt_operation, ix) {
	return getSVGField(
			rt_operation,
			rt_operation,
			ix,
			"rotate",
			initialization,
			rt_operation.meta.imageinfo[ix].field.colors[rt_operation.state.imageinfo[ix].colorIx])
}