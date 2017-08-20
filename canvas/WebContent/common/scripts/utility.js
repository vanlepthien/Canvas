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
 *            rt_element
 * @param {RuntimeOperation}
 *            rt_element
 */

function deltaV_edge(rt_element, rt_operation) {
	var c_width = rt_element.canvas.width
	var c_height = rt_element.canvas.height
	var x = rt_operation.state.x
	var y = rt_operation.state.y
	var x_left = x
	var x_right = x + rt_element.imageinfo[0].width
	var y_top = y
	var y_bottom = y + rt_element.imageinfo[0].height

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
